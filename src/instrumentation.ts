import { registerOTel } from "@vercel/otel";

import {
  DEPLOY_ENVIRONMENT,
  SERVICE_NAME,
  SERVICE_VERSION,
} from "@/lib/observability/service";

/**
 * OBS-01 — OpenTelemetry dipasang di titik masuk resmi Next.js.
 *
 * `register()` dipanggil sekali per instance server, sebelum request pertama
 * dilayani. Eksporter memakai OTLP/HTTP standar, jadi endpoint kolektor cukup
 * diatur lewat variabel lingkungan `OTEL_EXPORTER_OTLP_ENDPOINT` — tidak ada
 * vendor yang dikunci di dalam kode.
 *
 * Kalau endpoint kosong (mis. di mesin lokal), OTel tetap aktif tetapi span
 * tidak dikirim ke mana-mana. Itu disengaja: `trace_id` tetap terbentuk
 * sehingga log lokal punya bentuk yang sama persis dengan log produksi.
 */
export function register() {
  registerOTel({
    serviceName: SERVICE_NAME,
    attributes: {
      "service.version": SERVICE_VERSION,
      "deployment.environment.name": DEPLOY_ENVIRONMENT,
    },
  });
}
