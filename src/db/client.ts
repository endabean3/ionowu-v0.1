import "server-only";

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@/db/schema";

declare global {
  var ionowuSql: postgres.Sql | undefined;
}

function connectionString() {
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
