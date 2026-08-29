# Ionowu Company Profile

Website company profile untuk **Ionowu**, software house yang merancang,
membangun, dan merawat aplikasi web serta sistem internal untuk perusahaan yang
sedang bertumbuh.

## Role Project

Project ini adalah bagian depan yang diluncurkan lebih dulu. Backend Golang dan
bot AI Python menyusul setelah website siap dipakai mencari klien.

Arah kualitasnya mengikuti dokumen pedoman di folder `../document/`:

- rasa visual futuristik, premium, dan rapi
- animasi halus, sedikit, konsisten, dan tidak mengorbankan performa
- konten jujur berdasarkan data yang sudah ada
- tidak mengarang angka, testimoni, nama klien, alamat, atau legalitas
- tetap ringan dan bisa dipakai di HP

Jika ada konflik antara README ini dan dokumen pedoman, baca urutan dokumen di
`../document/README.md`, terutama:

- `03-konten-halaman.md` untuk isi halaman
- `04-pedoman-design.md` untuk warna, huruf, jarak, dan token
- `06-pedoman-animasi.md` untuk aturan gerak
- `07-rencana-kerja.md` untuk tahap kerja

## Cara Kerja Project

Stack utama:

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS v4
- `motion` untuk animasi
- `ogl` untuk latar WebGL Aurora di hero
- Resend untuk pengiriman formulir kontak
- Drizzle ORM + PostgreSQL untuk fondasi admin, lead, audit, dan outbox
- Auth.js / NextAuth dengan Google OAuth untuk `/admin`

Struktur penting:

```text
src/app/                 route, layout, metadata, dan API route
src/components/sections/ section halaman publik
src/components/ui/       komponen UI dasar
src/components/motion/   wrapper gerakan baku
src/lib/data/            data layanan dan karya sementara
src/lib/motion.ts        satu sumber aturan animasi
src/app/globals.css      token desain dan utility Tailwind
```

Data bisnis yang belum ada ditandai di dokumen sebagai `[BELUM ADA]`. Jangan
mengisi placeholder itu dengan asumsi pribadi sebelum dikonfirmasi.

## Environment

Salin `.env.example` menjadi `.env.local`, lalu isi nilai sungguhan. Daftar
lengkap variabel beserta penjelasannya ada di `.env.example`; ringkasannya:

```env
RESEND_API_KEY=
DATABASE_URL=
DATABASE_MIGRATION_URL=
DATABASE_POOL_MAX=5
DATABASE_SSL=require
TENANT_ID=
AUTH_URL=http://localhost:3000
AUTH_SECRET=
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=
ADMIN_EMAIL_ALLOWLIST=
CRON_SECRET=
RATE_LIMIT_SECRET=
CONTACT_TRUSTED_IP_HEADER=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
OTEL_EXPORTER_OTLP_ENDPOINT=
LOG_LEVEL=info
```

Nilai sungguhan tidak pernah masuk Git. Di produksi seluruh rahasia dipasok
lewat secret manager (CFG-03); `.env.example` hanya memuat nama variabel.

Catatan formulir kontak:

- `DATABASE_URL`, `RESEND_API_KEY`, dan `CRON_SECRET` wajib tersedia; jika
  salah satunya kosong, API mengembalikan `503` dan tidak mengaku berhasil
- `request_id` boleh dikirim dari form/browser sebagai idempotency key; jika
  klien manual tidak mengirimnya, server membuat ID sendiri
- rate limit disimpan secara atomik di Postgres dan selalu memakai bucket global
  serta hash email berbasis HMAC
- IP hanya ikut dibatasi ketika `CONTACT_TRUSTED_IP_HEADER` diisi dengan header
  yang dijamin ditimpa reverse proxy (`cf-connecting-ip`, `true-client-ip`, atau
  `x-real-ip`); header forwarding bebas tidak pernah dipercaya
- `RATE_LIMIT_SECRET` sebaiknya berbeda dari secret lain; bila kosong limiter
  memakai `CRON_SECRET` sebagai fallback
- `/api/kontak` selalu menyimpan lead, audit log, dan outbox event dalam satu
  transaksi; tidak ada lagi jalur sukses yang melewati database
- event email yang baru dibuat langsung diproses dari outbox sebelum API
  mengembalikan sukses; worker cron menangani retry yang tertunda
- alamat pengirim saat ini masih `onboarding@resend.dev`
- setelah domain Ionowu diverifikasi di Resend, ganti alamat pengirim ke domain
  sendiri di `src/app/api/kontak/route.ts`

Catatan admin:

- `DATABASE_URL` dapat memakai Neon atau Supabase Postgres.
- Login admin baru dianggap siap jika `DATABASE_URL` juga tersedia.
- `AUTH_URL` wajib berupa origin tetap; production memakai `https://ionowu.com`
  agar Auth.js tidak membangun callback dari header host request.
