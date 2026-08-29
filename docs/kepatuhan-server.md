# Kepatuhan standar produksi — `ionowu-web`

Status 32 langkah wajib sebelum aplikasi boleh berjalan di produksi Ionowu.

Arti kolom status:

- **Selesai** — sudah ada di repo dan sudah diverifikasi.
- **Siap, tunggu server** — kode/konfigurasinya sudah lengkap di repo, tetapi
  baru benar-benar terpenuhi setelah dijalankan atau didaftarkan di server.
- **Di luar repo** — tidak bisa diselesaikan dari repo ini sama sekali.

## Tahap 1 — Pendaftaran

| # | Butir | Status | Catatan |
| --- | --- | --- | --- |
| 1 | Nama aplikasi (§3.4) | Selesai | `ionowu-web`. Dipakai konsisten sebagai prefiks: jaringan `ionowu-web-internal`, database `ionowu_web`, prefiks Redis `ionowu-web:`, `service.name` OTel, dan nama proyek Compose. |
| 2 | Alokasi port di `registry-port.md` (NET-04) | Di luar repo | `APP_PORT` sengaja dibiarkan kosong di `.env.example`. Nomor port tidak boleh dikarang dari sini — harus diambil dari registry. |
| 3 | Pemilik dan rotasi on-call | Di luar repo | Tempatnya sudah disediakan di `docs/runbook.md`, masih `[BELUM ADA]`. |
| 4 | Repositori dari templat standar | Di luar repo | Repo ini lahir dari `create-next-app`, bukan templat standar. Perlu diputuskan: migrasi ke templat, atau pengecualian yang dicatat resmi. |

## Tahap 2 — Kontainerisasi

| # | Butir | Status | Catatan |
| --- | --- | --- | --- |
| 5 | Dockerfile multi-stage (IMG-01) | Selesai | `Dockerfile`: `deps` → `builder` → `migrator` → `runner`. |
| 6 | Base image dikunci digest (IMG-02) | Selesai | Node dan distroless di `Dockerfile`; Postgres dan Redis di `compose.yaml`. |
| 7 | Digest tercatat (IMG-03) | Selesai | Terkumpul di `ARG` paling atas `Dockerfile`. `npm run img:digests` memeriksa apakah masih sinkron dan gagal kalau sudah usang. |
| 8 | `.dockerignore` (IMG-06) | Selesai | Termasuk larangan `.env*` supaya rahasia tidak pernah masuk konteks build. |
| 9 | Ukuran image di bawah ambang (IMG-05) | Selesai | Terukur di CI: **170 MB**. Gerbangnya menggagalkan build kalau terlampaui. **Angka ambang sungguhan belum saya punya** — sementara dipatok 400 MB (`IMAGE_SIZE_LIMIT_MB`); sesuaikan dengan §4. |
| 10 | Kontainer berjalan sebagai UID 65532 (RUN-01) | Selesai | Terverifikasi di CI: `docker inspect` mengembalikan `Config.User = 65532:65532`. Dipasang di stage `runner` dan `migrator`, ditegaskan lagi lewat `user:` di Compose. |

## Tahap 3 — Isolasi

