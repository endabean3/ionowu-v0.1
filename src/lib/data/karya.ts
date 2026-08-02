import type { Locale } from "@/lib/i18n";

export type PolaKarya = "grid" | "garis" | "titik";

export type Karya = {
  slug: string;
  nama: string;
  /** Gambaran bidang usaha — nama klien belum boleh disebut (dokumen 03). */
  bidang: string;
  /** Satu kalimat hasil nyata — dipakai di kartu beranda dan daftar. */
  ringkasan: string;
  masalah: string;
  dikerjakan: string;
  hasil: string;
  teknologi: string[];
  pola: PolaKarya;
};

type KaryaCopy = Pick<
  Karya,
  "nama" | "bidang" | "ringkasan" | "masalah" | "dikerjakan" | "hasil" | "teknologi"
>;

/* Dokumen 03: nama klien belum diizinkan disebut ("[BELUM ADA]"), jadi
   dituliskan gambarannya saja. Gambar tangkapan layar juga `[BELUM ADA]` —
   diganti pola abstrak sesuai dokumen 04. Daftar dan urutan mengikuti
   dokumen 03 "Portfolio". */
export const DAFTAR_KARYA: Karya[] = [
  {
    slug: "sistem-informasi-gudang-farmasi",
    nama: "Sistem Informasi Gudang Farmasi",
    bidang: "Rumah Sakit Daerah di Jawa Timur",
    ringkasan: "Pencatatan stok obat yang tadinya manual jadi otomatis.",
    masalah:
      "Stok obat dicatat manual di kertas dan spreadsheet terpisah. Selisih stok baru ketahuan saat obat sudah habis atau kedaluwarsa tanpa terpantau.",
    dikerjakan:
      "Dibangun sistem pencatatan stok gudang farmasi yang terhubung ke database pusat, dengan pencatatan keluar-masuk barang secara langsung.",
    hasil:
      "Stok bisa dipantau langsung tanpa hitung manual, dan selisih data jauh berkurang.",
    teknologi: ["Yii2", "PHP", "PostgreSQL"],
    pola: "grid",
  },
  {
    slug: "business-intelligence-rumah-sakit",
    nama: "Business Intelligence Rumah Sakit",
    bidang: "Rumah Sakit Daerah di Jawa Timur",
    ringkasan:
      "Data operasional diolah jadi laporan siap pakai lewat Apache Airflow.",
    masalah:
      "Data operasional rumah sakit tersebar di banyak sistem terpisah dan tidak pernah diolah jadi laporan yang bisa dipakai mengambil keputusan.",
    dikerjakan:
      "Dibangun jalur pengolahan data (ETL) dengan Apache Airflow untuk mengumpulkan, membersihkan, dan menyusun data jadi laporan Business Intelligence.",
    hasil:
      "Data yang tadinya mentah dan tersebar sekarang tersedia sebagai laporan siap baca untuk pengambilan keputusan.",
    teknologi: ["Python", "Apache Airflow", "PostgreSQL"],
    pola: "garis",
  },
  {
    slug: "sistem-informasi-manajemen-toko",
    nama: "Sistem Informasi Manajemen Toko",
    bidang: "Ritel",
    ringkasan: "Stok, penjualan, dan laporan toko dalam satu sistem.",
    masalah:
      "Pencatatan stok dan penjualan dilakukan terpisah, membuat pemilik toko sulit tahu kondisi bisnisnya secara langsung.",
    dikerjakan:
      "Dibangun sistem yang menyatukan pencatatan stok, transaksi penjualan, dan laporan harian dalam satu antarmuka.",
    hasil: "Pemilik toko bisa memantau stok dan penjualan tanpa rekap manual.",
    teknologi: ["ReactJS", "Laravel", "PostgreSQL"],
    pola: "titik",
  },
  {
    slug: "sistem-informasi-gudang-bangunan",
    nama: "Sistem Informasi Gudang Bangunan",
    bidang: "Toko material dan bangunan",
    ringkasan: "Stok material tercatat rapi, dari masuk sampai keluar gudang.",
    masalah:
      "Barang material bervolume besar dan jenisnya banyak, membuat pencatatan manual gampang selisih dan sulit dilacak.",
    dikerjakan:
      "Dibangun sistem pencatatan stok gudang bangunan dengan kategori barang, satuan, dan riwayat keluar-masuk yang jelas.",
    hasil: "Pengecekan stok material jadi lebih cepat dan selisih catatan berkurang.",
    teknologi: ["Laravel", "PHP", "PostgreSQL"],
    pola: "grid",
  },
  {
    slug: "sistem-informasi-manajemen-rumah-sakit",
    nama: "Sistem Informasi Manajemen Rumah Sakit",
    bidang: "Rumah Sakit Daerah di Jawa Timur",
    ringkasan: "Data pasien dan layanan rumah sakit dalam satu sistem.",
    masalah:
      "Proses administrasi rumah sakit melibatkan banyak bagian yang sebelumnya bekerja dengan pencatatan terpisah-pisah.",
    dikerjakan:
      "Dikembangkan dan diperbaiki modul sistem informasi manajemen rumah sakit, termasuk perbaikan bug pada sistem yang sudah berjalan.",
    hasil: "Proses administrasi antar bagian rumah sakit lebih tersambung.",
    teknologi: ["Yii2", "Golang", "PostgreSQL"],
    pola: "garis",
  },
  {
    slug: "sistem-informasi-penggajian-karyawan",
    nama: "Sistem Informasi Penggajian Karyawan",
    bidang: "Perusahaan dengan banyak karyawan tetap",
    ringkasan: "Perhitungan gaji karyawan lebih cepat dan lebih jarang salah.",
    masalah:
      "Perhitungan gaji manual memakan waktu dan rawan salah hitung, terutama saat ada potongan atau tunjangan yang berbeda tiap karyawan.",
    dikerjakan:
      "Dibangun sistem penggajian yang menghitung gaji otomatis berdasarkan data kehadiran, tunjangan, dan potongan tiap karyawan.",
    hasil: "Proses hitung gaji bulanan jadi jauh lebih cepat dan konsisten.",
    teknologi: ["Laravel", "PHP", "MySQL"],
    pola: "titik",
  },
  {
    slug: "sistem-informasi-kost",
    nama: "Sistem Informasi Kost",
    bidang: "Pengelola rumah kost",
    ringkasan: "Pencatatan kamar, penyewa, dan pembayaran kost jadi rapi.",
    masalah:
      "Pengelola kost mencatat status kamar dan pembayaran secara manual, membuat sulit memantau kamar mana yang sudah/belum dibayar.",
    dikerjakan:
      "Dibangun sistem pencatatan kamar, data penyewa, dan status pembayaran bulanan dalam satu tempat.",
    hasil: "Status kamar dan pembayaran bisa dicek langsung tanpa buku catatan.",
    teknologi: ["ReactJS", "Node.js", "MongoDB"],
    pola: "grid",
  },
];