- Google OAuth callback produksi: `https://ionowu.com/api/auth/callback/google`.
- `ADMIN_EMAIL_ALLOWLIST` berisi email internal dipisah koma.
- Jalankan migration dari folder `web/` dengan `npm run db:migrate`.
- Koneksi runtime tidak boleh memakai owner database. Grant minimum yang dipakai
  production didokumentasikan di `drizzle/roles/ionowu_runtime.sql`; role owner
  tetap khusus migration.
- Setiap migration Drizzle wajib menyertakan file SQL dan snapshot di
  `drizzle/meta/`; jalankan `npm run db:check` sebelum deploy supaya migration
  berikutnya tidak dibuat dari baseline kosong.
- Worker email dipanggil via `POST /api/cron/outbox` dengan header
  `Authorization: Bearer <CRON_SECRET>`.
- Tanpa `CRON_SECRET`, worker selalu menolak request.

`.env.local` tidak boleh di-commit. File `.env*` sudah diabaikan oleh Git.

Untuk production, isi `NEXT_PUBLIC_SITE_URL` dengan domain sungguhan, misalnya
`https://ionowu.com`. Nilai ini dipakai Next.js untuk membuat URL absolut pada
metadata Open Graph/Twitter.

## Produksi: Kontainer dan Standar Server

Produksi berjalan sebagai kontainer, bukan sebagai folder Node yang disalin
manual. Karena itu catatan `npm prune --omit=dev` yang lama sudah tidak
berlaku: `output: "standalone"` di `next.config.ts` membuat `next build`
menghasilkan `.next/standalone` berisi server plus hanya modul yang benar-benar
dipakai, dan stage runtime tidak memuat npm sama sekali.

Berkas yang mengatur ini:

```text
Dockerfile                              multi-stage; base image dikunci ke digest
compose.yaml                            jaringan, batas sumber daya, job migrasi
docker/healthcheck.mjs                  probe untuk image distroless (tanpa shell)
.dockerignore                           pemangkas konteks build
.github/workflows/ci.yml                build, Trivy, cosign
observability/alerts/                   aturan alert Prometheus
observability/dashboards/               dashboard Grafana
docs/deploy.md                          urutan deploy, rollback, uji pemulihan
docs/runbook.md                         penanganan tiap alert
docs/kepatuhan-server.md                status 32 langkah wajib produksi
```

Ringkasnya:

- Aplikasi bernama `ionowu-web`; nama itu jadi prefiks seluruh sumber daya —
  jaringan `ionowu-web-internal`, database `ionowu_web`, prefiks Redis
  `ionowu-web:`, dan `service.name` di OpenTelemetry.
- Kontainer berjalan sebagai UID 65532 dengan root filesystem read-only.
- Hanya kontainer `web` yang menyentuh `dokploy-network`; database dan Redis
  terkurung di jaringan internal.
- Migrasi database jalan sebagai job terpisah dengan role owner; runtime
  memakai role `ionowu_runtime` yang haknya minimum.
- `/health/live` tidak menyentuh dependensi apa pun (supaya database mati tidak
  memicu restart aplikasi yang sehat); `/health/ready` memeriksa database dan
  kelengkapan konfigurasi, dan menahan trafik saat belum siap.
- Setiap baris log sisi server berbentuk JSON dan memuat `trace_id`.

**Status kepatuhan belum penuh.** Yang masih tertahan — antara lain penyedia
OIDC terpusat, alokasi port, uji pemulihan backup, dan uji rollback — terdaftar
lengkap beserta alasannya di `docs/kepatuhan-server.md`.

Perintah tambahan:

```bash
npm run img:digests
```

Memeriksa apakah digest base image yang terkunci masih yang terbaru.

```bash
npm run docker:build
```

Membangun image runtime secara lokal.

## Command

Jalankan dari folder `web/`.

```bash
npm run dev
```

Menjalankan development server.

```bash
npm run typecheck
```

Memeriksa TypeScript tanpa build.

```bash
npm run lint
```

Menjalankan ESLint.

```bash
npm run tokens:check
```

Memeriksa pelanggaran token desain di `src/`.

```bash
npm run check
```

Menjalankan `typecheck`, `lint`, dan `tokens:check`.

```bash
npm run build
```

Membuat build produksi.

## Validasi Sebelum Launch

Minimal sebelum dianggap siap luncur:

- `npm run check` bersih
- `npm run build` berhasil
- semua route publik bisa dibuka
- form kontak berhasil mengirim email sungguhan
- tidak ada horizontal scroll di HP
- navigasi bisa dipakai dengan keyboard
- reduced motion tetap menampilkan halaman utuh
- Lighthouse memenuhi target performa di dokumen pedoman
- metadata/domain produksi sudah diisi
- seluruh butir wajib di `docs/kepatuhan-server.md` sudah berstatus selesai

Saat ini project berada di tahap **Poles dan Luncurkan**. Frontend inti sudah
ada, tetapi launch penuh masih menunggu data bisnis resmi dan aktivasi Resend.
