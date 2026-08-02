import { NextResponse } from "next/server";
import { Resend } from "resend";
import { isLocale, type Locale } from "@/lib/i18n";

/* ============================================================
   PENERIMA FORMULIR KONTAK

   Tujuan sudah dikonfirmasi: office@ionowu.com.

   STATUS PENGIRIMAN — WAJIB DIBACA SEBELUM DIANGGAP SELESAI:
   Kode di bawah SUDAH bisa mengirim email sungguhan lewat Resend, tapi
   HANYA kalau env var `RESEND_API_KEY` sudah diisi. Tanpa itu:
   - development: pesan dicatat ke log server supaya alur form tetap bisa diuji
   - production: request ditolak jelas, supaya pengguna tidak melihat
     "berhasil" padahal email tidak terkirim

   Sebelum situs ini diluncurkan ke publik (dokumen 07 Tahap 5), WAJIB:
   1. Daftar akun di resend.com (ini langkah yang HARUS dilakukan Nolan
      sendiri — bukan sesuatu yang bisa dibuatkan).
   2. Buat API key di dashboard Resend, isi ke `.env.local` sebagai
      `RESEND_API_KEY=...` (lihat `.env.local.example`).
   3. Alamat pengirim (`ALAMAT_DARI` di bawah) masih memakai domain uji
      bawaan Resend (`onboarding@resend.dev`) — ini hanya bisa mengirim ke
      alamat yang sama dengan email pendaftaran akun Resend. Begitu domain
      ionowu.com diverifikasi di Resend (Tambah Domain → catatan DNS →
      tunggu terverifikasi), ganti jadi alamat @ionowu.com supaya bisa
      mengirim ke office@ionowu.com dari alamat sendiri.

   Larangan yang sudah dipenuhi (dokumen 05):
   - Semua isian diperiksa ulang di server, bukan percaya pemeriksaan browser.
   - Jebakan robot (honeypot): kolom tersembunyi yang hanya diisi robot.
   - Pembatas kiriman per IP (lite): lihat catatan di bawah soal batasannya.
   ============================================================ */

const ALAMAT_TUJUAN = "office@ionowu.com";
const ALAMAT_DARI = "Ionowu <onboarding@resend.dev>"; // TODO: ganti ke @ionowu.com setelah domain terverifikasi di Resend
const SITE_ORIGIN = new URL(
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
).origin;
const MAKS_BODY_BYTES = 20 * 1024;
const MAKS_PANJANG = {
  nama: 120,
  email: 254,
  perusahaan: 160,
  kebutuhan: 80,
  pesan: 2500,
  anggaran: 80,
  situs: 200,
  locale: 8,
} as const;
const DEV_ORIGINS = ["http://localhost:3000", "http://localhost:3001"];

const LABEL_KEBUTUHAN: Record<string, string> = {
  "aplikasi-web-khusus": "Aplikasi Web Khusus",
  "sistem-informasi-perusahaan": "Sistem Informasi Perusahaan",
  "integrasi-api": "Integrasi & API",
  "business-intelligence-data": "Business Intelligence & Data",
  "infrastruktur-server": "Infrastruktur & Server",
  "otomasi-ai": "Otomasi dengan AI",
  lainnya: "Lainnya",
};

const KEBUTUHAN_VALID = Object.keys(LABEL_KEBUTUHAN);

