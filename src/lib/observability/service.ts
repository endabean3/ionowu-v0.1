/**
 * Identitas layanan untuk seluruh sinyal observabilitas.
 *
 * `ionowu-web` adalah nama aplikasi resmi (§3.4) dan dipakai konsisten sebagai
 * prefiks sumber daya: jaringan `ionowu-web-internal`, database `ionowu_web`,
 * prefiks kunci Redis `ionowu-web:`, dan `service.name` di OpenTelemetry.
 * Dipisah ke modul sendiri supaya aman diimpor dari runtime Node maupun Edge.
 */
export const SERVICE_NAME = process.env.OTEL_SERVICE_NAME || "ionowu-web";

export const SERVICE_VERSION =
  process.env.OTEL_SERVICE_VERSION || process.env.APP_VERSION || "0.0.0-dev";

export const DEPLOY_ENVIRONMENT =
  process.env.DEPLOY_ENVIRONMENT || process.env.NODE_ENV || "development";
