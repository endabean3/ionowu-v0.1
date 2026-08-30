# Kepatuhan standar produksi — `ionowu-web`

Status langkah wajib sebelum aplikasi boleh berjalan di produksi Ionowu.

**Diperiksa langsung di produksi pada 30 Agustus 2026** — host `srv1882569`
(`76.13.16.85`), proyek Dokploy `ionowu-web-cfa7zz`, image dari commit
`586eb73`. Baris yang bertanda *Terverifikasi di produksi* berisi hasil
pemeriksaan di server itu, bukan pembacaan berkas di repo.

Arti kolom status:

- **Terverifikasi di produksi** — sudah dibuktikan langsung di server.
- **Selesai** — sudah ada di repo dan diverifikasi lokal atau di CI.
- **Siap, tunggu server** — konfigurasinya lengkap di repo, tetapi baru
  terpenuhi setelah dipasang atau didaftarkan di server.
- **Sebagian** — sudah berjalan, tetapi belum menutup seluruh maksud butirnya.
- **Belum** — ada celah nyata yang masih terbuka.
- **Di luar repo** — tidak bisa diselesaikan dari repo ini sama sekali.

## Tahap 1 — Pendaftaran

| # | Butir | Status | Catatan |
| --- | --- | --- | --- |
| 1 | Nama aplikasi (§3.4) | Terverifikasi di produksi | `ionowu-web`, dipakai konsisten sebagai prefiks: database `ionowu_web`, role `ionowu_web_owner` dan `ionowu_web_runtime`, prefiks Redis `ionowu-web:`, `service.name` OTel, dan nama proyek Compose. Lapisan datanya memakai jaringan bersama `ionowu-data`, bukan jaringan per aplikasi. |
| 2 | Alokasi port di `registry-port.md` (NET-04) | Di luar repo | `APP_PORT` sengaja dibiarkan kosong di `.env.example`. Kontainer web tidak mempublikasikan port apa pun ke host — seluruh trafik lewat Traefik — jadi kebutuhan port host mungkin memang nihil. Perlu dikonfirmasi ke registry. |
| 3 | Pemilik dan rotasi on-call | Di luar repo | Tempatnya sudah disediakan di `docs/runbook.md`, masih `[BELUM ADA]`. |
| 4 | Repositori dari templat standar | Di luar repo | Repo ini lahir dari `create-next-app`, bukan templat standar. Perlu diputuskan: migrasi ke templat, atau pengecualian yang dicatat resmi. |

## Tahap 2 — Kontainerisasi

| # | Butir | Status | Catatan |
| --- | --- | --- | --- |
| 5 | Dockerfile multi-stage (IMG-01) | Selesai | `Dockerfile`: `deps` → `builder` → `migrator` → `runner`. |
| 6 | Base image dikunci digest (IMG-02) | Selesai | Node dan distroless di `Dockerfile`. Sejak Postgres dan Redis keluar dari stack ini (DEP-13), `compose.yaml` tidak lagi memuat image pihak ketiga yang perlu dikunci. |
| 7 | Digest tercatat (IMG-03) | Selesai | Terkumpul di `ARG` paling atas `Dockerfile`. `npm run img:digests` memeriksa apakah masih sinkron dan gagal kalau sudah usang. |
| 8 | `.dockerignore` (IMG-06) | Selesai | Termasuk larangan `.env*` supaya rahasia tidak pernah masuk konteks build. |
| 9 | Ukuran image di bawah ambang (IMG-05) | Selesai | Terukur di CI: **178 MB**. Gerbangnya menggagalkan build kalau terlampaui. **Angka ambang sungguhan belum saya punya** — sementara dipatok 400 MB (`IMAGE_SIZE_LIMIT_MB`); sesuaikan dengan §4. |
| 10 | Kontainer berjalan sebagai UID 65532 (RUN-01) | Terverifikasi di produksi | `docker inspect` pada kontainer yang sedang melayani: `User=65532:65532`, `ReadOnly=true`. Sama dengan hasil gerbang CI. |

## Tahap 3 — Isolasi