| # | Butir | Status | Catatan |
| --- | --- | --- | --- |
| 11 | `compose.yaml` dari templat §4.5 | Siap, tunggu server | Sudah ditulis dan lulus `docker compose config`. **Templat §4.5 aslinya belum saya lihat** — mohon dibandingkan. |
| 12 | Jaringan `ionowu-web-internal`; hanya yang publik ke `dokploy-network` (ISO-04, ISO-06) | Selesai | Hanya service `web` yang bergabung ke dua jaringan; `postgres`, `redis`, dan `migrate` terkunci di jaringan `internal: true`. |
| 13 | Pendaftaran proyek Dokploy (DEP-10) | Di luar repo | Dilakukan di panel Dokploy. |
| 14 | Database, user, kredensial khusus aplikasi (ISO-08) | Siap, tunggu server | `compose.yaml` memakai database `ionowu_web` dan owner `ionowu_web_owner`; runtime memakai role `ionowu_runtime` (`drizzle/roles/ionowu_runtime.sql`, kini tidak lagi mengunci nama database `neondb`). Pembuatan kredensial sungguhan di server. |
| 15 | Prefiks kunci Redis dan logical database (ISO-09) | Siap, tunggu server | `REDIS_KEY_PREFIX=ionowu-web:` dan logical db `/3` di `.env.example` serta `compose.yaml`. **Aplikasi belum benar-benar memakai Redis** — rate limit saat ini di Postgres. Konvensinya sudah dipatok supaya tidak dikarang belakangan. |
| 16 | Batas sumber daya tiap layanan (RUN-05) | Selesai | `deploy.resources.limits` pada keempat service. |

## Tahap 4 — Data

| # | Butir | Status | Catatan |
| --- | --- | --- | --- |
| 17 | `tenant_id` dan `audit_log` (DAT-08, SEC-10) | Selesai | `audit_logs` sudah ada sejak awal. `tenant_id` ditambahkan ke `users`, `leads`, `lead_notes`, `lead_follow_ups`, `audit_logs`, dan `outbox_events` lewat migrasi `0002`, lengkap dengan tabel `tenants`, FK, dan unique key yang kini bercakupan tenant. |
| 18 | Migrasi sebagai job terpisah (DAT-05) | Selesai | Stage `migrator` + service `migrate`; `web` menunggu `service_completed_successfully`. Migrasi memakai `DATABASE_MIGRATION_URL` (role owner), runtime tidak. |
| 19 | Volume masuk cakupan backup (DAT-04) | Siap, tunggu server | Label `ionowu.backup.*` di ketiga volume. Penjadwal backup di server yang membacanya. |
| 20 | Uji pemulihan dijalankan dan dicatat (DAT-07) | Di luar repo | Prosedur lengkap dan tabel pencatatan ada di `docs/deploy.md`. Belum pernah dijalankan. |

## Tahap 5 — Keamanan

| # | Butir | Status | Catatan |
| --- | --- | --- | --- |
| 21 | Autentikasi ke penyedia OIDC terpusat (SEC-02) | **Belum** | Admin masih login lewat Google OAuth langsung (`src/auth.ts`), bukan penyedia OIDC internal. Butuh issuer, client id/secret, dan keputusan pemetaan klaim → role. Ini satu-satunya butir yang tidak bisa saya majukan tanpa data dari sisi Anda. |
| 22 | Otorisasi di lapisan aplikasi (SEC-03) | Selesai | RBAC di `src/lib/admin/policy.ts`; `requireAdmin(permission)` dipakai rute admin. |
| 23 | Rahasia lewat secret manager; `.env.example` (CFG-03, CFG-04) | Siap, tunggu server | `.env.example` dibuat dan tidak lagi diabaikan Git; nilai sungguhan tetap dilarang masuk repo. Penyambungan ke secret manager dilakukan di Dokploy. |
| 24 | Rate limiting aktif (SEC-05) | Selesai | Sudah ada sebelumnya: atomik di Postgres, bucket global + hash email HMAC, IP hanya dari header proxy yang dipercaya eksplisit. |
| 25 | Trivy tanpa temuan HIGH/CRITICAL (SEC-01) | Selesai | Dua kerentanan HIGH di dependensi npm (`js-yaml`, `nanoid`) ditutup; `npm audit` bersih. Trivy sudah benar-benar dijalankan di CI dan sempat menolak build: base image distroless varian **bookworm** membawa `libssl3` 3.0.18 dengan satu CVE CRITICAL dan lima HIGH. Diperbaiki dengan pindah ke varian **trixie** (OpenSSL 3.5), bukan dengan mendaftarkan pengecualian. |

