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

Salin `.env.local.example` menjadi `.env.local`, lalu isi nilai sungguhan:

```env
RESEND_API_KEY=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Catatan formulir kontak:

- tanpa `RESEND_API_KEY`, mode development mencatat pesan ke log server
- tanpa `RESEND_API_KEY`, mode production mengembalikan error jelas
- setelah key diisi, `/api/kontak` langsung mengirim email lewat Resend
- alamat pengirim saat ini masih `onboarding@resend.dev`
- setelah domain Ionowu diverifikasi di Resend, ganti alamat pengirim ke domain
  sendiri di `src/app/api/kontak/route.ts`

`.env.local` tidak boleh di-commit. File `.env*` sudah diabaikan oleh Git.

Untuk production, isi `NEXT_PUBLIC_SITE_URL` dengan domain sungguhan, misalnya
`https://ionowu.com`. Nilai ini dipakai Next.js untuk membuat URL absolut pada
metadata Open Graph/Twitter.

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

Saat ini project berada di tahap **Poles dan Luncurkan**. Frontend inti sudah
ada, tetapi launch penuh masih menunggu data bisnis resmi dan aktivasi Resend.
