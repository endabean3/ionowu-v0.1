import { relations, sql } from "drizzle-orm";
import {
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const adminRole = pgEnum("admin_role", [
  "owner",
  "sales",
  "editor",
  "viewer",
]);

export const userStatus = pgEnum("user_status", ["active", "disabled"]);

export const leadStatus = pgEnum("lead_status", [
  "new",
  "contacted",
  "qualified",
  "proposal",
  "won",
  "lost",
  "archived",
]);

export const leadLocale = pgEnum("lead_locale", ["id", "en", "zh"]);

export const outboxStatus = pgEnum("outbox_status", [
  "pending",
  "processing",
  "retry_wait",
  "sent",
  "failed",
]);

export const outboxEventType = pgEnum("outbox_event_type", [
  "lead.notification_email",
]);

export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    email: varchar("email", { length: 254 }).notNull(),
    name: varchar("name", { length: 160 }),
    role: adminRole("role").notNull().default("viewer"),
    status: userStatus("status").notNull().default("active"),
    lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    emailUnique: uniqueIndex("users_email_unique").on(table.email),
    roleIdx: index("users_role_idx").on(table.role),
    statusIdx: index("users_status_idx").on(table.status),
  }),
);

export const leads = pgTable(
  "leads",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    requestId: varchar("request_id", { length: 80 }).notNull(),
    name: varchar("name", { length: 120 }).notNull(),
    email: varchar("email", { length: 254 }).notNull(),
    company: varchar("company", { length: 160 }),
    serviceType: varchar("service_type", { length: 80 }).notNull(),
    message: text("message").notNull(),
    budgetRange: varchar("budget_range", { length: 80 }),
    locale: leadLocale("locale").notNull(),
    status: leadStatus("status").notNull().default("new"),
    assigneeId: uuid("assignee_id").references(() => users.id, {
      onDelete: "set null",
    }),
    source: varchar("source", { length: 80 }).notNull().default("public_contact_form"),
    version: integer("version").notNull().default(1),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    archivedAt: timestamp("archived_at", { withTimezone: true }),
  },
  (table) => ({
    requestIdUnique: uniqueIndex("leads_request_id_unique").on(table.requestId),
    createdAtIdx: index("leads_created_at_idx").on(table.createdAt),
    statusIdx: index("leads_status_idx").on(table.status),
    assigneeIdx: index("leads_assignee_id_idx").on(table.assigneeId),
    serviceTypeIdx: index("leads_service_type_idx").on(table.serviceType),
    localeIdx: index("leads_locale_idx").on(table.locale),
  }),
);

export const leadNotes = pgTable(
  "lead_notes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    leadId: uuid("lead_id")
      .notNull()
      .references(() => leads.id, { onDelete: "cascade" }),
    authorId: uuid("author_id").references(() => users.id, { onDelete: "set null" }),
    body: text("body").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    leadIdx: index("lead_notes_lead_id_idx").on(table.leadId),
  }),
);

export const leadFollowUps = pgTable(
  "lead_follow_ups",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    leadId: uuid("lead_id")
      .notNull()
      .references(() => leads.id, { onDelete: "cascade" }),
    assigneeId: uuid("assignee_id").references(() => users.id, {
      onDelete: "set null",
    }),
    dueAt: timestamp("due_at", { withTimezone: true }).notNull(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    note: text("note"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    leadIdx: index("lead_follow_ups_lead_id_idx").on(table.leadId),
    assigneeIdx: index("lead_follow_ups_assignee_id_idx").on(table.assigneeId),
    dueAtIdx: index("lead_follow_ups_due_at_idx").on(table.dueAt),
  }),
);

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    actorUserId: uuid("actor_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    actorEmailHash: varchar("actor_email_hash", { length: 64 }),
    action: varchar("action", { length: 120 }).notNull(),
    entityType: varchar("entity_type", { length: 80 }).notNull(),
    entityId: uuid("entity_id"),
    requestId: varchar("request_id", { length: 80 }),
    metadata: jsonb("metadata")
      .$type<Record<string, unknown>>()
      .notNull()
      .default(sql`'{}'::jsonb`),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    entityIdx: index("audit_logs_entity_idx").on(table.entityType, table.entityId),
    requestIdIdx: index("audit_logs_request_id_idx").on(table.requestId),
    createdAtIdx: index("audit_logs_created_at_idx").on(table.createdAt),
  }),
);

export const outboxEvents = pgTable(
  "outbox_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    eventType: outboxEventType("event_type").notNull(),
    status: outboxStatus("status").notNull().default("pending"),
    payload: jsonb("payload").$type<Record<string, unknown>>().notNull(),
    idempotencyKey: varchar("idempotency_key", { length: 160 }).notNull(),
    attempts: integer("attempts").notNull().default(0),
    maxAttempts: integer("max_attempts").notNull().default(5),
    nextAttemptAt: timestamp("next_attempt_at", { withTimezone: true }).defaultNow().notNull(),
    lockedAt: timestamp("locked_at", { withTimezone: true }),
    lastErrorCode: varchar("last_error_code", { length: 120 }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    processedAt: timestamp("processed_at", { withTimezone: true }),
  },
  (table) => ({
    idempotencyUnique: uniqueIndex("outbox_events_idempotency_unique").on(
      table.idempotencyKey,
    ),
    statusNextAttemptIdx: index("outbox_events_status_next_attempt_idx").on(
      table.status,
      table.nextAttemptAt,
    ),
    createdAtIdx: index("outbox_events_created_at_idx").on(table.createdAt),
  }),
);

export const rateLimitBuckets = pgTable(
  "rate_limit_buckets",
  {
    key: varchar("key", { length: 96 }).primaryKey(),
    count: integer("count").notNull().default(1),
    windowStartedAt: timestamp("window_started_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    expiresAtIdx: index("rate_limit_buckets_expires_at_idx").on(table.expiresAt),
  }),
);

export const usersRelations = relations(users, ({ many }) => ({
  assignedLeads: many(leads),
}));

export const leadsRelations = relations(leads, ({ one, many }) => ({
  assignee: one(users, {
    fields: [leads.assigneeId],
    references: [users.id],
  }),
  notes: many(leadNotes),
  followUps: many(leadFollowUps),
}));
