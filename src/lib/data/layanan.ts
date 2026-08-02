import type { Locale } from "@/lib/i18n";

export type IkonLayanan =
  | "code"
  | "buildings"
  | "plugs"
  | "chart-line-up"
  | "hard-drives"
  | "robot";

export type Layanan = {
  slug: string;
  ikon: IkonLayanan;
  judul: string;
  /** Satu kalimat — dipakai di kartu beranda dan daftar. */
  kalimat: string;
  /** 2-3 kalimat — dipakai di halaman rincian. */
  masalah: string;
  /** Daftar poin "apa yang Anda dapat". */
  didapat: string[];
  teknologi: string[];
  /** Slug karya terkait, lihat src/lib/data/karya.ts. */
  karyaTerkait: string[];
};

type LayananCopy = Pick<
  Layanan,
  "judul" | "kalimat" | "masalah" | "didapat" | "teknologi"
>;

/* Dasar penyusunan (dokumen 03): pengalaman nyata di
   referensi/cv-data-real-novenda.pdf — sistem rumah sakit, gudang farmasi,
   ETL, Apache Airflow, API Golang, pemasangan server Proxmox/CentOS/Ubuntu.

   `[BELUM ADA]` — konfirmasi layanan mana yang benar-benar dijual, harganya,
   dan perkiraan lama pengerjaan. Belum ditulis di sini karena belum ada
   datanya — bukan lupa. */
export const DAFTAR_LAYANAN: Layanan[] = [
  {
    slug: "aplikasi-web-khusus",
    ikon: "code",
    judul: "Aplikasi Web Khusus",
    kalimat: "Sistem informasi sesuai alur kerja bisnis Anda, bukan template.",
    masalah:
      "Software siap pakai sering memaksa Anda mengubah cara kerja supaya cocok dengan sistemnya. Kami membalik itu: sistem dibangun mengikuti alur kerja yang sudah berjalan di tempat Anda.",
    didapat: [
      "Alur kerja dipelajari dulu, sebelum satu baris kode ditulis",
      "Antarmuka yang dipakai tim Anda sehari-hari, bukan generik",
      "Kode sumber jadi milik Anda sepenuhnya",
      "Dokumentasi teknis untuk perawatan jangka panjang",
    ],
    teknologi: ["Next.js", "React", "Golang", "PostgreSQL"],
    karyaTerkait: [
      "sistem-informasi-manajemen-toko",
      "sistem-informasi-kost",
    ],
  },
  {
    slug: "sistem-informasi-perusahaan",
    ikon: "buildings",
    judul: "Sistem Informasi Perusahaan",
    kalimat: "Gudang, kepegawaian, penggajian, manajemen toko.",
    masalah:
      "Pencatatan manual gampang salah dan susah dilacak siapa mengubah apa. Sistem informasi menyatukan data operasional dalam satu tempat yang bisa diakses tim yang tepat, kapan pun dibutuhkan.",
    didapat: [
      "Satu sumber data, bukan tersebar di banyak berkas",
      "Hak akses berjenjang sesuai peran tim",
      "Riwayat perubahan tercatat, mudah ditelusuri",
      "Laporan yang bisa diunduh kapan saja",
    ],
    teknologi: ["Laravel", "PHP", "Next.js", "PostgreSQL"],
    karyaTerkait: [
      "sistem-informasi-gudang-farmasi",
      "sistem-informasi-gudang-bangunan",
      "sistem-informasi-penggajian-karyawan",
    ],
  },
  {
    slug: "integrasi-api",
    ikon: "plugs",
    judul: "Integrasi & API",
    kalimat: "Menyambungkan sistem lama dengan sistem baru.",
    masalah:
      "Mengganti seluruh sistem lama sekaligus itu mahal dan berisiko. Biasanya yang dibutuhkan cuma menyambungkan data antar sistem yang sudah ada, supaya tidak ada lagi input dobel.",
    didapat: [
      "API yang menghubungkan sistem lama dan baru",
      "Data konsisten di semua sistem yang tersambung",
      "Dibangun di atas database yang sudah berjalan, tanpa migrasi paksa",
      "Dokumentasi API untuk tim teknis internal Anda",
    ],
    teknologi: ["Golang", "PostgreSQL", "Node.js"],
    karyaTerkait: ["sistem-informasi-manajemen-rumah-sakit"],
  },
  {
    slug: "business-intelligence-data",
    ikon: "chart-line-up",
    judul: "Business Intelligence & Data",
    kalimat:
      "Data mentah diolah jadi laporan yang bisa dipakai mengambil keputusan.",
    masalah:
      "Data yang menumpuk tanpa diolah tidak ada gunanya. Kami membangun jalur pengolahan data dari pengumpulan, pembersihan, sampai laporan yang siap dibaca dengan Apache Airflow.",
    didapat: [
      "Pipeline data otomatis lewat Apache Airflow",
      "Dasbor laporan yang diperbarui sendiri",
      "Data mentah dibersihkan sebelum diolah (proses ETL)",
      "Format laporan disesuaikan kebutuhan pengambil keputusan",
    ],
    teknologi: ["Python", "Apache Airflow", "PostgreSQL"],
    karyaTerkait: ["business-intelligence-rumah-sakit"],
  },
  {
    slug: "infrastruktur-server",
    ikon: "hard-drives",
    judul: "Infrastruktur & Server",
    kalimat: "Pemasangan, perawatan, dan pengamanan server.",
    masalah:
      "Sistem yang bagus tetap butuh tempat berjalan yang stabil. Kami memasang dan merawat server, termasuk server cadangan, supaya sistem Anda tetap hidup saat dibutuhkan.",
    didapat: [
      "Pemasangan server di distro Linux (Proxmox, CentOS, Ubuntu)",
      "Server cadangan untuk mengurangi risiko sistem mati total",
      "Pengamanan dasar server",
      "Panduan perawatan untuk tim internal Anda",
    ],
    teknologi: ["Proxmox", "CentOS", "Ubuntu", "Linux"],
    karyaTerkait: [],
  },
  {
    slug: "otomasi-ai",
    ikon: "robot",
    judul: "Otomasi dengan AI",
    kalimat: "Bot dan alat bantu otomatis untuk pekerjaan berulang.",
    masalah:
      "Pekerjaan berulang yang dikerjakan manusia setiap hari menghabiskan waktu yang bisa dipakai untuk hal lain. Kami bangun bot dan alat bantu yang mengerjakan bagian berulang itu untuk Anda.",
    didapat: [
      "Bot yang dibatasi menjawab sesuai bahan yang Anda sediakan",
      "Tidak berjanji atau mengarang di luar data yang diberikan",
      "Bisa mengarahkan ke manusia saat tidak tahu jawabannya",
      "Cocok untuk tanya-jawab pelanggan atau ringkasan data rutin",
    ],
    teknologi: ["Python", "FastAPI"],
    karyaTerkait: [],
  },
];

