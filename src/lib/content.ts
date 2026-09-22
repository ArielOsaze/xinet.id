/**
 * Xinet — bilingual content dictionary (ID / EN).
 * Every user-facing string lives here so copy stays consistent and auditable.
 */

export type Lang = "id" | "en";
export type Bi = Record<Lang, string>;

export type Product = {
  id: string;
  name: string;
  category: Bi;
  description: Bi;
  cta: Bi;
  /** Live product URL, or null when the product has no public destination yet. */
  url: string | null;
  /** Restrained per-product hue used only for the card artwork surface. */
  hue: string;
  /** Real product screenshot shown inside the macOS-style window frame. */
  shot: string;
  /** Caption for the window title bar (the product's own name/domain). */
  shotTitle: string;
  /** Alt text describing what the screenshot actually shows. */
  shotAlt: Bi;
};

export const NAV: { id: string; label: Bi }[] = [
  { id: "products", label: { id: "Produk", en: "Products" } },
  { id: "about", label: { id: "Tentang", en: "About" } },
  { id: "labs", label: { id: "Labs", en: "Labs" } },
  { id: "contact", label: { id: "Kontak", en: "Contact" } },
];

export const PRODUCTS: Product[] = [
  {
    id: "nexshop",
    name: "NexShop",
    category: { id: "Digital Commerce", en: "Digital Commerce" },
    description: {
      id: "Platform perdagangan digital untuk top up game, produk digital, dan layanan reseller.",
      en: "A digital commerce platform for game top-ups, digital products and reseller services.",
    },
    cta: { id: "Kunjungi NexShop", en: "Visit NexShop" },
    url: "https://nexshop.cloud",
    hue: "34 199 232",
    shot: "/products/nexshop.webp",
    shotTitle: "nexshop.cloud",
    shotAlt: {
      id: "Beranda NexShop dengan katalog top up game dan tombol belanja.",
      en: "NexShop storefront showing the game top-up catalog and shop call to action.",
    },
  },
  {
    id: "saybot",
    name: "SayBot",
    category: { id: "Komunikasi", en: "Communication" },
    description: {
      id: "Ruang kerja perpesanan multi-kanal untuk operasional WhatsApp, Telegram, Email, dan Chat Website.",
      en: "A multi-channel messaging workspace for WhatsApp, Telegram, Email and Website Chat operations.",
    },
    cta: { id: "Jelajahi SayBot", en: "Explore SayBot" },
    url: "https://saybot.nexshop.cloud",
    hue: "74 222 128",
    shot: "/products/saybot.webp",
    shotTitle: "saybot.nexshop.cloud",
    shotAlt: {
      id: "Halaman SayBot yang menjelaskan penyatuan WhatsApp, Telegram, Email, dan Chat Website dalam satu alur kerja.",
      en: "SayBot landing page describing WhatsApp, Telegram, Email and Website Chat unified in one workflow.",
    },
  },
  {
    id: "akuntuntas",
    name: "AkunTuntas",
    category: { id: "Alat Bisnis", en: "Business Tools" },
    description: {
      id: "Perangkat lunak akuntansi dan pembukuan sederhana yang dibuat untuk bisnis modern.",
      en: "Simple accounting and bookkeeping software built for modern businesses.",
    },
    cta: { id: "Kenali AkunTuntas", en: "Discover AkunTuntas" },
    url: null,
    hue: "251 191 36",
    shot: "/products/akuntuntas.webp",
    shotTitle: "AkunTuntas — Laporan Keuangan",
    shotAlt: {
      id: "Layar laporan laba rugi AkunTuntas dengan ringkasan pendapatan, laba, dan margin.",
      en: "AkunTuntas income statement screen showing revenue, profit and margin summaries.",
    },
  },
];

export const STRIP: string[] = [
  "NexShop",
  "SayBot",
  "AkunTuntas",
  "Xinet Labs",
];

