import "server-only";

import { eq } from "drizzle-orm";
import { Resend } from "resend";
import { db, sqlClientRaw } from "@/db/client";
import { outboxEvents } from "@/db/schema";

type NotificationPayload = {
  notification?: Record<string, unknown>;
};

type ValidEmailNotification = {
  from: string;
  to: string;
  replyTo: string;
  subject: string;
  html: string;
};

type ClaimedEvent = {
  id: string;
  payload: NotificationPayload;
  attempts: number;
  max_attempts: number;
};

function getEmailNotification(
  payload: NotificationPayload,
): ValidEmailNotification | null {
  const notification = payload.notification;
  if (
    !notification ||
    typeof notification.from !== "string" ||
    typeof notification.to !== "string" ||
    typeof notification.replyTo !== "string" ||
    typeof notification.subject !== "string" ||
    typeof notification.html !== "string"
  ) {
    return null;
  }

  return {
    from: notification.from,
    to: notification.to,
    replyTo: notification.replyTo,
    subject: notification.subject,
    html: notification.html,
  };
}

function retryDelayMs(attempts: number) {
  const minutes = Math.min(60, 2 ** Math.max(0, attempts));
  return minutes * 60 * 1000;
}

async function claimOutboxEvents(limit: number): Promise<ClaimedEvent[]> {
  const rows = await sqlClientRaw`
    UPDATE outbox_events
    SET status = 'processing',
        locked_at = now(),
        updated_at = now()
    WHERE id IN (
      SELECT id
      FROM outbox_events
      WHERE event_type = 'lead.notification_email'
        AND (
          status IN ('pending', 'retry_wait')
          OR (status = 'processing' AND locked_at < now() - interval '10 minutes')
        )
        AND next_attempt_at <= now()
      ORDER BY created_at ASC
      FOR UPDATE SKIP LOCKED
      LIMIT ${limit}
    )
    RETURNING id, payload, attempts, max_attempts
  `;

  return rows as unknown as ClaimedEvent[];
}

async function claimOutboxEvent(eventId: string): Promise<ClaimedEvent[]> {
  const rows = await sqlClientRaw`
    UPDATE outbox_events
    SET status = 'processing',
        locked_at = now(),
        updated_at = now()
    WHERE id = ${eventId}
      AND event_type = 'lead.notification_email'
      AND (
        status IN ('pending', 'retry_wait')
        OR (status = 'processing' AND locked_at < now() - interval '10 minutes')
      )
      AND next_attempt_at <= now()
    RETURNING id, payload, attempts, max_attempts
  `;

  return rows as unknown as ClaimedEvent[];
}

async function markSent(id: string) {
  await db
    .update(outboxEvents)
    .set({
      status: "sent",
      lockedAt: null,
      lastErrorCode: null,
      processedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(outboxEvents.id, id));
}

async function markFailedOrRetry(
  event: ClaimedEvent,
  errorCode: string,
) {
  const nextAttempts = event.attempts + 1;
  const terminal = nextAttempts >= event.max_attempts;

  await db
    .update(outboxEvents)
    .set({
      status: terminal ? "failed" : "retry_wait",
      attempts: nextAttempts,
      lockedAt: null,
      lastErrorCode: errorCode.slice(0, 120),
      nextAttemptAt: terminal
        ? new Date()
        : new Date(Date.now() + retryDelayMs(nextAttempts)),
      updatedAt: new Date(),
    })
    .where(eq(outboxEvents.id, event.id));
}

async function processClaimedEvents(events: ClaimedEvent[]) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY belum diisi.");
  }

  const resend = new Resend(apiKey);
  let sent = 0;
  let retrying = 0;
  let failed = 0;

  for (const event of events) {
    const notification = getEmailNotification(event.payload);

    if (!notification) {
      await markFailedOrRetry(event, "invalid_payload");
      failed += 1;
      continue;
    }

    try {
      const { error } = await resend.emails.send({
        from: notification.from,
        to: notification.to,
        replyTo: notification.replyTo,
        subject: notification.subject,
        html: notification.html,
      });

      if (error) {
        await markFailedOrRetry(event, "resend_rejected");
        if (event.attempts + 1 >= event.max_attempts) failed += 1;
        else retrying += 1;
        continue;
      }

      await markSent(event.id);
      sent += 1;
    } catch {
      await markFailedOrRetry(event, "resend_exception");
      if (event.attempts + 1 >= event.max_attempts) failed += 1;
      else retrying += 1;
    }
  }

  return {
    claimed: events.length,
    sent,
    retrying,
    failed,
  };
}

export async function processResendOutbox(limit = 10) {
  const events = await claimOutboxEvents(Math.max(1, Math.min(limit, 50)));
  return processClaimedEvents(events);
}

export async function processResendOutboxEvent(eventId: string) {
  const events = await claimOutboxEvent(eventId);
  const result = await processClaimedEvents(events);
  const [event] = await db
    .select({ status: outboxEvents.status })
    .from(outboxEvents)
    .where(eq(outboxEvents.id, eventId))
    .limit(1);

  if (!event) {
    throw new Error("outbox-event-not-found");
  }

  return {
    ...result,
    status: event.status,
    delivered: event.status === "sent",
  };
}
