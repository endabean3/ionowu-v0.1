import { trace } from "@opentelemetry/api";

import {
  DEPLOY_ENVIRONMENT,
  SERVICE_NAME,
  SERVICE_VERSION,
} from "@/lib/observability/service";

/**
 * Logger terstruktur satu baris JSON.
 *
 * OBS-02 mewajibkan `trace_id` muncul di SETIAP log supaya baris log bisa
 * ditarik ke trace-nya di dashboard. Karena itu logging aplikasi tidak lagi
 * lewat `console.error` langsung: nilai trace diambil dari span aktif yang
 * dipasang OpenTelemetry (lihat src/instrumentation.ts).
 *
 * Aturan isi: JANGAN memasukkan data pribadi mentah (email, nama, isi pesan)
 * ke dalam `fields`. Pakai hash atau id kalau perlu mengaitkan baris log.
 */

type Level = "debug" | "info" | "warn" | "error";

type Fields = Record<string, unknown>;

const LEVEL_ORDER: Record<Level, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

function minimumLevel(): number {
  const configured = (process.env.LOG_LEVEL ?? "").toLowerCase();
  if (configured in LEVEL_ORDER) {
    return LEVEL_ORDER[configured as Level];
  }
  return process.env.NODE_ENV === "production"
    ? LEVEL_ORDER.info
    : LEVEL_ORDER.debug;
}

function activeTraceContext(): Fields {
  const span = trace.getActiveSpan();
  if (!span) return {};

  const context = span.spanContext();
  // Trace id kosong (semua nol) berarti belum ada trace sungguhan; lebih baik
  // tidak menulis field-nya sama sekali daripada menulis nilai palsu.
  if (!context.traceId || /^0+$/.test(context.traceId)) return {};

  return { trace_id: context.traceId, span_id: context.spanId };
}

function write(level: Level, event: string, fields: Fields = {}) {
  if (LEVEL_ORDER[level] < minimumLevel()) return;

  const line = JSON.stringify({
    level,
    event,
    time: new Date().toISOString(),
    service: SERVICE_NAME,
    version: SERVICE_VERSION,
    env: DEPLOY_ENVIRONMENT,
    ...activeTraceContext(),
    ...fields,
  });

  if (level === "error" || level === "warn") {
    console.error(line);
  } else {
    console.log(line);
  }
}

/** Ringkas error jadi field aman — tanpa membocorkan isi permintaan. */
export function errorFields(err: unknown): Fields {
  if (err instanceof Error) {
    return {
      error_name: err.name,
      error_message: err.message,
      ...(process.env.NODE_ENV === "production" ? {} : { error_stack: err.stack }),
    };
  }
  return { error_name: "unknown", error_message: String(err) };
}

export const log = {
  debug: (event: string, fields?: Fields) => write("debug", event, fields),
  info: (event: string, fields?: Fields) => write("info", event, fields),
  warn: (event: string, fields?: Fields) => write("warn", event, fields),
  error: (event: string, fields?: Fields) => write("error", event, fields),
};
