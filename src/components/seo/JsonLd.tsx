/**
 * Menyisipkan data terstruktur schema.org ke halaman.
 *
 * Dibaca mesin pencari untuk memahami apa isi halaman ini — bukan sekadar
 * kata-katanya. Tanpa ini, Google hanya menebak dari teks.
 */
export function JsonLd({ data }: { data: object | object[] }) {
  const payload = Array.isArray(data) ? data : [data];

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        // `<` diloloskan jadi <. Tanpa ini, isi data yang kebetulan
        // memuat "</script>" akan menutup tag ini lebih awal dan sisanya
        // dieksekusi browser sebagai HTML — celah injeksi yang klasik.
        // Isi kita saat ini aman, tapi jaminannya harus ada di sini, bukan
        // pada harapan bahwa teks konten tidak akan pernah berubah.
        __html: JSON.stringify(payload.length === 1 ? payload[0] : payload).replace(
          /</g,
          "\\u003c",
        ),
      }}
    />
  );
}
