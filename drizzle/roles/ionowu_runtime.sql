-- Run as the database owner. Application login roles should only inherit this
-- group and must not own the database or schema.
DO $role$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'ionowu_runtime') THEN
    CREATE ROLE ionowu_runtime
      NOLOGIN
      NOSUPERUSER
      NOCREATEDB
      NOCREATEROLE
      NOINHERIT
      NOREPLICATION;
  END IF;
END
$role$;

GRANT CONNECT ON DATABASE neondb TO ionowu_runtime;
GRANT USAGE ON SCHEMA public TO ionowu_runtime;

GRANT SELECT, INSERT, UPDATE ON TABLE users TO ionowu_runtime;
GRANT SELECT, INSERT, UPDATE ON TABLE leads TO ionowu_runtime;
GRANT SELECT, INSERT, UPDATE, DELETE
  ON TABLE lead_notes, lead_follow_ups
  TO ionowu_runtime;
GRANT SELECT, INSERT ON TABLE audit_logs TO ionowu_runtime;
GRANT SELECT, INSERT, UPDATE ON TABLE outbox_events TO ionowu_runtime;
GRANT SELECT, INSERT, UPDATE, DELETE
  ON TABLE rate_limit_buckets
  TO ionowu_runtime;
