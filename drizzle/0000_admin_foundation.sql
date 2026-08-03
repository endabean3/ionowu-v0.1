CREATE EXTENSION IF NOT EXISTS "pgcrypto";
--> statement-breakpoint
CREATE TYPE "admin_role" AS ENUM ('owner', 'sales', 'editor', 'viewer');
--> statement-breakpoint
CREATE TYPE "user_status" AS ENUM ('active', 'disabled');
--> statement-breakpoint
CREATE TYPE "lead_status" AS ENUM ('new', 'contacted', 'qualified', 'proposal', 'won', 'lost', 'archived');
--> statement-breakpoint
CREATE TYPE "lead_locale" AS ENUM ('id', 'en', 'zh');
--> statement-breakpoint
CREATE TYPE "outbox_status" AS ENUM ('pending', 'processing', 'retry_wait', 'sent', 'failed');
--> statement-breakpoint
CREATE TYPE "outbox_event_type" AS ENUM ('lead.notification_email');
--> statement-breakpoint
CREATE TABLE "users" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "email" varchar(254) NOT NULL,
  "name" varchar(160),
  "role" "admin_role" DEFAULT 'viewer' NOT NULL,
  "status" "user_status" DEFAULT 'active' NOT NULL,
  "last_login_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "leads" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "request_id" varchar(80) NOT NULL,
  "name" varchar(120) NOT NULL,
  "email" varchar(254) NOT NULL,
  "company" varchar(160),
  "service_type" varchar(80) NOT NULL,
  "message" text NOT NULL,
  "budget_range" varchar(80),
  "locale" "lead_locale" NOT NULL,
  "status" "lead_status" DEFAULT 'new' NOT NULL,
  "assignee_id" uuid,
  "source" varchar(80) DEFAULT 'public_contact_form' NOT NULL,
  "version" integer DEFAULT 1 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "archived_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "lead_notes" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "lead_id" uuid NOT NULL,
  "author_id" uuid,
  "body" text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lead_follow_ups" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "lead_id" uuid NOT NULL,
  "assignee_id" uuid,
  "due_at" timestamp with time zone NOT NULL,
  "completed_at" timestamp with time zone,
  "note" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "actor_user_id" uuid,
  "actor_email_hash" varchar(64),
  "action" varchar(120) NOT NULL,
  "entity_type" varchar(80) NOT NULL,
  "entity_id" uuid,
  "request_id" varchar(80),
  "metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "outbox_events" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "event_type" "outbox_event_type" NOT NULL,
  "status" "outbox_status" DEFAULT 'pending' NOT NULL,
  "payload" jsonb NOT NULL,
  "idempotency_key" varchar(160) NOT NULL,
  "attempts" integer DEFAULT 0 NOT NULL,
  "max_attempts" integer DEFAULT 5 NOT NULL,
  "next_attempt_at" timestamp with time zone DEFAULT now() NOT NULL,
  "locked_at" timestamp with time zone,
  "last_error_code" varchar(120),
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "processed_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "leads" ADD CONSTRAINT "leads_assignee_id_users_id_fk" FOREIGN KEY ("assignee_id") REFERENCES "users"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "lead_notes" ADD CONSTRAINT "lead_notes_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "leads"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "lead_notes" ADD CONSTRAINT "lead_notes_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "lead_follow_ups" ADD CONSTRAINT "lead_follow_ups_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "leads"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "lead_follow_ups" ADD CONSTRAINT "lead_follow_ups_assignee_id_users_id_fk" FOREIGN KEY ("assignee_id") REFERENCES "users"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_user_id_users_id_fk" FOREIGN KEY ("actor_user_id") REFERENCES "users"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_unique" ON "users" ("email");
--> statement-breakpoint
CREATE INDEX "users_role_idx" ON "users" ("role");
--> statement-breakpoint
CREATE INDEX "users_status_idx" ON "users" ("status");
--> statement-breakpoint
CREATE UNIQUE INDEX "leads_request_id_unique" ON "leads" ("request_id");
--> statement-breakpoint
CREATE INDEX "leads_created_at_idx" ON "leads" ("created_at");
--> statement-breakpoint
CREATE INDEX "leads_status_idx" ON "leads" ("status");
--> statement-breakpoint
CREATE INDEX "leads_assignee_id_idx" ON "leads" ("assignee_id");
--> statement-breakpoint
CREATE INDEX "leads_service_type_idx" ON "leads" ("service_type");
--> statement-breakpoint
CREATE INDEX "leads_locale_idx" ON "leads" ("locale");
--> statement-breakpoint
CREATE INDEX "lead_notes_lead_id_idx" ON "lead_notes" ("lead_id");
--> statement-breakpoint
CREATE INDEX "lead_follow_ups_lead_id_idx" ON "lead_follow_ups" ("lead_id");
--> statement-breakpoint
CREATE INDEX "lead_follow_ups_assignee_id_idx" ON "lead_follow_ups" ("assignee_id");
--> statement-breakpoint
CREATE INDEX "lead_follow_ups_due_at_idx" ON "lead_follow_ups" ("due_at");
--> statement-breakpoint
CREATE INDEX "audit_logs_entity_idx" ON "audit_logs" ("entity_type", "entity_id");
--> statement-breakpoint
CREATE INDEX "audit_logs_request_id_idx" ON "audit_logs" ("request_id");
--> statement-breakpoint
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs" ("created_at");
--> statement-breakpoint
CREATE UNIQUE INDEX "outbox_events_idempotency_unique" ON "outbox_events" ("idempotency_key");
--> statement-breakpoint
CREATE INDEX "outbox_events_status_next_attempt_idx" ON "outbox_events" ("status", "next_attempt_at");
--> statement-breakpoint
CREATE INDEX "outbox_events_created_at_idx" ON "outbox_events" ("created_at");
