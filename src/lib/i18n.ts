export const LOCALES = ["id", "en", "zh"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "id";

export const LOCALE_LABEL: Record<Locale, string> = {
  id: "ID",
  en: "EN",
  zh: "中文",
};

export const LOCALE_HTML_LANG: Record<Locale, string> = {
  id: "id",
  en: "en",
  zh: "zh-CN",
};

export const LOCALE_OG: Record<Locale, string> = {
  id: "id_ID",
  en: "en_US",
  zh: "zh_CN",
};

export function isLocale(value: string | undefined): value is Locale {
  return LOCALES.includes(value as Locale);
}

export function localeFromPath(pathname: string): Locale {
  const first = pathname.split("/").filter(Boolean)[0];
  return isLocale(first) ? first : DEFAULT_LOCALE;
}

export function stripLocale(pathname: string): string {
  const parts = pathname.split("/").filter(Boolean);
  if (isLocale(parts[0])) parts.shift();
  return `/${parts.join("/")}`.replace(/\/$/, "") || "/";
}

export function withLocale(path: string, locale: Locale): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  if (locale === DEFAULT_LOCALE) return clean;
  return clean === "/" ? `/${locale}` : `/${locale}${clean}`;
}

export function localizedAlternates(path: string) {
  return {
    canonical: withLocale(path, DEFAULT_LOCALE),
    languages: {
      id: withLocale(path, "id"),
      en: withLocale(path, "en"),
      "zh-CN": withLocale(path, "zh"),
    },
  };
}