## Tahap 6 — Observabilitas

| # | Butir | Status | Catatan |
| --- | --- | --- | --- |
| 26 | OpenTelemetry terpasang (OBS-01) | Selesai | `src/instrumentation.ts`, eksporter OTLP standar lewat `OTEL_EXPORTER_OTLP_ENDPOINT` — tidak mengunci vendor mana pun. |
| 27 | `trace_id` di setiap log (OBS-02) | Selesai | `src/lib/observability/log.ts`; seluruh `console.error` sisi server sudah diganti. **Sudah diverifikasi jalan**: permintaan ke `/health/ready` menghasilkan baris log JSON berisi `trace_id` dan `span_id`. |
| 28 | `/health/live` dan `/health/ready` (RUN-08) | Selesai | **Sudah diverifikasi**: `live` membalas 200 tanpa menyentuh dependensi; `ready` membalas 503 dengan rincian pemeriksaan saat env belum lengkap. `live` sengaja tidak memeriksa database supaya database yang mati tidak memicu restart aplikasi yang sebenarnya sehat. |
| 29 | Dashboard dan minimal satu alert (OBS-05) | Siap, tunggu server | `observability/dashboards/ionowu-web.json` dan lima alert di `observability/alerts/ionowu-web.rules.yaml`. Alert hanya memakai metrik blackbox_exporter dan cAdvisor supaya tidak ada alert yang diam-diam tak pernah menyala; target scrape-nya perlu dipasang di server. |
| 30 | Runbook tertaut dari alert (OBS-08) | Selesai | `docs/runbook.md`; judul bagiannya sama persis dengan nama alert, dan setiap alert memuat `runbook_url`. |

## Tahap 7 — Deployment

| # | Butir | Status | Catatan |
| --- | --- | --- | --- |
| 31 | CI membangun, memindai, menandatangani (IMG-12) | Siap, tunggu server | `.github/workflows/ci.yml`: check → audit → build → verifikasi UID & ukuran → Trivy → push → cosign keyless. Langkah sampai Trivy sudah terbukti jalan. Push ke GHCR dan penandatanganan cosign belum pernah berhasil sekali pun — keduanya baru teruji setelah paket `ionowu-web` bisa dibuat di bawah owner repo. |
| 32 | Deploy staging berhasil (DEP-06) | Di luar repo | |
| 33 | Rollback diuji (DEP-04) | Di luar repo | Prosedur dan tabel catatan di `docs/deploy.md`, termasuk aturan migrasi kompatibel-mundur yang membuat rollback aman. |
| 34 | Deployment tanpa downtime (DEP-07) | Siap, tunggu server | Dua replika, `order: start-first`, readiness gate, dan `failure_action: rollback`. Cara membuktikannya ada di `docs/deploy.md`. |
| 35 | Audit kepatuhan §7 lulus penuh | Di luar repo | Menunggu semua butir di atas. |

> Penomoran di tabel mengikuti urutan pengerjaan; beberapa butir asli dipecah
> agar statusnya bisa berbeda (mis. jaringan vs pendaftaran Dokploy).

## Yang saya butuhkan dari sisi Anda

1. **Dokumen standar lengkapnya** (§3.4, §4, §4.5, §7 serta kode NET/IMG/ISO/DAT/SEC/OBS/DEP/CFG/RUN). Saya hanya menerima daftar 32 langkah, jadi beberapa nilai — terutama ambang ukuran image dan bentuk templat `compose.yaml` §4.5 — masih tebakan yang wajar, bukan kutipan standar.
2. **Alokasi port dari `registry-port.md`** untuk mengisi `APP_PORT`.
3. **Detail penyedia OIDC terpusat** (issuer, client, pemetaan klaim ke role) untuk menyelesaikan SEC-02.
4. **Keputusan soal butir 4**: repo ini pindah ke templat standar, atau dicatat sebagai pengecualian.
