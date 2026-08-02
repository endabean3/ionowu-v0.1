import { ImageResponse } from "next/og";

// Runtime Node.js (bawaan) sengaja dipakai, bukan "edge" — isinya statis
// (tidak ada data per-permintaan), jadi lebih baik dibuat sekali saat build
// (prerendered) daripada dibuat ulang tiap kali ada yang minta.
export const alt = "Ionowu - Software House";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/* Gambar pratinjau untuk WhatsApp/LinkedIn (dokumen 07 Tahap 4).
   Dibuat lewat kode, bukan berkas gambar — tidak ada aset eksternal yang
   perlu diunduh atau dijaga. Path monogram disalin dari
   public/brand/ionowu-mark-white.svg (warna brand, tidak diubah). */
export default async function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          // Satori (mesin ImageResponse) merender di luar browser, tidak
          // bisa membaca var() CSS sama sekali — nilai token disalin manual.
          backgroundColor: "#050A12", // token-ok: Satori tidak bisa var()
          backgroundImage:
            "radial-gradient(1000px 600px at 15% -10%, rgba(15,155,156,0.28), transparent 70%), radial-gradient(700px 500px at 95% 110%, rgba(16,63,105,0.5), transparent 70%)",
        }}
      >
        <svg width={72} height={61} viewBox="0 0 226 191" fill="none">
          <path
            d="M 42.020 26.752 C 33.056 31.255, 31.266 43.665, 38.648 50.126 C 41.950 53.017, 47.436 54.229, 51.844 53.042 C 56.677 51.741, 61.644 46.414, 62.556 41.554 C 63.566 36.172, 60.005 29.665, 54.624 27.060 C 49.426 24.544, 46.554 24.473, 42.020 26.752 M 132.500 52.022 C 120.205 54.490, 108.207 61.940, 100.034 72.182 C 97.540 75.307, 90.355 87.457, 84.068 99.182 C 63.975 136.648, 61.630 140, 55.514 140 C 53.778 140, 52.602 139.221, 51.852 137.574 C 50.982 135.666, 51.307 132.191, 53.368 121.324 C 58.075 96.512, 61 78.626, 61 74.658 C 61 71.469, 60.298 70.062, 57.118 66.882 C 53.535 63.300, 52.804 63, 47.652 63 C 42.839 63, 41.585 63.426, 38.549 66.091 C 36.516 67.876, 34.621 70.729, 34.065 72.841 C 33.536 74.854, 31.423 86.625, 29.371 99 C 26.830 114.324, 25.617 124.849, 25.570 132 C 25.510 141.066, 25.817 143.138, 27.824 147.172 C 30.720 152.997, 35.838 158.339, 41.306 161.246 C 44.696 163.049, 47.129 163.476, 54 163.476 C 61.029 163.476, 63.279 163.064, 67 161.094 C 74.050 157.361, 77.423 154.413, 81.717 148.232 C 86.378 141.521, 97.900 120.319, 107.632 100.543 C 115.919 83.702, 121.219 77.567, 130.503 74.068 C 135.467 72.197, 137.966 71.876, 145.014 72.201 C 151.191 72.486, 154.805 73.211, 158.177 74.843 C 165.142 78.215, 171.241 84.112, 175.073 91.179 C 178.357 97.236, 178.500 97.939, 178.500 108 C 178.500 117.226, 178.185 119.167, 175.903 124 C 172.376 131.469, 166.142 137.563, 158.159 141.345 C 152.127 144.203, 150.605 144.498, 142 144.482 C 133.834 144.466, 131.697 144.090, 126.782 141.802 C 119.313 138.325, 111.681 131.091, 108.395 124.375 C 106.949 121.419, 105.622 119, 105.447 119 C 105.272 119, 102.619 123.577, 99.551 129.171 C 96.484 134.766, 94.204 140.066, 94.484 140.951 C 95.205 143.221, 103.692 151.670, 108.778 155.182 C 114.052 158.822, 121.884 162.294, 128.500 163.923 C 135.359 165.612, 150.265 165.398, 157.408 163.507 C 182.449 156.879, 199.970 134.234, 199.970 108.500 C 199.970 77.179, 173.656 50.677, 143 51.124 C 139.425 51.176, 134.700 51.580, 132.500 52.022"
            fill="#FFFFFF"
          />
        </svg>

        <div
          style={{
            marginTop: 36,
            fontSize: 64,
            fontWeight: 600,
            color: "#E8EEF6", // token-ok: Satori tidak bisa var(), lihat catatan di atas
            letterSpacing: "-0.02em",
          }}
        >
          Kami bangun perangkat lunak
        </div>
        <div
          style={{
            fontSize: 64,
            fontWeight: 600,
            color: "#22C7C8", // token-ok: Satori tidak bisa var(), lihat catatan di atas
            letterSpacing: "-0.02em",
          }}
        >
          yang menopang bisnis Anda.
        </div>

        <div
          style={{ marginTop: 28, fontSize: 28, color: "#8B9CB3" }} // token-ok: Satori tidak bisa var()
        >
          Ionowu - Software House
        </div>
      </div>
    ),
    { ...size },
  );
}