type BodyKontak = {
  nama?: unknown;
  email?: unknown;
  perusahaan?: unknown;
  kebutuhan?: unknown;
  pesan?: unknown;
  anggaran?: unknown;
  locale?: unknown;
  // Jebakan robot — kolom ini disembunyikan lewat CSS di form, bukan
  // "hidden" attribute (robot pengisi form otomatis biasanya tetap
  // mengisi field type="text" biasa yang cuma disembunyikan CSS).
  situs?: unknown;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PESAN_API: Record<
  Locale,
  {
    json: string;
    origin: string;
    tooLarge: string;
    invalid: string;
    rate: string;
    notReady: string;
    failed: string;
    nameRequired: string;
    nameLong: string;
    emailInvalid: string;
    emailLong: string;
    companyLong: string;
    needRequired: string;
    needLong: string;
    messageShort: string;
    messageLong: string;
    budgetLong: string;
  }
> = {
  id: {
    json: "Format data harus JSON.",
    origin: "Asal permintaan tidak diizinkan.",
    tooLarge: "Data terlalu besar.",
    invalid: "Data tidak valid.",
    rate: "Terlalu banyak kiriman. Coba lagi dalam satu jam.",
    notReady: "Formulir belum siap menerima pesan. Hubungi kami lagi sebentar lagi.",
    failed: "Pesan gagal dikirim. Coba lagi sebentar lagi.",
    nameRequired: "Nama wajib diisi.",
    nameLong: "Nama terlalu panjang.",
    emailInvalid: "Email tidak valid.",
    emailLong: "Email terlalu panjang.",
    companyLong: "Nama perusahaan terlalu panjang.",
    needRequired: "Pilih jenis kebutuhan.",
    needLong: "Jenis kebutuhan terlalu panjang.",
    messageShort: "Ceritakan sedikit lebih lengkap (minimal 10 karakter).",
    messageLong: "Pesan terlalu panjang.",
    budgetLong: "Perkiraan anggaran terlalu panjang.",
  },
  en: {
    json: "Data must be sent as JSON.",
    origin: "Request origin is not allowed.",
    tooLarge: "The submitted data is too large.",
    invalid: "The submitted data is invalid.",
    rate: "Too many submissions. Please try again in one hour.",
    notReady: "The contact form is not ready yet. Please try again shortly.",
    failed: "The message could not be sent. Please try again shortly.",
    nameRequired: "Name is required.",
    nameLong: "Name is too long.",
    emailInvalid: "Email is invalid.",
    emailLong: "Email is too long.",
    companyLong: "Company name is too long.",
    needRequired: "Choose a project type.",
    needLong: "Project type is too long.",
    messageShort: "Please add a little more detail, at least 10 characters.",
    messageLong: "Message is too long.",
    budgetLong: "Estimated budget is too long.",
  },
  zh: {
    json: "数据必须以 JSON 格式发送。",
    origin: "请求来源不被允许。",
    tooLarge: "提交的数据过大。",
    invalid: "提交的数据无效。",
    rate: "提交次数过多。请一小时后再试。",
    notReady: "联系表单暂未准备好。请稍后再试。",
    failed: "消息发送失败。请稍后重试。",
    nameRequired: "请填写姓名。",
    nameLong: "姓名过长。",
    emailInvalid: "邮箱无效。",
    emailLong: "邮箱过长。",
    companyLong: "公司名称过长。",
    needRequired: "请选择项目类型。",
    needLong: "项目类型过长。",
    messageShort: "请补充更多信息，至少 10 个字符。",
    messageLong: "消息内容过长。",
    budgetLong: "预计预算过长。",
  },
};

/* Pembatas kiriman per IP — SEDERHANA, disimpan di memori proses.
   Cukup untuk satu server yang jalan terus (`next start`). TIDAK berfungsi
   benar di lingkungan serverless (tiap permintaan bisa kena proses/instance
   berbeda, memori tidak dibagi). Kalau nanti dipasang di platform
   serverless, ganti dengan penyimpan bersama (mis. Upstash Redis) — atau
   pindahkan ke backend Golang (dokumen 07 Tahap 6) yang punya database. */
const KIRIMAN_PER_IP = new Map<string, number[]>();
const BATAS_KIRIMAN = 5;
const JENDELA_MS = 60 * 60 * 1000; // 1 jam

function kenaBatas(ip: string): boolean {
  const sekarang = Date.now();
  const riwayat = (KIRIMAN_PER_IP.get(ip) ?? []).filter(
    (t) => sekarang - t < JENDELA_MS,
  );
  if (riwayat.length >= BATAS_KIRIMAN) return true;
  riwayat.push(sekarang);
  KIRIMAN_PER_IP.set(ip, riwayat);
  return false;
}

function escapeHtml(nilai: string): string {
  return nilai
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function terlaluPanjang(nilai: string, batas: number): boolean {
  return nilai.length > batas;
}

function originDiizinkan(request: Request): boolean {
  const origin = request.headers.get("origin");
  const requestOrigin = new URL(request.url).origin;

  if (!origin) {
    // Browser normal mengirim Origin untuk POST form/fetch. Di production,
    // request tanpa Origin ditolak untuk mengurangi spam lintas situs.
    return process.env.NODE_ENV !== "production";
  }

  const daftarOrigin = new Set([
    SITE_ORIGIN,
    requestOrigin,
    ...(process.env.NODE_ENV === "production" ? [] : DEV_ORIGINS),
  ]);

  return daftarOrigin.has(origin) || originLoopbackSama(requestOrigin, origin);
}

function originLoopbackSama(requestOrigin: string, origin: string): boolean {
  try {
    const requestUrl = new URL(requestOrigin);
    const originUrl = new URL(origin);
    const hostLokal = new Set(["localhost", "127.0.0.1", "::1"]);
    return (
      hostLokal.has(requestUrl.hostname) &&
      hostLokal.has(originUrl.hostname) &&
      requestUrl.port === originUrl.port &&
      requestUrl.protocol === originUrl.protocol
    );
  } catch {
    return false;
  }
}

async function bacaJsonTerbatas(request: Request): Promise<unknown> {
  const panjang = request.headers.get("content-length");
  if (panjang && Number(panjang) > MAKS_BODY_BYTES) {
    throw new Error("body-terlalu-besar");
  }

  if (!request.body) {
    throw new Error("body-kosong");
  }

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > MAKS_BODY_BYTES) {
      throw new Error("body-terlalu-besar");
    }
    chunks.push(value);
  }

  const bodyText = new TextDecoder().decode(
    chunks.length === 1 ? chunks[0] : concatUint8(chunks, total),
  );

  return JSON.parse(bodyText);
}

