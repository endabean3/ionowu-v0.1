/* Berdasarkan data nyata di referensi/cv-data-real-novenda.pdf (dokumen 03).
   Ditulis sebagai teks, bukan logo resmi tiap perusahaan — menghindari
   masalah hak merek, dan tetap jujur/meyakinkan sesuai dokumen 03. */
const TEKNOLOGI = [
  "Next.js",
  "React",
  "Vue",
  "Golang",
  "Laravel",
  "Node.js",
  "PostgreSQL",
  "MongoDB",
  "Python",
  "Docker",
  "Google Cloud",
  "AWS",
  "Apache Airflow",
  "Linux",
];

/**
 * Strip teknologi yang berjalan pelan tanpa putus.
 *
 * Terinspirasi bentuk react-bits `Animations/LogoLoop`, tapi ditulis ulang
 * jauh lebih sederhana: LogoLoop asli (497 baris) menangani gambar dengan
 * pelacakan pemuatan, resize observer, dan animasi lewat requestAnimationFrame.
 * Kita cuma butuh teks statis, jadi cukup CSS `@keyframes` — tanpa kerja
 * JavaScript tiap frame (dokumen 06: hemat bujet performa).
 *
 * Berhenti berjalan saat kursor di atasnya, dan otomatis diam kalau
 * pengguna mematikan animasi (aturan global di globals.css).
 */
export function TechMarquee() {
  return (
    <div className="marquee-fade overflow-hidden border-y border-line py-8">
      {/* Daftar sungguhan untuk pembaca layar — ditulis sekali, tidak diulang. */}
      <ul className="sr-only">
        {TEKNOLOGI.map((nama) => (
          <li key={nama}>{nama}</li>
        ))}
      </ul>

      {/* Versi visual: diulang dua kali, animasi menggeser tepat separuh
          lebar (-50%) supaya sambungannya tidak terlihat. Disembunyikan
          dari pembaca layar karena isinya duplikat dari daftar di atas. */}
      <div className="marquee-track flex w-max items-center gap-12" aria-hidden="true">
        {[0, 1].map((salinan) => (
          <div key={salinan} className="flex shrink-0 items-center gap-12">
            {TEKNOLOGI.map((nama) => (
              <span
                key={`${salinan}-${nama}`}
                className="tabular shrink-0 text-lead text-ink-muted"
              >
                {nama}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