export const CAPABILITIES: {
  n: string;
  title: Bi;
  description: Bi;
}[] = [
  {
    n: "01",
    title: { id: "Commerce", en: "Commerce" },
    description: {
      id: "Platform transaksi dan distribusi produk digital.",
      en: "Transaction and distribution platforms for digital products.",
    },
  },
  {
    n: "02",
    title: { id: "Komunikasi", en: "Communication" },
    description: {
      id: "Alat perpesanan dan operasional multi-kanal.",
      en: "Multi-channel messaging and operational tooling.",
    },
  },
  {
    n: "03",
    title: { id: "Alat Bisnis", en: "Business Tools" },
    description: {
      id: "Perangkat pembukuan, administrasi, dan operasional.",
      en: "Accounting, administration and operational software.",
    },
  },
  {
    n: "04",
    title: { id: "Otomasi", en: "Automation" },
    description: {
      id: "Alur kerja otomatis yang mengurangi pekerjaan manual.",
      en: "Automated workflows that remove manual work.",
    },
  },
  {
    n: "05",
    title: { id: "Kecerdasan Artifisial", en: "Artificial Intelligence" },
    description: {
      id: "AI praktis yang tertanam pada produk nyata.",
      en: "Practical AI embedded in real products.",
    },
  },
  {
    n: "06",
    title: { id: "Eksperimen", en: "Experiments" },
    description: {
      id: "Riset dan purwarupa untuk hal yang belum ada.",
      en: "Research and prototypes for what does not exist yet.",
    },
  },
];

/** Categories shown in Xinet Labs. */
export const LAB_CATEGORIES: Bi[] = [
  { id: "Perangkat lunak eksperimental", en: "Experimental software" },
  { id: "Purwarupa AI", en: "AI prototypes" },
  { id: "Alat internal", en: "Internal tools" },
  { id: "Alat developer", en: "Developer tools" },
  { id: "Eksperimen open-source", en: "Open-source experiments" },
  { id: "Konsep produk awal", en: "Early product concepts" },
];

/**
 * Projects currently in the lab. These are real Xinet-built projects that sit
 * outside the flagship products, labelled honestly by their stage.
 */
export const LAB_ITEMS: {
  name: string;
  status: Bi;
  description: Bi;
  url: string | null;
}[] = [
  {
    name: "Amara AI Assistant",
    status: { id: "Rilis", en: "Shipped" },
    description: {
      id: "Pendamping desktop AI dengan avatar 3D dan percakapan suara.",
      en: "An AI desktop companion with a 3D avatar and voice conversation.",
    },
    url: null,
  },
  {
    name: "LumaWall",
    status: { id: "Rilis", en: "Shipped" },
    description: {
      id: "Aplikasi live wallpaper Windows dengan katalog multi-monitor.",
      en: "A Windows live wallpaper application with a multi-monitor catalog.",
    },
    url: null,
  },
  {
    name: "NexPlay",
    status: { id: "Konsep awal", en: "Early concept" },
    description: {
      id: "Eksplorasi marketplace digital untuk komunitas gaming.",
      en: "A digital marketplace exploration for gaming communities.",
    },
    url: null,
  },
  {
    name: "safe-loadtest",
    status: { id: "Alat internal", en: "Internal tool" },
    description: {
      id: "Penguji ketahanan HTTP dengan batas aman untuk server sendiri.",
      en: "A guarded HTTP resilience tester for servers you own.",
    },
    url: null,
  },
];

export const FOOTER_PRODUCTS: { name: string; url: string | null }[] = [
  { name: "NexShop", url: "https://nexshop.cloud" },
  { name: "SayBot", url: "https://saybot.nexshop.cloud" },
  { name: "AkunTuntas", url: null },
];

export const FOOTER_COMPANY: { id: string; label: Bi }[] = [
  { id: "about", label: { id: "Tentang", en: "About" } },
  { id: "labs", label: { id: "Labs", en: "Labs" } },
  { id: "contact", label: { id: "Kontak", en: "Contact" } },
];

export const SOCIALS: { name: string; href: string; label: string }[] = [
  { name: "LinkedIn", href: "https://www.linkedin.com/company/xinet", label: "LinkedIn" },
  { name: "GitHub", href: "https://github.com/xinet", label: "GitHub" },
  { name: "Instagram", href: "https://www.instagram.com/xinet.id", label: "Instagram" },
];

