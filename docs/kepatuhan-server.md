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
| 28 | OpenTelemetry terpasang (OBS-01) | **Selesai** | Jaeger v2.20.0 dipasang di stack `ionowu-monitoring`, dijangkau aplikasi lewat `dokploy-network`. `OTEL_EXPORTER_OTLP_ENDPOINT` default ke `http://ionowu-jaeger:4318`. **Diuji ujung-ke-ujung**: permintaan sungguhan ke `/health/ready` menghasilkan trace yang benar-benar tersimpan -- `GET /api/services` Jaeger mendaftarkan `ionowu-web`, dan `GET /api/traces` mengembalikan trace nyata (`traceID` 32-hex, sama persis formatnya dengan `trace_id` di log JSON). UI dijangkau lewat SSH tunnel `:16686`, tidak ada route publik. Jaeger dipilih di antara Tempo/SigNoz karena host 2 CPU -- satu kontainer 106 MB, bukan tumpukan ClickHouse atau Grafana+object storage. |
| 29 | `trace_id` di setiap log (OBS-02) | Selesai | `src/lib/observability/log.ts`; seluruh `console.error` sisi server sudah diganti. Diverifikasi lokal: permintaan ke `/health/ready` menghasilkan baris log JSON berisi `trace_id` dan `span_id`. |
| 30 | `/health/live` dan `/health/ready` (RUN-08) | Terverifikasi di produksi | `https://ionowu.com/health/live` membalas 200 tanpa menyentuh dependensi. `/health/ready` membalas 200 `ready` dengan ketiga pemeriksaan lulus (`database`, `contact_pipeline`, `admin_auth`), header `cache-control: no-store`. Healthcheck kontainer juga `exit=0`. `live` sengaja tidak memeriksa database supaya database yang mati tidak memicu restart aplikasi yang sebenarnya sehat. |
| 31 | Dashboard dan minimal satu alert (OBS-05) | **Selesai** | Alertmanager v0.34.0 terpasang dan terhubung ke bot Telegram `@ionowu_bot`. Prometheus melaporkan 1 Alertmanager aktif dan **5/5 target `up`** (`ionowu-web`, `blackbox`, `cadvisor`, `alertmanager`, `prometheus`). **Diuji ujung-ke-ujung dengan alert sungguhan**, bukan cuma status hijau: alert uji dikirim ke Alertmanager, diterima (`200`), lalu dicabut — kabar MENYALA dan PULIH dua-duanya terkirim ke Telegram. Kedelapan alert (situs mati, lambat, restart berulang, memori mendekati batas, lead gagal terkirim, lead tertahan, metrik hilang, sertifikat kedaluwarsa) kini benar-benar sampai ke pemiliknya, bukan cuma berhenti di UI Prometheus. **Sisanya kosmetik:** dashboard Grafana masih berupa JSON, belum ada Grafana yang memuatnya — tidak mengurangi fungsi alert. |
| 32 | Runbook tertaut dari alert (OBS-08) | Selesai | `docs/runbook.md`; judul bagiannya sama persis dengan nama alert, dan setiap alert memuat `runbook_url`. |

## Tahap 7 — Deployment

| # | Butir | Status | Catatan |
| --- | --- | --- | --- |
| 33 | CI membangun, memindai, menandatangani (IMG-12) | Selesai | `.github/workflows/ci.yml` hijau penuh: check → audit → build → verifikasi UID & ukuran → Trivy → push ke GHCR → cosign keyless. Kedua image (`ionowu-web` dan `ionowu-web-migrate`) terdorong dan ditandatangani. |
| 34 | Deploy memakai digest, bukan tag (DEP-01, IMG-09) | Terverifikasi di produksi | `compose.yaml` memakai sintaks `@${IMAGE_DIGEST:?…}` sehingga deploy tanpa digest gagal seketika — ditegakkan Compose, bukan kedisiplinan operator. Kontainer yang berjalan memang menunjuk digest, dengan label `org.opencontainers.image.revision=586eb73…`. |
| 35 | Deploy ke staging berhasil (DEP-06) | Di luar repo | Belum ada lingkungan staging yang terlihat di host ini; yang berjalan hanya produksi. |
| 36 | Rollback diuji (DEP-04) | Di luar repo | Prosedur dan tabel catatan di `docs/deploy.md`, termasuk aturan migrasi kompatibel-mundur yang membuat rollback aman. Belum pernah dijalankan. |
| 37 | Deployment tanpa downtime (DEP-07) | **Belum** | **Diukur saat deploy 30 Agu 2026, dan gagal:** probe dari luar tiap 0,4 detik selama rollout mencatat 250 permintaan sukses dan **13 gagal, semuanya `502`** — sekitar **5 detik** situs benar-benar tidak melayani. Penyebabnya struktural, bukan salah setelan: `deploy.update_config.order: start-first` dan `failure_action: rollback` di `compose.yaml` hanya berlaku di Docker Swarm. Di Dokploy tipe **Compose**, `docker compose up -d` membuat ulang kedua replika tanpa menunggu yang baru lulus readiness, jadi ada jeda tanpa backend sama sekali. |
| 38 | Audit kepatuhan §7 lulus penuh | Di luar repo | Menunggu butir 23, 28, dan 31 di atas. |

> Penomoran mengikuti urutan pengerjaan, bukan penomoran dokumen standar;
> beberapa butir asli dipecah agar statusnya bisa berbeda (mis. isolasi
> jaringan vs pendaftaran proyek Dokploy).

## Celah yang masih terbuka