| # | Butir | Status | Catatan |
| --- | --- | --- | --- |
| 11 | `compose.yaml` dari templat §4.5 | Siap, tunggu server | Versi awal saya keliru untuk lingkungan ini — mengasumsikan Postgres dan Redis per aplikasi. Dikoreksi lewat PR #2 (`586eb73`) menjadi cluster data bersama, deploy wajib digest, dan log driver `local`. **Templat §4.5 aslinya masih belum saya lihat**, begitu juga `infra/lint-compose.sh` yang disebut di pesan commit PR #2 — keduanya tidak ada di repo maupun di server. |
| 12 | Isolasi jaringan (ISO-04, ISO-06) | Terverifikasi di produksi | Diperiksa per kontainer di server: `ionowu-postgres`, `ionowu-redis`, dan `ionowu-pgbouncer` **hanya** ada di `ionowu-data`; hanya kedua replika web yang menyentuh `dokploy-network`. Tidak ada satu pun port yang dipublikasikan ke host. |
| 13 | Pendaftaran proyek Dokploy (DEP-10) | Terverifikasi di produksi | Dua proyek terdaftar dan berjalan: `ionowu-web-cfa7zz` (2 service) dan `ionowu-data-zdexfw` (3 service). |
| 14 | Database, user, kredensial khusus aplikasi (ISO-08) | Terverifikasi di produksi | Database `ionowu_web` ada dan terpisah dari `billing` di cluster yang sama. Owner `ionowu_web_owner` (limit 20), runtime `ionowu_web_runtime` (limit 40) yang mewarisi grup `ionowu_runtime` — sesuai `drizzle/roles/ionowu_runtime.sql`. Isolasinya di tingkat database dan role, bukan proses (ADR-015). |
| 15 | Akses lewat PgBouncer (DAT-09) | Terverifikasi di produksi | `ionowu-pgbouncer` berjalan sehat di `ionowu-data`; aplikasi tidak pernah menyentuh Postgres langsung. |
| 16 | Prefiks kunci Redis dan logical database (ISO-09) | Siap, tunggu server | Konvensi `REDIS_KEY_PREFIX=ionowu-web:` dan logical db `/3` sudah dipatok di `.env.example`. **Aplikasi belum benar-benar memakai Redis** — rate limit masih di Postgres. Konvensinya dipatok lebih dulu supaya tidak dikarang belakangan. |
| 17 | Batas sumber daya tiap layanan (RUN-05) | Terverifikasi di produksi | `docker inspect` kontainer web: `NanoCpus=1000000000` (1,0 CPU) dan `Memory=805306368` (768 MB), persis seperti di `compose.yaml`. |
| 18 | Driver log hemat IOPS (RUN-16) | Terverifikasi di produksi | Kontainer web memakai driver `local` dengan `max-size=10m`, `max-file=3`. |

## Tahap 4 — Data

| # | Butir | Status | Catatan |
| --- | --- | --- | --- |
| 19 | `tenant_id` dan `audit_log` (DAT-08, SEC-10) | Terverifikasi di produksi | Di database `ionowu_web`: tabel `tenants` berisi baris `4f6b1c8a…` / `ionowu` / `Ionowu`; kolom `tenant_id` ada di keenam tabel (`users`, `leads`, `lead_notes`, `lead_follow_ups`, `audit_logs`, `outbox_events`); 19 indeks bercakupan tenant terbentuk, termasuk `leads_tenant_request_id_unique` dan `outbox_events_tenant_idempotency_unique`. |
| 20 | Migrasi sebagai job terpisah (DAT-05) | Terverifikasi di produksi | `drizzle.__drizzle_migrations` mencatat 3 migrasi, terakhir 29 Agu 2026 13:09 UTC. Service `migrate` memakai `DATABASE_MIGRATION_URL` (role owner); runtime tidak. **Catatan penting dari PR #2:** ini sah hanya di Dokploy tipe Compose, yang menghormati `depends_on: service_completed_successfully`. Kalau kelak pindah ke tipe Application (Swarm), `depends_on` diabaikan diam-diam dan migrasi harus pindah ke pre-deploy di host. |
| 21 | Volume masuk cakupan backup (DAT-04) | Selesai | Stack ini kini hanya punya satu volume, `ionowu-web-next-cache`, berlabel `ionowu.backup: "false"` karena isinya cache turunan yang bisa dibangun ulang. Volume data sungguhan milik proyek `ionowu-data` — cakupan backup-nya di luar repo ini. |
| 22 | Uji pemulihan dijalankan dan dicatat (DAT-07) | Di luar repo | Prosedur lengkap dan tabel pencatatan ada di `docs/deploy.md`. Belum pernah dijalankan. |

## Tahap 5 — Keamanan

