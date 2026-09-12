"use client";

import { useSyncExternalStore } from "react";

export type ArahGulir = "turun" | "naik";

/**
 * Arah gulir halaman, dibagi ke SELURUH komponen lewat satu langganan.
 *
 * Kenapa tidak `useEffect` + `addEventListener` di tiap komponen: di beranda
 * ada puluhan elemen ber-animasi masuk. Kalau masing-masing memasang
 * pendengar `scroll` sendiri, satu kali gulir memanggil puluhan fungsi.
 * Di sini pendengarnya SATU untuk seluruh halaman, dan komponen hanya
 * berlangganan hasilnya lewat `useSyncExternalStore`.
 *
 * Dipakai supaya elemen datang SEARAH dengan gerakan pengguna: saat menggulir
 * turun elemen naik dari bawah, saat menggulir naik elemen turun dari atas.
 * Tanpa ini, menggulir ke atas terasa aneh -- isinya bergerak melawan arah
 * jempol/roda mouse.
 */

let arahSekarang: ArahGulir = "turun";
const pelanggan = new Set<() => void>();

/** Ambang piksel sebelum arah dianggap berubah. Getaran kecil (bounce iOS,
 *  trackpad yang sensitif) tidak boleh membolak-balik arah tiap frame. */
const AMBANG = 6;

function beriTahuPelanggan() {
  for (const beriTahu of pelanggan) beriTahu();
}

function pasangPendengar(): () => void {
  let posisiTerakhir = window.scrollY;
  let menungguFrame = false;

  const onScroll = () => {
    if (menungguFrame) return;
    menungguFrame = true;

    // Dibaca di dalam rAF, bukan langsung di handler: `scrollY` memicu
    // perhitungan tata letak, dan menggulir bisa memanggil handler puluhan
    // kali per detik.
    requestAnimationFrame(() => {
      const posisiKini = window.scrollY;
      const selisih = posisiKini - posisiTerakhir;

      if (Math.abs(selisih) > AMBANG) {
        const arahBaru: ArahGulir = selisih > 0 ? "turun" : "naik";
        posisiTerakhir = posisiKini;

        if (arahBaru !== arahSekarang) {
          arahSekarang = arahBaru;
          beriTahuPelanggan();
        }
      }

      menungguFrame = false;
    });
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  return () => window.removeEventListener("scroll", onScroll);
}

let lepasPendengar: (() => void) | null = null;

function berlangganan(beriTahu: () => void): () => void {
  pelanggan.add(beriTahu);
  if (pelanggan.size === 1) lepasPendengar = pasangPendengar();

  return () => {
    pelanggan.delete(beriTahu);
    if (pelanggan.size === 0 && lepasPendengar) {
      lepasPendengar();
      lepasPendengar = null;
    }
  };
}

const bacaArah = () => arahSekarang;

/** Di server belum ada gulir sama sekali -- anggap turun, sama seperti
 *  pengunjung yang baru membuka halaman. */
const bacaArahServer = (): ArahGulir => "turun";

export function useArahGulir(): ArahGulir {
  return useSyncExternalStore(berlangganan, bacaArah, bacaArahServer);
}