const LAYANAN_COPY: Record<Locale, Record<string, LayananCopy>> = {
  id: Object.fromEntries(
    DAFTAR_LAYANAN.map((l) => [
      l.slug,
      {
        judul: l.judul,
        kalimat: l.kalimat,
        masalah: l.masalah,
        didapat: l.didapat,
        teknologi: l.teknologi,
      },
    ]),
  ) as Record<string, LayananCopy>,
  en: {
    "aplikasi-web-khusus": {
      judul: "Custom Web Applications",
      kalimat: "Business systems shaped around your workflow, not a template.",
      masalah:
        "Off-the-shelf software often asks your team to change how they work. We do the opposite: the system is built around the workflow that already makes sense for your business.",
      didapat: [
        "Workflow discovery before code starts",
        "Interfaces designed for daily team use",
        "Source code owned by your business",
        "Technical documentation for long-term maintenance",
      ],
      teknologi: ["Next.js", "React", "Golang", "PostgreSQL"],
    },
    "sistem-informasi-perusahaan": {
      judul: "Company Information Systems",
      kalimat: "Inventory, HR, payroll, and store management in one place.",
      masalah:
        "Manual records are easy to lose, duplicate, and misread. An information system gives your team one shared source of operational data.",
      didapat: [
        "One source of truth for operational records",
        "Role-based access for different teams",
        "Change history that can be traced",
        "Reports that can be downloaded when needed",
      ],
      teknologi: ["Laravel", "PHP", "Next.js", "PostgreSQL"],
    },
    "integrasi-api": {
      judul: "Integration & API",
      kalimat: "Connect legacy systems with new tools.",
      masalah:
        "Replacing every old system at once is expensive and risky. Often the better move is to connect the systems you already use so data does not need to be entered twice.",
      didapat: [
        "APIs that connect old and new systems",
        "More consistent data across connected tools",
        "Work built on top of the database you already use",
        "API documentation for your internal technical team",
      ],
      teknologi: ["Golang", "PostgreSQL", "Node.js"],
    },
    "business-intelligence-data": {
      judul: "Business Intelligence & Data",
      kalimat: "Turn raw data into reports people can use.",
      masalah:
        "Data that keeps piling up does not help until it is cleaned and shaped. We build automated data pipelines and reporting flows with tools such as Apache Airflow.",
      didapat: [
        "Automated data pipelines with Apache Airflow",
        "Reporting dashboards that refresh on schedule",
        "Cleaned data before analysis",
        "Report formats matched to decision-making needs",
      ],
      teknologi: ["Python", "Apache Airflow", "PostgreSQL"],
    },
    "infrastruktur-server": {
      judul: "Infrastructure & Servers",
      kalimat: "Server setup, care, and basic hardening.",
      masalah:
        "Good software still needs a stable place to run. We help set up and maintain servers so the system stays available when your team needs it.",
      didapat: [
        "Linux server setup with Proxmox, CentOS, or Ubuntu",
        "Backup server planning to reduce downtime risk",
        "Basic server hardening",
        "Maintenance guidance for your internal team",
      ],
      teknologi: ["Proxmox", "CentOS", "Ubuntu", "Linux"],
    },
    "otomasi-ai": {
      judul: "AI Automation",
      kalimat: "Bots and tools for repetitive work.",
      masalah:
        "Repetitive daily work takes time away from more important decisions. We build assistants and automations that handle the repeatable parts with clear boundaries.",
      didapat: [
        "Bots that answer only from approved material",
        "Clear limits so the bot does not invent answers",
        "Escalation to a person when needed",
        "Useful for customer questions or routine summaries",
      ],
      teknologi: ["Python", "FastAPI"],
    },
  },
  zh: {
    "aplikasi-web-khusus": {
      judul: "定制 Web 应用",
      kalimat: "围绕您的业务流程构建系统，而不是套用模板。",
      masalah:
        "现成软件常常要求团队改变工作方式。我们反过来做：系统会围绕您现有且有效的流程来设计。",
      didapat: [
        "编码前先梳理真实工作流程",
        "为团队日常使用设计界面",
        "源代码归您的企业所有",
        "提供长期维护所需的技术文档",
      ],
      teknologi: ["Next.js", "React", "Golang", "PostgreSQL"],
    },
    "sistem-informasi-perusahaan": {
      judul: "企业信息系统",
      kalimat: "库存、人事、薪资和门店管理集中在一个系统中。",
      masalah:
        "人工记录容易丢失、重复和误读。信息系统能让团队共享同一个运营数据来源。",
      didapat: [
        "运营记录拥有统一数据来源",
        "不同团队使用分级权限",
        "变更历史可追踪",
        "需要时可下载报告",
      ],
      teknologi: ["Laravel", "PHP", "Next.js", "PostgreSQL"],
    },
    "integrasi-api": {
      judul: "系统集成与 API",
      kalimat: "连接旧系统和新工具。",
      masalah:
        "一次性替换所有旧系统成本高且风险大。更好的方式通常是连接已有系统，减少重复录入。",
      didapat: [
        "连接旧系统与新系统的 API",
        "让多个工具中的数据更一致",
        "基于现有数据库继续构建",
        "为内部技术团队提供 API 文档",
      ],
      teknologi: ["Golang", "PostgreSQL", "Node.js"],
    },
    "business-intelligence-data": {
      judul: "商业智能与数据",
      kalimat: "把原始数据变成可用于决策的报告。",
      masalah:
        "不断堆积的数据如果不清洗和整理，就无法支持决策。我们构建自动化数据管道和报告流程，例如使用 Apache Airflow。",
      didapat: [
        "使用 Apache Airflow 构建自动化数据管道",
        "按计划刷新的报告看板",
        "分析前先清洗数据",
        "根据决策需求设计报告格式",
      ],
      teknologi: ["Python", "Apache Airflow", "PostgreSQL"],
    },
    "infrastruktur-server": {
      judul: "基础设施与服务器",
      kalimat: "服务器安装、维护和基础安全加固。",
      masalah:
        "优秀的软件也需要稳定的运行环境。我们帮助安装和维护服务器，让系统在团队需要时保持可用。",
      didapat: [
        "基于 Proxmox、CentOS 或 Ubuntu 的 Linux 服务器安装",
        "规划备用服务器以降低停机风险",
        "基础服务器安全加固",
        "为内部团队提供维护指南",
      ],
      teknologi: ["Proxmox", "CentOS", "Ubuntu", "Linux"],
    },
    "otomasi-ai": {
      judul: "AI 自动化",
      kalimat: "为重复性工作构建机器人和自动工具。",
      masalah:
        "每天重复处理的工作会占用团队时间。我们构建有边界的助手和自动化工具，处理可重复的部分。",
      didapat: [
        "只根据指定资料回答的机器人",
        "清晰限制，避免机器人编造答案",
        "需要时转交给人工处理",
        "适合客户问答或日常数据摘要",
      ],
      teknologi: ["Python", "FastAPI"],
    },
  },
};

export function daftarLayanan(locale: Locale = "id"): Layanan[] {
  return DAFTAR_LAYANAN.map((layanan) => ({
    ...layanan,
    ...(LAYANAN_COPY[locale][layanan.slug] ?? LAYANAN_COPY.id[layanan.slug]),
  }));
}

export function cariLayanan(slug: string): Layanan | undefined {
  return DAFTAR_LAYANAN.find((l) => l.slug === slug);
}

export function cariLayananLocale(
  slug: string,
  locale: Locale = "id",
): Layanan | undefined {
  return daftarLayanan(locale).find((l) => l.slug === slug);
}