function concatUint8(chunks: Uint8Array[], total: number): Uint8Array {
  const hasil = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    hasil.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return hasil;
}

function isBodyKontak(nilai: unknown): nilai is BodyKontak {
  return typeof nilai === "object" && nilai !== null && !Array.isArray(nilai);
}

export async function POST(request: Request) {
  let teksApi = PESAN_API.id;
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().includes("application/json")) {
    return NextResponse.json(
      { ok: false, error: teksApi.json },
      { status: 415 },
    );
  }

  if (!originDiizinkan(request)) {
    return NextResponse.json(
      { ok: false, error: teksApi.origin },
      { status: 403 },
    );
  }

  let body: BodyKontak;
  try {
    const parsed = await bacaJsonTerbatas(request);
    if (!isBodyKontak(parsed)) throw new Error("body-bukan-object");
    body = parsed;
    const locale = typeof body.locale === "string" && isLocale(body.locale)
      ? body.locale
      : "id";
    teksApi = PESAN_API[locale];
  } catch (err) {
    if (err instanceof Error && err.message === "body-terlalu-besar") {
      return NextResponse.json(
        { ok: false, error: teksApi.tooLarge },
        { status: 413 },
      );
    }

    return NextResponse.json(
      { ok: false, error: teksApi.invalid },
      { status: 400 },
    );
  }

  // Jebakan robot: kalau kolom ini terisi, yang mengirim bukan manusia.
  // Balas seolah berhasil (jangan beri tahu robot bahwa ia terdeteksi).
  if (typeof body.situs === "string" && body.situs.trim() !== "") {
    return NextResponse.json({ ok: true });
  }

  const nama = typeof body.nama === "string" ? body.nama.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const perusahaan = typeof body.perusahaan === "string" ? body.perusahaan.trim() : "";
  const kebutuhan = typeof body.kebutuhan === "string" ? body.kebutuhan : "";
  const isiPesan = typeof body.pesan === "string" ? body.pesan.trim() : "";
  const anggaran = typeof body.anggaran === "string" ? body.anggaran.trim() : "";

  const kesalahan: Record<string, string> = {};
  if (!nama || nama.length < 2) kesalahan.nama = teksApi.nameRequired;
  if (terlaluPanjang(nama, MAKS_PANJANG.nama)) {
    kesalahan.nama = teksApi.nameLong;
  }
  if (!email || !EMAIL_REGEX.test(email)) kesalahan.email = teksApi.emailInvalid;
  if (terlaluPanjang(email, MAKS_PANJANG.email)) {
    kesalahan.email = teksApi.emailLong;
  }
  if (terlaluPanjang(perusahaan, MAKS_PANJANG.perusahaan)) {
    kesalahan.perusahaan = teksApi.companyLong;
  }
  if (terlaluPanjang(kebutuhan, MAKS_PANJANG.kebutuhan)) {
    kesalahan.kebutuhan = teksApi.needLong;
  }
  if (!KEBUTUHAN_VALID.includes(kebutuhan)) {
    kesalahan.kebutuhan = teksApi.needRequired;
  }
  if (!isiPesan || isiPesan.length < 10) {
    kesalahan.pesan = teksApi.messageShort;
  }
  if (terlaluPanjang(isiPesan, MAKS_PANJANG.pesan)) {
    kesalahan.pesan = teksApi.messageLong;
  }
  if (terlaluPanjang(anggaran, MAKS_PANJANG.anggaran)) {
    kesalahan.anggaran = teksApi.budgetLong;
  }

  if (Object.keys(kesalahan).length > 0) {
    return NextResponse.json({ ok: false, fieldErrors: kesalahan }, { status: 422 });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "tidak-diketahui";

  if (kenaBatas(ip)) {
    return NextResponse.json(
      { ok: false, error: teksApi.rate },
      { status: 429 },
    );
  }

  const labelKebutuhan = LABEL_KEBUTUHAN[kebutuhan] ?? kebutuhan;
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    if (process.env.NODE_ENV === "production") {
      console.error("[kontak] RESEND_API_KEY belum diisi di production.");
      return NextResponse.json(
        {
          ok: false,
          error: teksApi.notReady,
        },
        { status: 503 },
      );
    }

    // Development tanpa kunci — dicatat ke log server saja. Lihat catatan
    // di atas berkas ini untuk langkah mengaktifkan pengiriman sungguhan.
    console.log("[kontak] pesan masuk (RESEND_API_KEY belum diisi, belum terkirim):", {
      nama,
      email,
      perusahaan: perusahaan || "(tidak diisi)",
      kebutuhan: labelKebutuhan,
      pesan: isiPesan,
      anggaran: anggaran || "(tidak diisi)",
      waktu: new Date().toISOString(),
    });
    return NextResponse.json({ ok: true });
  }

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: ALAMAT_DARI,
      to: ALAMAT_TUJUAN,
      replyTo: email,
      subject: `Pesan baru dari ${nama} — ${labelKebutuhan}`,
      html: `
        <div style="font-family: sans-serif; line-height: 1.6;">
          <p><strong>Nama:</strong> ${escapeHtml(nama)}</p>
          <p><strong>Email:</strong> ${escapeHtml(email)}</p>
          <p><strong>Perusahaan:</strong> ${escapeHtml(perusahaan || "(tidak diisi)")}</p>
          <p><strong>Jenis kebutuhan:</strong> ${escapeHtml(labelKebutuhan)}</p>
          <p><strong>Perkiraan anggaran:</strong> ${escapeHtml(anggaran || "(tidak diisi)")}</p>
          <p><strong>Pesan:</strong></p>
          <p>${escapeHtml(isiPesan).replace(/\n/g, "<br />")}</p>
        </div>
      `,
    });

    if (error) {
      console.error("[kontak] Resend menolak pengiriman:", error);
      return NextResponse.json(
        { ok: false, error: teksApi.failed },
        { status: 502 },
      );
    }
  } catch (err) {
    console.error("[kontak] gagal memanggil Resend:", err);
    return NextResponse.json(
      { ok: false, error: teksApi.failed },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