| # | Butir | Status | Catatan |
| --- | --- | --- | --- |
| 23 | Autentikasi ke penyedia OIDC terpusat (SEC-02) | **Belum** | Admin masih login lewat Google OAuth langsung (`src/auth.ts`), bukan penyedia OIDC internal. Butuh issuer, client id/secret, dan keputusan pemetaan klaim → role. |
| 24 | Otorisasi di lapisan aplikasi (SEC-03) | Terverifikasi di produksi | RBAC di `src/lib/admin/policy.ts`; `requireAdmin(permission)` dipakai rute admin. Diuji dari luar: `GET /admin` membalas 307 ke `/admin/login`, dan `POST /api/cron/outbox` tanpa header otorisasi membalas 401. |
| 25 | Rahasia lewat secret manager; `.env.example` (CFG-03, CFG-04) | Siap, tunggu server | `.env.example` dibuat dan tidak lagi diabaikan Git; nilai sungguhan tetap dilarang masuk repo. Env kontainer produksi terisi dari Dokploy — `/health/ready` melaporkan `contact_pipeline` dan `admin_auth` dua-duanya lulus, jadi seluruh variabel wajib memang sudah terpasok. |
| 26 | Rate limiting aktif (SEC-05) | Selesai | Atomik di Postgres, bucket global + hash email HMAC, IP hanya dari header proxy yang dipercaya eksplisit. |
| 27 | Trivy tanpa temuan HIGH/CRITICAL (SEC-01) | Selesai | Dua kerentanan HIGH di dependensi npm (`js-yaml`, `nanoid`) ditutup; `npm audit` bersih. Trivy sudah dijalankan di CI dan sempat menolak build: base image distroless varian **bookworm** membawa `libssl3` 3.0.18 dengan satu CVE CRITICAL dan lima HIGH. Diperbaiki dengan pindah ke varian **trixie** (OpenSSL 3.5), bukan dengan mendaftarkan pengecualian. |

## Tahap 6 — Observabilitas

| # | Butir | Status | Catatan |
| --- | --- | --- | --- |
| 28 | OpenTelemetry terpasang (OBS-01) | **Belum** | Kodenya siap (`src/instrumentation.ts`, eksporter OTLP standar), tetapi di produksi `OTEL_EXPORTER_OTLP_ENDPOINT` **kosong** dan tidak ada satu pun kontainer kolektor di host. Artinya tidak ada trace yang benar-benar keluar dari aplikasi. Butuh kolektor OTLP dan pengisian variabel itu di Dokploy. |
| 29 | `trace_id` di setiap log (OBS-02) | Selesai | `src/lib/observability/log.ts`; seluruh `console.error` sisi server sudah diganti. Diverifikasi lokal: permintaan ke `/health/ready` menghasilkan baris log JSON berisi `trace_id` dan `span_id`. |
| 30 | `/health/live` dan `/health/ready` (RUN-08) | Terverifikasi di produksi | `https://ionowu.com/health/live` membalas 200 tanpa menyentuh dependensi. `/health/ready` membalas 200 `ready` dengan ketiga pemeriksaan lulus (`database`, `contact_pipeline`, `admin_auth`), header `cache-control: no-store`. Healthcheck kontainer juga `exit=0`. `live` sengaja tidak memeriksa database supaya database yang mati tidak memicu restart aplikasi yang sebenarnya sehat. |
| 31 | Dashboard dan minimal satu alert (OBS-05) | **Sebagian** | Stack `ionowu-monitoring` berjalan di host (`observability/compose.monitoring.yaml`): Prometheus v3.14.0, blackbox_exporter v0.28.0, cAdvisor v0.55.1 — ketiganya `healthy`, ketiga target `up`. **Kelima aturan alert kini punya data nyata**: probe `probe_success=1`, pemakaian memori 8–9% dari batas, umur kontainer terbaca. **Yang masih kurang:** (a) belum ada Alertmanager, jadi alert menyala hanya di UI Prometheus dan tidak ada yang dikirimi — perlu tujuan notifikasi dari Anda; (b) dashboard Grafana masih berupa berkas JSON, belum ada Grafana yang memuatnya. |
| 32 | Runbook tertaut dari alert (OBS-08) | Selesai | `docs/runbook.md`; judul bagiannya sama persis dengan nama alert, dan setiap alert memuat `runbook_url`. |

## Tahap 7 — Deployment

