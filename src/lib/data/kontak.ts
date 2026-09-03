/**
 * Kontak resmi Ionowu — satu sumber untuk seluruh situs.
 *
 * Sebelumnya nomor dan alamat surel ini `[BELUM ADA]`, dan beberapa bagian
 * situs menulis "saluran langsung sedang disiapkan". Sekarang sudah ada, jadi
 * nilainya dikumpulkan di sini supaya tidak tersebar sebagai teks lepas di
 * belasan berkas — satu perubahan nomor cukup disunting di satu tempat, dan
 * tidak ada halaman yang tertinggal menampilkan nomor lama.
 *
 * Yang MASIH belum ada: alamat kantor. Karena itu data terstruktur situs
 * memakai `ProfessionalService` dengan `areaServed`, bukan `LocalBusiness`
 * yang menuntut alamat sungguhan.
 */

/** Tujuan seluruh notifikasi formulir kontak. */
export const EMAIL_KONTAK = "io@ionowu.com";

/** wa.me menuntut nomor tanpa tanda plus dan tanpa pemisah apa pun. */
export const WA_LINK = "https://wa.me/6282229412035";

/**
 * Angkanya SENGAJA tidak diekspor dalam bentuk siap-tampil (permintaan
 * pemilik produk, 3 Sep 2026) -- tidak ada lagi `WA_TAMPIL`/`WA_E164`/
 * `WA_LOKAL`. Nomor tetap hidup lewat `WA_LINK`/`waHref()` di bawah, dipakai
 * hanya sebagai href, tidak pernah dirender sebagai teks yang bisa dibaca
 * atau disalin pengunjung.
 */

/**
 * Pesan pembuka yang sudah terisi saat tautan WhatsApp dibuka.
 * Dibuat singkat dan netral — pengunjung tetap harus menulis kebutuhannya
 * sendiri, dan pesan pembuka yang terlalu panjang justru sering dihapus.
 */
export const WA_PESAN_AWAL = "Halo Ionowu, saya ingin berkonsultasi soal";

export function waHref(pesan: string = WA_PESAN_AWAL): string {
  return `${WA_LINK}?text=${encodeURIComponent(pesan)}`;
}
