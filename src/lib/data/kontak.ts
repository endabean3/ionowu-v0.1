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

/** Nomor WhatsApp resmi, apa adanya seperti ditulis orang Indonesia. */
export const WA_LOKAL = "082229412035";

/**
 * Bentuk E.164 — dipakai untuk `tel:` dan data terstruktur.
 * Awalan `0` diganti kode negara Indonesia (+62), sesuai standar.
 */
export const WA_E164 = "+6282229412035";

/** wa.me menuntut nomor tanpa tanda plus dan tanpa pemisah apa pun. */
export const WA_LINK = "https://wa.me/6282229412035";

/** Bentuk yang enak dibaca manusia di layar. */
export const WA_TAMPIL = "0822-2941-2035";

/**
 * Pesan pembuka yang sudah terisi saat tautan WhatsApp dibuka.
 * Dibuat singkat dan netral — pengunjung tetap harus menulis kebutuhannya
 * sendiri, dan pesan pembuka yang terlalu panjang justru sering dihapus.
 */
export const WA_PESAN_AWAL = "Halo Ionowu, saya ingin berkonsultasi soal";

export function waHref(pesan: string = WA_PESAN_AWAL): string {
  return `${WA_LINK}?text=${encodeURIComponent(pesan)}`;
}