const KARYA_COPY: Record<Locale, Record<string, KaryaCopy>> = {
  id: Object.fromEntries(
    DAFTAR_KARYA.map((k) => [
      k.slug,
      {
        nama: k.nama,
        bidang: k.bidang,
        ringkasan: k.ringkasan,
        masalah: k.masalah,
        dikerjakan: k.dikerjakan,
        hasil: k.hasil,
        teknologi: k.teknologi,
      },
    ]),
  ) as Record<string, KaryaCopy>,
  en: {
    "sistem-informasi-gudang-farmasi": {
      nama: "Pharmacy Inventory Information System",
      bidang: "Regional Hospital in East Java",
      ringkasan: "Manual medicine stock records became easier to monitor.",
      masalah:
        "Medicine stock was recorded across paper notes and separate spreadsheets. Differences were often found only after stock ran low or expired.",
      dikerjakan:
        "We built an inventory recording system connected to a central database, with direct tracking for incoming and outgoing items.",
      hasil:
        "Stock can be checked without manual recounting, and data differences are easier to find.",
      teknologi: ["Yii2", "PHP", "PostgreSQL"],
    },
    "business-intelligence-rumah-sakit": {
      nama: "Hospital Business Intelligence",
      bidang: "Regional Hospital in East Java",
      ringkasan: "Operational data was shaped into scheduled reports with Apache Airflow.",
      masalah:
        "Hospital operational data lived in separate systems and was not shaped into reports for decision makers.",
      dikerjakan:
        "We built an ETL flow with Apache Airflow to collect, clean, and prepare data for business intelligence reporting.",
      hasil:
        "Raw and scattered data became readable reports for management decisions.",
      teknologi: ["Python", "Apache Airflow", "PostgreSQL"],
    },
    "sistem-informasi-manajemen-toko": {
      nama: "Store Management Information System",
      bidang: "Retail",
      ringkasan: "Stock, sales, and daily reports moved into one system.",
      masalah:
        "Stock and sales records were handled separately, making it hard for the owner to understand the store condition quickly.",
      dikerjakan:
        "We built a system that combines stock records, sales transactions, and daily reporting in one interface.",
      hasil: "The owner can monitor stock and sales without manual recap work.",
      teknologi: ["ReactJS", "Laravel", "PostgreSQL"],
    },
    "sistem-informasi-gudang-bangunan": {
      nama: "Building Materials Inventory System",
      bidang: "Building materials store",
      ringkasan: "Material stock became traceable from entry to warehouse exit.",
      masalah:
        "Large and varied materials made manual records easy to mismatch and hard to trace.",
      dikerjakan:
        "We built inventory records with categories, units, and clear incoming and outgoing history.",
      hasil: "Stock checks became faster and record mismatches were reduced.",
      teknologi: ["Laravel", "PHP", "PostgreSQL"],
    },
    "sistem-informasi-manajemen-rumah-sakit": {
      nama: "Hospital Management Information System",
      bidang: "Regional Hospital in East Java",
      ringkasan: "Patient and service data connected across hospital units.",
      masalah:
        "Hospital administration involved many units that previously worked with separated records.",
      dikerjakan:
        "We improved and repaired modules in an existing hospital management system, including bug fixes and API work.",
      hasil: "Administration across hospital units became more connected.",
      teknologi: ["Yii2", "Golang", "PostgreSQL"],
    },
    "sistem-informasi-penggajian-karyawan": {
      nama: "Employee Payroll Information System",
      bidang: "Company with permanent employees",
      ringkasan: "Monthly payroll calculation became faster and more consistent.",
      masalah:
        "Manual payroll calculation took time and was prone to errors, especially with different deductions and allowances.",
      dikerjakan:
        "We built payroll logic based on attendance, allowances, and deductions for each employee.",
      hasil: "Monthly salary calculation became faster and more reliable.",
      teknologi: ["Laravel", "PHP", "MySQL"],
    },
    "sistem-informasi-kost": {
      nama: "Boarding House Information System",
      bidang: "Boarding house management",
      ringkasan: "Rooms, tenants, and monthly payments became easier to track.",
      masalah:
        "Room status and payments were recorded manually, making it hard to see which rooms had been paid for.",
      dikerjakan:
        "We built records for rooms, tenants, and monthly payment status in one place.",
      hasil: "Room and payment status can be checked without opening a manual ledger.",
      teknologi: ["ReactJS", "Node.js", "MongoDB"],
    },
  },
  zh: {
    "sistem-informasi-gudang-farmasi": {
      nama: "药房库存信息系统",
      bidang: "东爪哇地区医院",
      ringkasan: "人工药品库存记录变得更容易监控。",
      masalah:
        "药品库存分散记录在纸张和不同表格中。库存不足或过期后，差异才容易被发现。",
      dikerjakan:
        "我们构建了连接中心数据库的库存记录系统，直接追踪入库和出库。",
      hasil: "无需人工反复盘点即可查看库存，数据差异也更容易发现。",
      teknologi: ["Yii2", "PHP", "PostgreSQL"],
    },
    "business-intelligence-rumah-sakit": {
      nama: "医院商业智能",
      bidang: "东爪哇地区医院",
      ringkasan: "使用 Apache Airflow 将运营数据整理为定期报告。",
      masalah:
        "医院运营数据分散在多个系统中，尚未整理成管理层可直接使用的报告。",
      dikerjakan:
        "我们使用 Apache Airflow 构建 ETL 流程，用于采集、清洗并准备商业智能报告数据。",
      hasil: "原本分散的原始数据变成可阅读的管理报告。",
      teknologi: ["Python", "Apache Airflow", "PostgreSQL"],
    },
    "sistem-informasi-manajemen-toko": {
      nama: "门店管理信息系统",
      bidang: "零售",
      ringkasan: "库存、销售和日报集中到一个系统。",
      masalah:
        "库存和销售分开记录，店主很难快速了解门店状况。",
      dikerjakan:
        "我们构建了一个界面，用于整合库存记录、销售交易和日常报告。",
      hasil: "店主无需手动汇总即可查看库存和销售情况。",
      teknologi: ["ReactJS", "Laravel", "PostgreSQL"],
    },
    "sistem-informasi-gudang-bangunan": {
      nama: "建材仓库信息系统",
      bidang: "建材商店",
      ringkasan: "建材库存从入库到出库都可追踪。",
      masalah:
        "建材种类多且体积大，人工记录容易出现差异，也难以追踪。",
      dikerjakan:
        "我们构建了带有分类、单位和出入库历史的库存记录系统。",
      hasil: "库存检查更快，记录差异减少。",
      teknologi: ["Laravel", "PHP", "PostgreSQL"],
    },
    "sistem-informasi-manajemen-rumah-sakit": {
      nama: "医院管理信息系统",
      bidang: "东爪哇地区医院",
      ringkasan: "患者和服务数据在多个科室之间连接起来。",
      masalah:
        "医院行政流程涉及多个部门，以前各部门记录相对分散。",
      dikerjakan:
        "我们改进并修复了现有医院管理系统中的模块，包括问题修复和 API 开发。",
      hasil: "医院各部门之间的行政流程连接得更顺畅。",
      teknologi: ["Yii2", "Golang", "PostgreSQL"],
    },
    "sistem-informasi-penggajian-karyawan": {
      nama: "员工薪资信息系统",
      bidang: "拥有固定员工的公司",
      ringkasan: "月度薪资计算更快、更一致。",
      masalah:
        "人工计算薪资耗时且容易出错，特别是扣款和津贴因员工而异时。",
      dikerjakan:
        "我们根据考勤、津贴和扣款，为每位员工构建薪资计算逻辑。",
      hasil: "月度薪资计算更快，也更稳定可靠。",
      teknologi: ["Laravel", "PHP", "MySQL"],
    },
    "sistem-informasi-kost": {
      nama: "寄宿房管理信息系统",
      bidang: "寄宿房管理",
      ringkasan: "房间、租客和月租付款更容易追踪。",
      masalah:
        "房间状态和付款记录依靠人工登记，很难快速看到哪些房间已经付款。",
      dikerjakan:
        "我们在一个系统中建立房间、租客和月度付款状态记录。",
      hasil: "无需翻看手工账本即可查看房间和付款状态。",
      teknologi: ["ReactJS", "Node.js", "MongoDB"],
    },
  },
};

export function daftarKarya(locale: Locale = "id"): Karya[] {
  return DAFTAR_KARYA.map((karya) => ({
    ...karya,
    ...(KARYA_COPY[locale][karya.slug] ?? KARYA_COPY.id[karya.slug]),
  }));
}

export function cariKarya(slug: string): Karya | undefined {
  return DAFTAR_KARYA.find((k) => k.slug === slug);
}

export function cariKaryaLocale(
  slug: string,
  locale: Locale = "id",
): Karya | undefined {
  return daftarKarya(locale).find((k) => k.slug === slug);
}
