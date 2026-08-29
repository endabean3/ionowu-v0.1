import "server-only";

import { and, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { auditLogs, leads, outboxEvents } from "@/db/schema";
import { currentTenantId } from "@/db/tenant";
import type { Locale } from "@/lib/i18n";

export type LeadIntakeInput = {
  requestId: string;
  name: string;
  email: string;
  company: string;
  serviceType: string;
  serviceLabel: string;
  message: string;
  budgetRange: string;
  locale: Locale;
  emailNotification: {
    from: string;
    to: string;
    replyTo: string;
    subject: string;
    html: string;
  };
};

export type LeadIntakeResult = {
  leadId: string;
  outboxEventId: string;
  duplicate: boolean;
};

export async function createLeadIntake(
  input: LeadIntakeInput,
): Promise<LeadIntakeResult> {
  const tenantId = currentTenantId();

  return db.transaction(async (tx) => {
    const [insertedLead] = await tx
      .insert(leads)
      .values({
        tenantId,
        requestId: input.requestId,
        name: input.name,
        email: input.email,
        company: input.company || null,
        serviceType: input.serviceType,
        message: input.message,
        budgetRange: input.budgetRange || null,
        locale: input.locale,
      })
      .onConflictDoNothing({
        // Harus persis sama dengan unique index (tenant_id, request_id);
        // kalau tidak, Postgres tidak menemukan arbiter dan insert ganda
        // meledak jadi error, bukan diam-diam dilewati seperti yang dimaui.
        target: [leads.tenantId, leads.requestId],
      })
      .returning({ id: leads.id });

    let leadId = insertedLead?.id;

    if (!leadId) {
      const [existingLead] = await tx
        .select({ id: leads.id })
        .from(leads)
        .where(
          and(eq(leads.tenantId, tenantId), eq(leads.requestId, input.requestId)),
        )
        .limit(1);

      if (!existingLead) {
        throw new Error("lead-idempotency-conflict");
      }

      leadId = existingLead.id;
    }

    if (insertedLead) {
      await tx.insert(auditLogs).values({
        tenantId,
        action: "lead.created",
        entityType: "lead",
        entityId: leadId,
        requestId: input.requestId,
        metadata: {
          source: "public_contact_form",
          locale: input.locale,
          service_type: input.serviceType,
        },
      });
    }

    const idempotencyKey = `lead.notification_email:${input.requestId}`;
    const [insertedOutboxEvent] = await tx
      .insert(outboxEvents)
      .values({
        tenantId,
        eventType: "lead.notification_email",
        idempotencyKey,
        payload: {
          lead_id: leadId,
          request_id: input.requestId,
          notification: input.emailNotification,
        },
      })
      .onConflictDoNothing({
        target: [outboxEvents.tenantId, outboxEvents.idempotencyKey],
      })
      .returning({ id: outboxEvents.id });

    let outboxEventId = insertedOutboxEvent?.id;
    if (!outboxEventId) {
      const [existingOutboxEvent] = await tx
        .select({ id: outboxEvents.id })
        .from(outboxEvents)
        .where(
          and(
            eq(outboxEvents.tenantId, tenantId),
            eq(outboxEvents.idempotencyKey, idempotencyKey),
          ),
        )
        .limit(1);
      outboxEventId = existingOutboxEvent?.id;
    }

    if (!outboxEventId) {
      throw new Error("outbox-idempotency-conflict");
    }

    return {
      leadId,
      outboxEventId,
      duplicate: !insertedLead,
    };
  });
}
