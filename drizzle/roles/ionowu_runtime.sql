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

-- ISO-08: nama database berbeda antar lingkungan (produksi memakai
-- `ionowu_web`, Neon lama memakai `neondb`). GRANT CONNECT menuntut nama
-- literal, jadi diambil dari database tempat skrip ini dijalankan supaya
-- tidak ada lagi nama yang di-hardcode dan salah sasaran.
DO $grant$
BEGIN
  EXECUTE format(
    'GRANT CONNECT ON DATABASE %I TO ionowu_runtime',
    current_database()
  );
END
$grant$;

GRANT USAGE ON SCHEMA public TO ionowu_runtime;

-- Runtime hanya BOLEH membaca daftar tenant. Membuat atau mengubah tenant
-- adalah operasi administratif, bukan sesuatu yang boleh dilakukan proses
-- yang melayani permintaan publik (DAT-08).
GRANT SELECT ON TABLE tenants TO ionowu_runtime;

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
