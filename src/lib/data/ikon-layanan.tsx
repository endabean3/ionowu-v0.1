import {
  Code,
  Buildings,
  Plugs,
  ChartLineUp,
  HardDrives,
  Robot,
} from "@phosphor-icons/react/dist/ssr";
import type { IkonLayanan } from "@/lib/data/layanan";

/** Data (`layanan.ts`) menyimpan kunci teks, bukan komponen — supaya
 * berkas data tetap bisa dibaca tanpa JSX. Peta di sini yang menerjemahkan
 * kunci itu jadi ikon sungguhan, dipakai di lapisan tampilan. */
export const IKON_LAYANAN: Record<IkonLayanan, typeof Code> = {
  code: Code,
  buildings: Buildings,
  plugs: Plugs,
  "chart-line-up": ChartLineUp,
  "hard-drives": HardDrives,
  robot: Robot,
};