export const COPY = {
  brand: {
    name: "XINET",
    tagline: { id: "Bangun yang berikutnya.", en: "Build what's next." },
  },
  nav: {
    cta: { id: "Jelajahi Produk", en: "Explore Products" },
    menuOpen: { id: "Buka menu", en: "Open menu" },
    menuClose: { id: "Tutup menu", en: "Close menu" },
    langLabel: { id: "Bahasa", en: "Language" },
  },
  hero: {
    eyebrow: { id: "Perusahaan Produk Digital", en: "Digital Product Company" },
    heading: { id: "Bangun yang berikutnya.", en: "Build what's next." },
    sub: {
      id: "Xinet membangun produk digital di bidang commerce, komunikasi, alat bisnis, otomasi, dan teknologi yang sedang tumbuh.",
      en: "Xinet builds digital products across commerce, communication, business tools, automation and emerging technology.",
    },
    ctaPrimary: { id: "Jelajahi produk kami", en: "Explore our products" },
    ctaSecondary: { id: "Tentang Xinet", en: "About Xinet" },
    micro: {
      id: "Produk independen. Satu ekosistem.",
      en: "Independent products. One ecosystem.",
    },
    logoAlt: {
      id: "Logo Xinet",
      en: "Xinet logo",
    },
  },
  ecosystem: {
    eyebrow: { id: "Ekosistem Kami", en: "Our Ecosystem" },
    heading: {
      id: "Produk berbeda. Satu arah.",
      en: "Different products. One direction.",
    },
    body: {
      id: "Kami membangun produk digital yang terfokus, masing-masing dirancang untuk masalah tertentu namun berbagi komitmen yang sama terhadap teknologi yang berguna.",
      en: "We create focused digital products, each designed around a specific problem while sharing the same commitment to useful technology.",
    },
  },
  products: {
    eyebrow: { id: "Produk Unggulan", en: "Featured Products" },
    heading: { id: "Produk kami", en: "Our products" },
    soon: { id: "Segera hadir", en: "Coming soon" },
    external: { id: "buka di tab baru", en: "opens in a new tab" },
  },
  strip: {
    heading: { id: "Produk yang dibangun di dalam Xinet.", en: "Products built within Xinet." },
    aria: { id: "Daftar produk Xinet", en: "List of Xinet products" },
  },
  philosophy: {
    heading: {
      id: "Teknologi yang berguna dimulai dari masalah yang layak diselesaikan.",
      en: "Useful technology starts with a problem worth solving.",
    },
    body: {
      id: "Kami tidak membangun produk mengikuti tren. Kami menemukan masalah nyata, merancang solusi praktis, dan terus menyempurnakan apa yang kami rilis.",
      en: "We don't build products around trends. We identify real problems, design practical solutions and continuously improve what we ship.",
    },
    statement: {
      id: "Teknologi adalah alat. Kegunaan adalah tujuan.",
      en: "Technology is the tool. Utility is the goal.",
    },
  },
  build: {
    eyebrow: { id: "Yang Kami Bangun", en: "What We Build" },
    heading: { id: "Bidang yang kami kerjakan.", en: "The areas we work in." },
  },
  labs: {
    eyebrow: { id: "Ruang Eksperimen", en: "Experimental Space" },
    heading: { id: "Xinet Labs", en: "Xinet Labs" },
    body: {
      id: "Ruang untuk ide yang masih dalam proses menjadi produk.",
      en: "A space for ideas that are still becoming products.",
    },
    cta: { id: "Jelajahi eksperimen", en: "Explore experiments" },
    categoriesLabel: { id: "Bidang eksperimen", en: "Experiment areas" },
    currentLabel: { id: "Sedang dikerjakan", en: "Currently in the lab" },
  },
  about: {
    eyebrow: { id: "Tentang Xinet", en: "About Xinet" },
    heading: {
      id: "Satu ekosistem. Dibangun untuk terus tumbuh.",
      en: "One ecosystem. Built to keep growing.",
    },
    body: {
      id: "Xinet mengembangkan produk digital independen dalam satu ekosistem bersama. Setiap produk memiliki identitas, audiens, dan tujuan sendiri, sambil berbagi teknologi, eksperimen, dan cara berpikir produk jangka panjang.",
      en: "Xinet develops independent digital products under one shared ecosystem. Each product has its own identity, audience and purpose while sharing technology, experimentation and long-term product thinking.",
    },
  },
  finalCta: {
    heading: { id: "Punya sesuatu yang layak dibangun?", en: "Have something worth building?" },
    body: {
      id: "Mari bicara tentang produk, teknologi, dan apa yang berikutnya.",
      en: "Let's talk about products, technology and what comes next.",
    },
    primary: { id: "Hubungi Xinet", en: "Contact Xinet" },
    secondary: { id: "Jelajahi produk", en: "Explore products" },
  },
  footer: {
    tagline: { id: "Bangun yang berikutnya.", en: "Build what's next." },
    productsLabel: { id: "Produk", en: "Products" },
    companyLabel: { id: "Perusahaan", en: "Company" },
    connectLabel: { id: "Terhubung", en: "Connect" },
    rights: { id: "© 2026 Xinet. Seluruh hak cipta dilindungi.", en: "© 2026 Xinet. All rights reserved." },
    madeIn: { id: "Dibangun di Indonesia.", en: "Built in Indonesia." },
  },
  builtBy: {
    label: { id: "Dibuat oleh Xinet", en: "Built by Xinet" },
  },
} as const;
