CREATE TABLE "tenants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(64) NOT NULL,
	"name" varchar(160) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
-- Tenant Ionowu harus ADA sebelum foreign key di bawah dipasang: kolom
-- tenant_id memakai DEFAULT id ini, jadi seluruh baris lama langsung
-- menunjuk ke sini. Tanpa baris ini, ADD CONSTRAINT akan ditolak.
INSERT INTO "tenants" ("id", "slug", "name")
VALUES ('4f6b1c8a-3d21-4f0e-9c7a-2b5e8d0a1f33', 'ionowu', 'Ionowu')
ON CONFLICT ("id") DO NOTHING;
--> statement-breakpoint
DROP INDEX "audit_logs_entity_idx";--> statement-breakpoint
DROP INDEX "audit_logs_request_id_idx";--> statement-breakpoint
DROP INDEX "audit_logs_created_at_idx";--> statement-breakpoint
DROP INDEX "lead_follow_ups_lead_id_idx";--> statement-breakpoint
DROP INDEX "lead_follow_ups_assignee_id_idx";--> statement-breakpoint
DROP INDEX "lead_follow_ups_due_at_idx";--> statement-breakpoint
DROP INDEX "lead_notes_lead_id_idx";--> statement-breakpoint
DROP INDEX "leads_request_id_unique";--> statement-breakpoint
DROP INDEX "leads_created_at_idx";--> statement-breakpoint
DROP INDEX "leads_status_idx";--> statement-breakpoint
DROP INDEX "leads_assignee_id_idx";--> statement-breakpoint
DROP INDEX "leads_service_type_idx";--> statement-breakpoint
DROP INDEX "leads_locale_idx";--> statement-breakpoint
DROP INDEX "outbox_events_idempotency_unique";--> statement-breakpoint
DROP INDEX "users_email_unique";--> statement-breakpoint
DROP INDEX "users_role_idx";--> statement-breakpoint
DROP INDEX "users_status_idx";--> statement-breakpoint
ALTER TABLE "audit_logs" ADD COLUMN "tenant_id" uuid DEFAULT '4f6b1c8a-3d21-4f0e-9c7a-2b5e8d0a1f33' NOT NULL;--> statement-breakpoint
ALTER TABLE "lead_follow_ups" ADD COLUMN "tenant_id" uuid DEFAULT '4f6b1c8a-3d21-4f0e-9c7a-2b5e8d0a1f33' NOT NULL;--> statement-breakpoint
ALTER TABLE "lead_notes" ADD COLUMN "tenant_id" uuid DEFAULT '4f6b1c8a-3d21-4f0e-9c7a-2b5e8d0a1f33' NOT NULL;--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "tenant_id" uuid DEFAULT '4f6b1c8a-3d21-4f0e-9c7a-2b5e8d0a1f33' NOT NULL;--> statement-breakpoint
ALTER TABLE "outbox_events" ADD COLUMN "tenant_id" uuid DEFAULT '4f6b1c8a-3d21-4f0e-9c7a-2b5e8d0a1f33' NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "tenant_id" uuid DEFAULT '4f6b1c8a-3d21-4f0e-9c7a-2b5e8d0a1f33' NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "tenants_slug_unique" ON "tenants" USING btree ("slug");--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lead_follow_ups" ADD CONSTRAINT "lead_follow_ups_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lead_notes" ADD CONSTRAINT "lead_notes_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leads" ADD CONSTRAINT "leads_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "outbox_events" ADD CONSTRAINT "outbox_events_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "audit_logs_tenant_entity_idx" ON "audit_logs" USING btree ("tenant_id","entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "audit_logs_tenant_request_id_idx" ON "audit_logs" USING btree ("tenant_id","request_id");--> statement-breakpoint
CREATE INDEX "audit_logs_tenant_created_at_idx" ON "audit_logs" USING btree ("tenant_id","created_at");--> statement-breakpoint
CREATE INDEX "lead_follow_ups_tenant_lead_id_idx" ON "lead_follow_ups" USING btree ("tenant_id","lead_id");--> statement-breakpoint
CREATE INDEX "lead_follow_ups_tenant_assignee_id_idx" ON "lead_follow_ups" USING btree ("tenant_id","assignee_id");--> statement-breakpoint
CREATE INDEX "lead_follow_ups_tenant_due_at_idx" ON "lead_follow_ups" USING btree ("tenant_id","due_at");--> statement-breakpoint
CREATE INDEX "lead_notes_tenant_lead_id_idx" ON "lead_notes" USING btree ("tenant_id","lead_id");--> statement-breakpoint
CREATE UNIQUE INDEX "leads_tenant_request_id_unique" ON "leads" USING btree ("tenant_id","request_id");--> statement-breakpoint
CREATE INDEX "leads_tenant_created_at_idx" ON "leads" USING btree ("tenant_id","created_at");--> statement-breakpoint
CREATE INDEX "leads_tenant_status_created_at_idx" ON "leads" USING btree ("tenant_id","status","created_at");--> statement-breakpoint
CREATE INDEX "leads_tenant_assignee_id_idx" ON "leads" USING btree ("tenant_id","assignee_id");--> statement-breakpoint
CREATE INDEX "leads_tenant_service_type_idx" ON "leads" USING btree ("tenant_id","service_type");--> statement-breakpoint
CREATE INDEX "leads_tenant_locale_idx" ON "leads" USING btree ("tenant_id","locale");--> statement-breakpoint
CREATE UNIQUE INDEX "outbox_events_tenant_idempotency_unique" ON "outbox_events" USING btree ("tenant_id","idempotency_key");--> statement-breakpoint
CREATE UNIQUE INDEX "users_tenant_email_unique" ON "users" USING btree ("tenant_id","email");--> statement-breakpoint
CREATE INDEX "users_tenant_role_idx" ON "users" USING btree ("tenant_id","role");--> statement-breakpoint
CREATE INDEX "users_tenant_status_idx" ON "users" USING btree ("tenant_id","status");