| # | Butir | Status | Catatan |
| --- | --- | --- | --- |
| 33 | CI membangun, memindai, menandatangani (IMG-12) | Selesai | `.github/workflows/ci.yml` hijau penuh: check → audit → build → verifikasi UID & ukuran → Trivy → push ke GHCR → cosign keyless. Kedua image (`ionowu-web` dan `ionowu-web-migrate`) terdorong dan ditandatangani. |
| 34 | Deploy memakai digest, bukan tag (DEP-01, IMG-09) | Terverifikasi di produksi | `compose.yaml` memakai sintaks `@${IMAGE_DIGEST:?…}` sehingga deploy tanpa digest gagal seketika — ditegakkan Compose, bukan kedisiplinan operator. Kontainer yang berjalan memang menunjuk digest, dengan label `org.opencontainers.image.revision=586eb73…`. |
| 35 | Deploy ke staging berhasil (DEP-06) | Di luar repo | Belum ada lingkungan staging yang terlihat di host ini; yang berjalan hanya produksi. |
| 36 | Rollback diuji (DEP-04) | Di luar repo | Prosedur dan tabel catatan di `docs/deploy.md`, termasuk aturan migrasi kompatibel-mundur yang membuat rollback aman. Belum pernah dijalankan. |
| 37 | Deployment tanpa downtime (DEP-07) | Siap, tunggu server | Dua replika benar-benar berjalan dan dua-duanya `healthy`, dengan `order: start-first` dan readiness gate. Yang belum ada adalah **bukti** rollout tanpa satu pun permintaan gagal — caranya di `docs/deploy.md`. |
| 38 | Audit kepatuhan §7 lulus penuh | Di luar repo | Menunggu butir 23, 28, dan 31 di atas. |

> Penomoran mengikuti urutan pengerjaan, bukan penomoran dokumen standar;
> beberapa butir asli dipecah agar statusnya bisa berbeda (mis. isolasi
> jaringan vs pendaftaran proyek Dokploy).

## Celah yang masih terbuka

Tiga butir di atas berstatus **Belum**, plus satu catatan operasional:

1. **OBS-01 — OTel tidak mengirim ke mana pun.** `OTEL_EXPORTER_OTLP_ENDPOINT`
   kosong dan tidak ada kolektor di host. `trace_id` tetap terbentuk di log,
   tapi tidak ada trace yang tersimpan atau bisa ditelusuri.
2. **OBS-05 — pemantauan sudah ada, pemberitahuannya belum.** Prometheus dan
   blackbox_exporter kini berjalan dan benar-benar mengukur situs, tetapi
   tanpa Alertmanager alert hanya berubah warna di UI Prometheus yang tidak
   ditonton siapa pun. Jadi kalimat "tidak ada yang memberi tahu kalau situs
   mati" masih berlaku sampai Alertmanager dipasang dan tujuan notifikasinya
   ditentukan. Kelima aturannya sendiri sudah punya data dan siap menyala.
3. **SEC-02 — belum OIDC terpusat.** Masih Google OAuth langsung.
4. **`APP_VERSION=main` di produksi.** Image-nya sendiri sudah dideploy per
   digest, tetapi variabel versi ikut `IMAGE_TAG`, sehingga setiap log dan
   trace produksi menyebut dirinya "main". Saat insiden, tidak ada cara tahu
   build mana yang sedang berjalan — padahal itu justru yang dibutuhkan untuk
   memutuskan rollback. Sebaiknya diisi commit sha atau digest.

## Yang saya butuhkan dari sisi Anda

1. **Dokumen standar lengkapnya** (§3.4, §4, §4.5, §7 serta kode
   NET/IMG/ISO/DAT/SEC/OBS/DEP/CFG/RUN/ADR). Saya hanya menerima daftar
   langkahnya, jadi sebagian nilai — terutama ambang ukuran image dan bentuk
   templat `compose.yaml` §4.5 — masih tebakan yang wajar, bukan kutipan.
2. **`infra/lint-compose.sh`.** Disebut di pesan commit PR #2 sebagai linter
   standar, tetapi tidak ada di repo maupun di server. Kalau itu gerbang
   resmi, sebaiknya ikut masuk repo dan dipanggil dari CI supaya pelanggaran
   ketahuan sebelum deploy, bukan sesudahnya.
3. **Tujuan notifikasi alert** (email, Telegram, Slack, atau lainnya) supaya
   Alertmanager bisa dipasang dan alert benar-benar sampai ke orang.
4. **Alokasi port dari `registry-port.md`**, atau konfirmasi bahwa aplikasi
   ini memang tidak butuh port host karena seluruh trafiknya lewat Traefik.
5. **Detail penyedia OIDC terpusat** (issuer, client, pemetaan klaim ke role).
6. **Keputusan soal butir 4**: repo ini pindah ke templat standar, atau
   dicatat sebagai pengecualian.
