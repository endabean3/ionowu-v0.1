/**
 * DAT-08 — setiap tabel data bisnis wajib punya `tenant_id`.
 *
 * Ionowu saat ini hanya melayani satu tenant (dirinya sendiri), tetapi kolom
 * dan kunci uniknya dipasang sejak skema awal. Menambahkan tenant_id belakangan
 * ke tabel yang sudah berisi data selalu jauh lebih mahal: unique constraint
 * harus dibongkar, dan setiap query lama harus diaudit ulang satu per satu.
 *
 * Kolom `tenant_id` di database memakai nilai ini sebagai DEFAULT supaya
 * jalur lama tetap aman, tetapi kode aplikasi tetap mengisinya secara
 * eksplisit. Begitu tenant kedua benar-benar ada, DEFAULT itu harus dicabut
 * agar tidak ada baris yang diam-diam masuk ke tenant yang salah.
 */
export const DEFAULT_TENANT_ID = "4f6b1c8a-3d21-4f0e-9c7a-2b5e8d0a1f33";

export const DEFAULT_TENANT_SLUG = "ionowu";

/**
 * Tenant yang sedang aktif untuk permintaan ini. Sengaja dibuat sebagai fungsi
 * sejak awal supaya titik penggantiannya cuma satu ketika tenant kedua muncul
 * (mis. dipetakan dari host atau dari klaim OIDC), bukan tersebar di puluhan
 * query.
 */
const POLA_UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function currentTenantId(): string {
  const disetel = process.env.TENANT_ID;

  // Kosong berarti "pakai bawaan" -- itu keadaan normal, bukan kesalahan.
  //
  // `||` dipakai di sini, BUKAN `??`: variabel yang disetel tapi dibiarkan
  // kosong (`TENANT_ID=` di Dokploy) datang sebagai string kosong, bukan
  // `undefined`. `??` meloloskannya apa adanya, dan tenant_id kosong membuat
  // SETIAP insert lead gagal -- persis yang terjadi di produksi pada 31
  // Agustus 2026, dan gagalnya tidak terlihat sampai log query dibaca.
  if (!disetel) return DEFAULT_TENANT_ID;

  // Nilai yang ada tapi bukan UUID akan ditolak Postgres di setiap query,
  // bukan cuma satu. Lebih baik jatuh ke tenant bawaan dan berisik di log
  // daripada membuat seluruh penyimpanan lead berhenti tanpa penjelasan.
  if (!POLA_UUID.test(disetel)) {
    console.error(
      JSON.stringify({
        level: "error",
        event: "tenant.id_tidak_valid",
        detail:
          "TENANT_ID bukan UUID yang sah; memakai tenant bawaan. Perbaiki nilainya di secret manager.",
      }),
    );
    return DEFAULT_TENANT_ID;
  }

  return disetel;
}