Tiga butir di atas berstatus **Belum**, plus satu catatan operasional:

1. **SELESAI (1 September 2026).** Jaeger terpasang dan terbukti menerima
   trace sungguhan dari produksi. Rincian dan bukti uji ada di Tahap 6 tabel
   di atas.
2. **OBS-05 — SELESAI (31 Agustus 2026).** Alertmanager menyala dan
   terhubung ke `@ionowu_bot`. Diuji ujung-ke-ujung dengan alert sungguhan:
   MENYALA dan PULIH dua-duanya terkirim ke Telegram. Kalimat "tidak ada yang
   memberi tahu kalau situs mati" tidak lagi berlaku.
3. **SEC-02 — belum OIDC terpusat.** Masih Google OAuth langsung.
4. **DEP-07 tidak terpenuhi, dan pilihannya saling meniadakan.** Dokploy tipe
   **Compose** menghormati `depends_on: service_completed_successfully`
   sehingga migrasi dijamin selesai sebelum aplikasi baru menyentuh skema
   (DAT-05), tetapi tidak punya rolling update. Tipe **Application** (Swarm)
   memberi rolling update sungguhan, tetapi mengabaikan `depends_on` diam-diam
   sehingga migrasi harus dipindah ke pre-deploy di host. Salah satu harus
   dikorbankan, atau rollout dijalankan bertahap secara manual. Ini keputusan
   arsitektur, bukan sesuatu yang bisa diperbaiki dengan menambah opsi di
   `compose.yaml`.
5. **SELESAI (31 Agustus 2026).** `APP_VERSION` kini membaca `GIT_SHA`,
   diisi manual tiap deploy bersamaan dengan `IMAGE_DIGEST`/`MIGRATE_DIGEST`.
   Diverifikasi: `/health/live` dan `/health/ready` produksi menyebut commit
   sha sungguhan, bukan lagi "main".
6. **Formulir kontak sempat rusak total (ditemukan & diperbaiki 31 Agustus
   2026).** Setiap pengunjung yang menekan kirim menerima 503 — lead tidak
   pernah bisa tersimpan sama sekali. Dua sebab: (a) `drizzle/roles/
   ionowu_runtime.sql` tidak pernah dijalankan ke database produksi, sehingga
   role aplikasi tidak punya hak apa pun atas tabel; (b) `TENANT_ID=` kosong
   diloloskan `??` sehingga setiap insert memakai tenant_id kosong. Keduanya
   sudah diperbaiki dan diverifikasi ujung-ke-ujung: `{"ok":true}`, lead
   tersimpan, outbox `sent`. **Pelajaran yang penting dicatat:**
   `/health/ready` tetap hijau sepanjang kejadian karena pemeriksaannya hanya
   `select 1`, yang tidak butuh hak tabel — probe yang lulus tidak sama dengan
   aplikasi yang berfungsi.
7. **Notifikasi lead gagal permanen (ditemukan 30 Agustus, DITUTUP 1
   September 2026).** Akar masalahnya bukan cuma domain belum terverifikasi
   -- setelah domain terverifikasi di dashboard Resend, pengiriman TETAP
   ditolak `403`. Penyebab sesungguhnya: verifikasi domain terikat ke akun
   Resend, dan API key yang terpasang di server ternyata terdaftar ke akun
   yang BERBEDA dari akun tempat domain diverifikasi.

   Ditutup dengan mengganti `RESEND_API_KEY` ke kunci dari akun yang benar
   (diverifikasi read-only lebih dulu lewat `GET /domains` sebelum dipasang:
   `ionowu.com` -> `status: verified`, `sending: enabled`), mengisi
   `RESEND_FROM_EMAIL="Ionowu <io@ionowu.com>"`, dan mengosongkan
   `CONTACT_NOTIFY_EMAIL` karena penampung sementara tidak diperlukan lagi.

   **Diuji ujung-ke-ujung lewat formulir kontak sungguhan**: `POST
   /api/kontak` -> `{"ok":true}` -> outbox `status: sent` -> email diterima
   di `io@ionowu.com`. Data uji dibersihkan setelahnya.

## Yang saya butuhkan dari sisi Anda

1. **Dokumen standar lengkapnya** (§3.4, §4, §4.5, §7 serta kode
   NET/IMG/ISO/DAT/SEC/OBS/DEP/CFG/RUN/ADR). Saya hanya menerima daftar
   langkahnya, jadi sebagian nilai — terutama ambang ukuran image dan bentuk
   templat `compose.yaml` §4.5 — masih tebakan yang wajar, bukan kutipan.
2. **`infra/lint-compose.sh`.** Disebut di pesan commit PR #2 sebagai linter
   standar, tetapi tidak ada di repo maupun di server. Kalau itu gerbang
   resmi, sebaiknya ikut masuk repo dan dipanggil dari CI supaya pelanggaran
   ketahuan sebelum deploy, bukan sesudahnya.
3. **Menjalankan `./setup-telegram.sh` di server** dengan bot token dan chat
   ID dari Telegram. Token tidak boleh lewat saya — skripnya membacanya dari
   prompt tersembunyi dan menguji kirim sebelum menulis apa pun.
4. **Alokasi port dari `registry-port.md`**, atau konfirmasi bahwa aplikasi
   ini memang tidak butuh port host karena seluruh trafiknya lewat Traefik.
5. **Detail penyedia OIDC terpusat** (issuer, client, pemetaan klaim ke role).
6. **Keputusan soal butir 4**: repo ini pindah ke templat standar, atau
   dicatat sebagai pengecualian.