export const copy = {
  id: {
    metadata: {
      title: "Ionowu - Software House",
      description:
        "Ionowu merancang, membangun, dan merawat aplikasi web serta sistem internal untuk perusahaan yang sedang bertumbuh.",
      ogDescription: "Perangkat lunak yang menopang operasional bisnis Anda.",
    },
    nav: {
      services: "Layanan",
      work: "Karya",
      about: "Tentang",
      contact: "Kontak",
      cta: "Konsultasi",
      openMenu: "Buka menu",
      closeMenu: "Tutup menu",
      homeLabel: "Ionowu, beranda",
      mainNav: "Navigasi utama",
      mobileNav: "Navigasi utama, HP",
      footerNav: "Navigasi kaki halaman",
    },
    common: {
      learnMore: "Pelajari",
      consult: "Konsultasi",
      viewWork: "Lihat karya",
      allWork: "Semua karya",
      relatedWork: "Karya terkait",
      relatedServices: "Layanan terkait",
      technology: "Teknologi",
      backServices: "Semua layanan",
      backWork: "Semua karya",
      responseTime: "Kami balas dalam 1x24 jam kerja.",
    },
    home: {
      heroTitle: "Kami bangun software yang menjaga bisnis tetap bergerak.",
      heroLead:
        "Ionowu membantu perusahaan merancang, membangun, dan merawat sistem operasional yang rapi.",
      servicesTitle: "Yang bisa kami kerjakan",
      servicesLead:
        "Enam layanan inti, disusun dari pengalaman nyata di sistem operasional.",
      processTitle: "Cara kami bekerja",
      workTitle: "Karya terpilih",
      workLead: "Contoh proyek nyata, ditulis jujur tanpa klaim kosong.",
      finalTitle: "Punya sistem yang mulai terasa berat?",
      finalLead: "Ceritakan kebutuhannya. Konsultasi awal gratis dan tanpa ikatan.",
    },
    process: [
      ["Dengar", "Kami pelajari masalah dan alur kerja yang sudah berjalan."],
      ["Rancang", "Kami susun ruang lingkup, jadwal, dan biaya yang jelas."],
      ["Bangun", "Anda melihat kemajuan secara berkala, bukan menunggu di akhir."],
      ["Luncurkan", "Sistem dipasang, diuji, dan tim Anda dilatih."],
      ["Rawat", "Kami tetap tersedia setelah sistem digunakan."],
    ],
    pages: {
      services: {
        title: "Layanan untuk sistem yang benar-benar dipakai",
        lead: "Pilih layanan sesuai masalah operasional Anda. Setiap rincian ditulis berdasarkan kemampuan yang sudah terbukti.",
      },
      work: {
        title: "Pekerjaan yang sudah pernah kami tangani",
        lead: "Contoh proyek dari sistem informasi, gudang, rumah sakit, toko, sampai business intelligence.",
      },
      about: {
        title: "Software house yang bekerja dekat dengan masalah nyata",
        lead: "Ionowu membangun sistem dari cara kerja lapangan, bukan dari template.",
        valuesTitle: "Yang kami pegang",
        teamTitle: "Tim",
        certificationsTitle: "Sertifikasi",
        teamRole: "Pendiri & Software Engineer Utama",
        teamBio:
          "Lulusan Sarjana Terapan Teknik Informatika, Politeknik Negeri Jember. Berpengalaman membangun sistem informasi rumah sakit, gudang, dan business intelligence, dari bug fixing, pengembangan API, sampai pemasangan server.",
        knowMoreTitle: "Mau bicara langsung?",
        knowMoreLead: "Ceritakan kebutuhan Anda. Konsultasi awal gratis dan tanpa ikatan.",
      },
      contact: {
        title: "Ceritakan kebutuhan Anda",
        lead: "Isi formulir singkat ini. Kami balas lewat email dalam 1x24 jam kerja.",
        responseTitle: "Waktu balasan",
        responseBody: "Kami balas dalam 1x24 jam kerja lewat email yang Anda isi.",
        note:
          "Saluran kontak langsung seperti WhatsApp, email resmi, dan lokasi kantor sedang disiapkan. Untuk sekarang, formulir ini adalah jalur utama.",
      },
    },
    values: [
      ["Dengar dulu", "Sistem dibuat mengikuti alur kerja Anda, bukan sebaliknya."],
      ["Jujur soal proses", "Kalau belum tahu jawabannya, kami bilang belum tahu."],
      ["Tetap ada", "Sistem yang sudah jalan tetap butuh dirawat."],
    ],
    form: {
      successTitle: "Pesan diterima",
      successBody: "Terima kasih. Kami balas dalam 1x24 jam kerja.",
      sendAnother: "Kirim pesan lain",
      botField: "Situs web (jangan diisi)",
      name: "Nama",
      email: "Email",
      company: "Perusahaan",
      optional: "Opsional",
      need: "Jenis kebutuhan",
      chooseOne: "Pilih salah satu",
      other: "Lainnya",
      message: "Ceritakan kebutuhan Anda",
      budget: "Perkiraan anggaran",
      budgetHelp: "Opsional, membantu kami menyiapkan rencana yang sesuai",
      sending: "Mengirim...",
      submit: "Kirim pesan",
      failed: "Pesan gagal dikirim. Coba lagi.",
      network: "Tidak bisa menghubungi server. Periksa koneksi Anda.",
      budgets: [
        ["", "Belum tahu / lihat dulu"],
        ["< 10 juta", "Di bawah Rp 10 juta"],
        ["10-50 juta", "Rp 10-50 juta"],
        ["50-150 juta", "Rp 50-150 juta"],
        ["> 150 juta", "Di atas Rp 150 juta"],
      ],
    },
    footer: {
      rights: "Seluruh hak cipta dilindungi.",
      line: "Software house untuk aplikasi web dan sistem operasional.",
    },
  },
  en: {
    metadata: {
      title: "Ionowu - Software House",
      description:
        "Ionowu designs, builds, and maintains web applications and internal systems for growing companies.",
      ogDescription: "Software that keeps business operations moving.",
    },
    nav: {
      services: "Services",
      work: "Work",
      about: "About",
      contact: "Contact",
      cta: "Consult",
      openMenu: "Open menu",
      closeMenu: "Close menu",
      homeLabel: "Ionowu, home",
      mainNav: "Main navigation",
      mobileNav: "Main navigation, mobile",
      footerNav: "Footer navigation",
    },
    common: {
      learnMore: "Learn more",
      consult: "Consult",
      viewWork: "View work",
      allWork: "All work",
      relatedWork: "Related work",
      relatedServices: "Related services",
      technology: "Technology",
      backServices: "All services",
      backWork: "All work",
      responseTime: "We reply within one business day.",
    },
    home: {
      heroTitle: "We build software that keeps business moving.",
      heroLead:
        "Ionowu helps companies design, build, and maintain reliable operational systems.",
      servicesTitle: "What we can build",
      servicesLead:
        "Six core services shaped by real operational system experience.",
      processTitle: "How we work",
      workTitle: "Selected work",
      workLead: "Real project examples, written plainly without inflated claims.",
      finalTitle: "Is your system starting to feel heavy?",
      finalLead: "Tell us what you need. The first consultation is free.",
    },
    process: [
      ["Listen", "We study the problem and the workflow already in place."],
      ["Plan", "We define the scope, timeline, and budget clearly."],
      ["Build", "You see steady progress instead of waiting until the end."],
      ["Launch", "The system is deployed, tested, and handed over to your team."],
      ["Maintain", "We stay available after the system goes live."],
    ],
    pages: {
      services: {
        title: "Services for systems people actually use",
        lead: "Choose a service based on the operational problem you want to solve.",
      },
      work: {
        title: "Work we have handled before",
        lead: "Examples across information systems, inventory, healthcare, retail, and business intelligence.",
      },
      about: {
        title: "A software house close to real operational problems",
        lead: "Ionowu builds from field workflows, not from templates.",
        valuesTitle: "What we believe",
        teamTitle: "Team",
        certificationsTitle: "Certifications",
        teamRole: "Founder & Lead Software Engineer",
        teamBio:
          "Bachelor of Applied Computer Science graduate from Politeknik Negeri Jember. Experienced in hospital systems, inventory systems, and business intelligence, from bug fixing and API development to server setup.",
        knowMoreTitle: "Want to talk directly?",
        knowMoreLead: "Tell us what you need. The first consultation is free.",
      },
      contact: {
        title: "Tell us what you need",
        lead: "Fill in this short form. We reply by email within one business day.",
        responseTitle: "Reply time",
        responseBody: "We reply within one business day using the email you provide.",
        note:
          "Direct channels such as WhatsApp, official email, and office location are being prepared. For now, this form is the main route.",
      },
    },
    values: [
      ["Listen first", "The system follows your workflow, not the other way around."],
      ["Be clear", "If we do not know yet, we say so."],
      ["Stay present", "A live system still needs care."],
    ],
    form: {
      successTitle: "Message received",
      successBody: "Thank you. We reply within one business day.",
      sendAnother: "Send another message",
      botField: "Website (leave blank)",
      name: "Name",
      email: "Email",
      company: "Company",
      optional: "Optional",
      need: "Project type",
      chooseOne: "Choose one",
      other: "Other",
      message: "Tell us what you need",
      budget: "Estimated budget",
      budgetHelp: "Optional, helps us prepare the right plan",
      sending: "Sending...",
      submit: "Send message",
      failed: "The message could not be sent. Please try again.",
      network: "Could not reach the server. Please check your connection.",
      budgets: [
        ["", "Not sure yet"],
        ["< 10 juta", "Below IDR 10 million"],
        ["10-50 juta", "IDR 10-50 million"],
        ["50-150 juta", "IDR 50-150 million"],
        ["> 150 juta", "Above IDR 150 million"],
      ],
    },
    footer: {
      rights: "All rights reserved.",
      line: "Software house for web apps and operational systems.",
    },
  },
  zh: {
    metadata: {
      title: "Ionowu - 软件开发公司",
      description:
        "Ionowu 为成长型企业设计、开发并维护 Web 应用和内部业务系统。",
      ogDescription: "让业务运营持续前进的软件。",
    },
    nav: {
      services: "服务",
      work: "案例",
      about: "关于",
      contact: "联系",
      cta: "咨询",
      openMenu: "打开菜单",
      closeMenu: "关闭菜单",
      homeLabel: "Ionowu 首页",
      mainNav: "主导航",
      mobileNav: "移动端主导航",
      footerNav: "页脚导航",
    },
    common: {
      learnMore: "了解更多",
      consult: "咨询",
      viewWork: "查看案例",
      allWork: "全部案例",
      relatedWork: "相关案例",
      relatedServices: "相关服务",
      technology: "技术",
      backServices: "全部服务",
      backWork: "全部案例",
      responseTime: "我们会在一个工作日内回复。",
    },
    home: {
      heroTitle: "我们打造让业务持续运转的软件。",
      heroLead:
        "Ionowu 帮助企业设计、开发并维护稳定的运营系统。",
      servicesTitle: "我们能提供的服务",
      servicesLead: "六项核心服务，来自真实运营系统经验。",
      processTitle: "我们的工作方式",
      workTitle: "精选案例",
      workLead: "真实项目示例，表达清楚，不夸大。",
      finalTitle: "您的系统是否开始变得沉重？",
      finalLead: "告诉我们您的需求。首次咨询免费。",
    },
    process: [
      ["倾听", "我们先了解问题和现有工作流程。"],
      ["规划", "我们明确范围、时间和预算。"],
      ["开发", "您会持续看到进展，而不是等到最后。"],
      ["上线", "系统会经过部署、测试，并交接给团队。"],
      ["维护", "系统上线后，我们仍然提供支持。"],
    ],
    pages: {
      services: {
        title: "为真实业务使用而设计的服务",
        lead: "根据您要解决的运营问题选择服务。",
      },
      work: {
        title: "我们处理过的项目",
        lead: "涵盖信息系统、库存、医疗、零售和商业智能等场景。",
      },
      about: {
        title: "贴近真实运营问题的软件开发团队",
        lead: "Ionowu 从实际工作流程出发，而不是套用模板。",
        valuesTitle: "我们的原则",
        teamTitle: "团队",
        certificationsTitle: "认证",
        teamRole: "创始人兼首席软件工程师",
        teamBio:
          "毕业于 Politeknik Negeri Jember 应用计算机科学专业。拥有医院系统、库存系统和商业智能项目经验，涵盖问题修复、API 开发和服务器部署。",
        knowMoreTitle: "想直接沟通？",
        knowMoreLead: "告诉我们您的需求。首次咨询免费。",
      },
      contact: {
        title: "告诉我们您的需求",
        lead: "填写这个简短表单。我们会在一个工作日内通过邮件回复。",
        responseTitle: "回复时间",
        responseBody: "我们会通过您填写的邮箱，在一个工作日内回复。",
        note:
          "WhatsApp、官方邮箱和办公地点等直接联系方式正在准备中。当前请优先使用此表单。",
      },
    },
    values: [
      ["先倾听", "系统应服务于您的流程，而不是反过来。"],
      ["说清楚", "如果暂时不知道答案，我们会直接说明。"],
      ["持续在场", "上线后的系统仍然需要维护。"],
    ],
    form: {
      successTitle: "消息已收到",
      successBody: "谢谢。我们会在一个工作日内回复。",
      sendAnother: "再发送一条消息",
      botField: "网站（请留空）",
      name: "姓名",
      email: "邮箱",
      company: "公司",
      optional: "可选",
      need: "项目类型",
      chooseOne: "请选择",
      other: "其他",
      message: "告诉我们您的需求",
      budget: "预计预算",
      budgetHelp: "可选，有助于我们准备合适方案",
      sending: "发送中...",
      submit: "发送消息",
      failed: "消息发送失败。请重试。",
      network: "无法连接服务器。请检查网络。",
      budgets: [
        ["", "暂不确定"],
        ["< 10 juta", "低于 1000 万印尼盾"],
        ["10-50 juta", "1000-5000 万印尼盾"],
        ["50-150 juta", "5000 万-1.5 亿印尼盾"],
        ["> 150 juta", "高于 1.5 亿印尼盾"],
      ],
    },
    footer: {
      rights: "版权所有。",
      line: "专注 Web 应用和运营系统的软件开发公司。",
    },
  },
} as const;

export type Copy = (typeof copy)[Locale];
