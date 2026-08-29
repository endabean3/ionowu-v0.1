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
export function currentTenantId(): string {
  return process.env.TENANT_ID ?? DEFAULT_TENANT_ID;
}
