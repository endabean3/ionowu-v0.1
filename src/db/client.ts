import "server-only";

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@/db/schema";
import { log } from "@/lib/observability/log";

declare global {
  var ionowuSql: postgres.Sql | undefined;
}

function connectionString() {
  if (!process.env.DATABASE_URL) {
    // Sengaja TIDAK dilempar sebagai error di sini — modul ini diimpor
    // secara statis oleh rute yang harus tetap bisa membalas 503 dengan
    // sopan kalau database belum dikonfigurasi (lihat isContactPipelineConfigured()
    // di src/lib/leads/env.ts). Melempar error di sini akan membuat rute itu
    // sendiri gagal dimuat, bukan cuma menolak permintaan dengan rapi.
    // Peringatan ini supaya kalau nanti ada query yang benar-benar jalan,
    // errornya jelas ("DATABASE_URL belum diisi") — bukan "connection
    // refused ke 127.0.0.1" yang menyesatkan dan bisa menghabiskan waktu
    // menelusuri masalah di server sungguhan.
    log.error("db.database_url_kosong", {
      detail:
        "Query database akan gagal sampai DATABASE_URL diisi lewat secret manager / .env.local.",
    });
  }
  return process.env.DATABASE_URL ?? "postgres://missing:missing@127.0.0.1:5432/missing";
}

function createSqlClient() {
  return postgres(connectionString(), {
    max: Number(process.env.DATABASE_POOL_MAX ?? 5),
    ssl: process.env.DATABASE_SSL === "disable" ? false : "require",
    prepare: false,
  });
}

const sqlClient = globalThis.ionowuSql ?? createSqlClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.ionowuSql = sqlClient;
}

export const sqlClientRaw = sqlClient;
export const db = drizzle(sqlClient, { schema });
