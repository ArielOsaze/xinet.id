/**
 * Xinet bilingual content dictionary (ID / EN).
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
    hue: "96 165 250",
    shot: "/products/saybot.webp",
    shotTitle: "saybot.nexshop.cloud",
    shotAlt: {
      id: "Halaman depan SayBot yang menjelaskan penyatuan WhatsApp, Telegram, Email, dan Chat Website.",
      en: "The SayBot landing page describing WhatsApp, Telegram, Email and Website Chat unified.",
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
    hue: "167 139 250",
    shot: "/products/akuntuntas.webp",
    shotTitle: "AkunTuntas · Laporan Keuangan",
    shotAlt: {
      id: "Layar laporan laba rugi AkunTuntas dengan ringkasan pendapatan, laba, dan margin.",
      en: "AkunTuntas income statement screen showing revenue, profit and margin summaries.",
    },
  },
  {
    id: "amara",
    name: "Amara AI Assistant",
    category: { id: "Kecerdasan Artifisial", en: "Artificial Intelligence" },
    description: {
      id: "Pendamping desktop AI dengan avatar 3D yang bisa diajak bicara dengan suara.",
      en: "An AI desktop companion with a 3D avatar you can talk to by voice.",
    },
    cta: { id: "Kenali Amara", en: "Discover Amara" },
    url: null,
    hue: "196 181 253",
    shot: "/products/amara.webp",
    shotTitle: "Amara · AI Assistant",
    shotAlt: {
      id: "Aplikasi Amara AI Assistant menampilkan avatar 3D dan panel percakapan.",
      en: "Amara AI Assistant app showing its 3D avatar and chat panel.",
    },
  },
  {
    id: "lumawall",
    name: "LumaWall",
    category: { id: "Alat Desktop", en: "Desktop Tools" },
    description: {
      id: "Mesin wallpaper hidup untuk Windows dengan katalog multi-monitor.",
      en: "A live wallpaper engine for Windows with a multi-monitor catalog.",
    },
    cta: { id: "Kenali LumaWall", en: "Discover LumaWall" },
    url: null,
    hue: "125 211 252",
    shot: "/products/lumawall.webp",
    shotTitle: "LumaWall · Desktop Engine",
    shotAlt: {
      id: "Katalog wallpaper LumaWall dengan pilihan monitor.",
      en: "The LumaWall wallpaper catalog with monitor selection.",
    },
  },
];

export const STRIP: string[] = [
  "NexShop",
  "SayBot",
  "AkunTuntas",
  "Amara",
  "LumaWall",
  "Xinet Labs",
];

/**
 * Per-product detail, shown on /projects/<id>.
 *
 * These pages exist so a visitor can click a card and actually see what the
 * product IS: the problem it answers, the vision behind it, what it does today,
 * and real captures of it running. Everything here is derived from the shipped
 * products; no roadmap items are presented as features, and no metric is
 * invented.
 */
export type ProjectDetail = {
  id: string;
  /** One line that states the product's purpose. */
  tagline: Bi;
  /** The problem this product exists to solve. */
  problem: Bi;
  /** The vision: where it is going and why it matters. */
  vision: Bi;
  /** What it does today, as shipped. */
  features: { title: Bi; body: Bi }[];
  /** Honest build status. */
  status: Bi;
  /** Real captures, in order. Paths live under /public/products. */
  gallery: { src: string; caption: Bi }[];
  /** Optional facts shown as a spec list. */
  facts?: { label: Bi; value: Bi }[];
};

export const PROJECT_DETAILS: ProjectDetail[] = [
  {
    id: "nexshop",
    tagline: {
      id: "Tempat orang membeli produk digital tanpa ribet.",
      en: "Where people buy digital products without friction.",
    },
    problem: {
      id: "Membeli top up game dan produk digital di Indonesia masih penuh langkah: transfer manual, konfirmasi lewat chat, lalu menunggu tanpa kejelasan. Pembeli tidak tahu pesanannya diproses atau tidak, dan penjual menghabiskan waktu menjawab pertanyaan yang sama berulang kali.",
      en: "Buying game top-ups and digital products in Indonesia is still full of steps: manual transfer, confirmation over chat, then waiting with no clarity. Buyers cannot tell whether their order is being processed, and sellers spend their day answering the same questions.",
    },
    vision: {
      id: "NexShop dibangun supaya jarak antara \"aku mau beli\" dan \"pesananku selesai\" sesingkat mungkin: tanpa chat, tanpa menunggu tanpa kabar. Ke depan, NexShop jadi tulang punggung commerce digital Xinet: satu tempat untuk produk, pembayaran, dan reseller yang semuanya jalan otomatis.",
      en: "NexShop exists to make the distance between \"I want to buy\" and \"my order is done\" as short as possible: no chat, no silent waiting. Going forward it becomes the backbone of Xinet's digital commerce: one place for products, payments and resellers, all running automatically.",
    },
    status: {
      id: "Berjalan & melayani pesanan nyata",
      en: "Live and serving real orders",
    },
    features: [
      {
        title: { id: "Katalog yang jelas", en: "A clear catalog" },
        body: {
          id: "Produk tersusun rapi dengan harga dan ketersediaan yang terlihat langsung, jadi pembeli tidak perlu bertanya.",
          en: "Products laid out with visible pricing and availability, so buyers never have to ask.",
        },
      },
      {
        title: { id: "Pesanan otomatis", en: "Automatic fulfilment" },
        body: {
          id: "Pesanan diproses sistem tanpa campur tangan manual, sehingga pembeli tidak menunggu admin bangun.",
          en: "Orders are processed by the system without manual handling, so no buyer waits for an admin to wake up.",
        },
      },
      {
        title: { id: "Program reseller", en: "A reseller program" },
        body: {
          id: "Orang lain bisa menjual ulang produk NexShop dengan harga dan margin yang sudah diatur.",
          en: "Others can resell NexShop products with pricing and margins already handled.",
        },
      },
      {
        title: { id: "Marketplace", en: "A marketplace" },
        body: {
          id: "Ruang untuk penjual lain menaruh produknya, memperluas pilihan tanpa Xinet harus menambah stok sendiri.",
          en: "Space for other sellers to list their products, widening the catalog without Xinet having to stock everything itself.",
        },
      },
    ],
    gallery: [
      {
        src: "/products/tile-nexshop.webp",
        caption: {
          id: "Beranda toko dengan katalog top up game.",
          en: "The storefront with its game top-up catalog.",
        },
      },
      {
        src: "/products/tile-nexshop-marketplace.webp",
        caption: {
          id: "Marketplace tempat penjual lain menaruh produk.",
          en: "The marketplace where other sellers list products.",
        },
      },
      {
        src: "/products/tile-nexshop-reseller.webp",
        caption: {
          id: "Halaman program reseller.",
          en: "The reseller program page.",
        },
      },
      {
        src: "/products/tile-nexshop-berita.webp",
        caption: {
          id: "Halaman berita dan pengumuman produk.",
          en: "The news and product announcement page.",
        },
      },
    ],
    facts: [
      { label: { id: "Kategori", en: "Category" }, value: { id: "Perdagangan digital", en: "Digital commerce" } },
      { label: { id: "Platform", en: "Platform" }, value: { id: "Web", en: "Web" } },
      { label: { id: "Status", en: "Status" }, value: { id: "Rilis", en: "Shipped" } },
    ],
  },
  {
    id: "saybot",
    tagline: {
      id: "Semua percakapan pelanggan dalam satu ruang kerja.",
      en: "Every customer conversation in one workspace.",
    },
    problem: {
      id: "Bisnis kecil biasanya melayani pelanggan di empat tempat sekaligus: WhatsApp, Telegram, email, dan chat di website. Pesan tersebar, tidak ada yang tahu siapa sudah dijawab, dan pelanggan mengulang cerita yang sama setiap kali pindah kanal.",
      en: "A small business usually serves customers in four places at once: WhatsApp, Telegram, email and website chat. Messages scatter, nobody knows what has been answered, and customers repeat the same story every time they switch channel.",
    },
    vision: {
      id: "SayBot menyatukan semua kanal jadi satu alur kerja, supaya satu orang bisa melayani banyak pelanggan tanpa ada pesan yang hilang. Tujuannya bukan mengganti manusia dengan bot, tapi membuat manusia sanggup menangani lebih banyak tanpa jadi kacau.",
      en: "SayBot merges every channel into one workflow, so one person can serve many customers without a message going missing. The goal is not to replace people with a bot, but to let people handle more without the operation falling apart.",
    },
    status: { id: "Berjalan", en: "Live" },
    features: [
      {
        title: { id: "Empat kanal, satu inbox", en: "Four channels, one inbox" },
        body: {
          id: "WhatsApp, Telegram, Email, dan Chat Website masuk ke tampilan yang sama, dengan konteks kanal tetap terlihat.",
          en: "WhatsApp, Telegram, Email and Website Chat arrive in the same view, with each channel's context still visible.",
        },
      },
      {
        title: { id: "Alur kerja yang bisa diatur", en: "Configurable workflow" },
        body: {
          id: "Aturan dan tahapan disesuaikan dengan cara bisnis bekerja, bukan sebaliknya.",
          en: "Rules and stages adapt to how the business already works, not the other way around.",
        },
      },
      {
        title: { id: "Balasan cepat", en: "Fast replies" },
        body: {
          id: "Template dan jawaban tersimpan mempercepat balasan untuk pertanyaan yang berulang.",
          en: "Saved templates and answers speed up replies to questions that keep coming back.",
        },
      },
      {
        title: { id: "Riwayat per pelanggan", en: "Per-customer history" },
        body: {
          id: "Semua percakapan satu pelanggan terkumpul, jadi tidak ada yang perlu mengulang dari awal.",
          en: "Every conversation with one customer is gathered together, so nobody has to start over.",
        },
      },
    ],
    gallery: [
      {
        src: "/products/tile-saybot.webp",
        caption: { id: "Halaman depan SayBot dan alur kerjanya.", en: "The SayBot landing page and its workflow." },
      },
      {
        src: "/products/tile-saybot-2.webp",
        caption: { id: "Tahapan pengiriman dan kotak masuk gabungan.", en: "Delivery stages and the unified inbox." },
      },
      {
        src: "/products/tile-saybot-3.webp",
        caption: { id: "Paket harga SayBot.", en: "SayBot pricing plans." },
      },
      {
        src: "/products/tile-saybot-4.webp",
        caption: { id: "Halaman masuk ke ruang kerja.", en: "The workspace sign-in page." },
      },
    ],
    facts: [
      { label: { id: "Kategori", en: "Category" }, value: { id: "Komunikasi", en: "Communication" } },
      { label: { id: "Kanal", en: "Channels" }, value: { id: "4 kanal", en: "4 channels" } },
      { label: { id: "Status", en: "Status" }, value: { id: "Rilis", en: "Shipped" } },
    ],
  },
  {
    id: "akuntuntas",
    tagline: {
      id: "Pembukuan yang akhirnya bisa dituntaskan sendiri.",
      en: "Bookkeeping you can actually finish on your own.",
    },
    problem: {
      id: "Pemilik usaha kecil tahu uangnya masuk dan keluar, tapi tidak tahu labanya berapa. Software akuntansi yang ada dirancang untuk akuntan, penuh istilah yang harus dipelajari dulu sebelum bisa dipakai.",
      en: "Small business owners know money comes in and goes out, but not what their profit is. Existing accounting software is built for accountants, full of terms you must learn before you can use it.",
    },
    vision: {
      id: "AkunTuntas dibangun supaya pemilik usaha bisa menutup buku sendiri, tanpa harus paham debit-kredit lebih dulu. Visinya sederhana: laporan keuangan yang bisa dipercaya, dihasilkan oleh orang yang menjalankan bisnisnya sendiri.",
      en: "AkunTuntas exists so owners can close their own books without first understanding debits and credits. The vision is simple: trustworthy financial reports, produced by the people actually running the business.",
    },
    status: { id: "Dipakai internal", en: "In internal use" },
    features: [
      {
        title: { id: "Jurnal yang rapi", en: "Tidy journals" },
        body: {
          id: "Pencatatan transaksi harian yang otomatis tersusun ke laporan, bukan buku besar yang harus dijejali manual.",
          en: "Daily transactions that assemble themselves into reports, rather than a ledger you have to force entries into.",
        },
      },
      {
        title: { id: "Bagan akun yang jelas", en: "A readable chart of accounts" },
        body: {
          id: "Struktur akun yang bisa dipahami orang non-akuntan, dengan nama yang masuk akal.",
          en: "An account structure a non-accountant can follow, with names that make sense.",
        },
      },
      {
        title: { id: "Laporan laba rugi", en: "Income statements" },
        body: {
          id: "Pendapatan, laba, dan margin dalam satu layar, jawaban atas pertanyaan paling sering pemilik usaha.",
          en: "Revenue, profit and margin on one screen: the answer to an owner's most common question.",
        },
      },
      {
        title: { id: "Pemeriksaan kesehatan", en: "Health checks" },
        body: {
          id: "Sistem menandai pembukuan yang perlu perhatian, supaya masalah ketahuan sebelum jadi besar.",
          en: "The system flags bookkeeping that needs attention, so problems surface before they grow.",
        },
      },
    ],
    gallery: [
      {
        src: "/products/tile-akuntuntas.webp",
        caption: { id: "Laporan keuangan AkunTuntas.", en: "An AkunTuntas financial report." },
      },
      {
        src: "/products/tile-akuntuntas-2.webp",
        caption: { id: "Jurnal umum.", en: "The general journal." },
      },
      {
        src: "/products/tile-akuntuntas-3.webp",
        caption: { id: "Bagan akun.", en: "The chart of accounts." },
      },
      {
        src: "/products/tile-akuntuntas-4.webp",
        caption: { id: "Daftar pelanggan dan pemasok.", en: "The customers and suppliers list." },
      },
    ],
    facts: [
      { label: { id: "Kategori", en: "Category" }, value: { id: "Alat bisnis", en: "Business tools" } },
      { label: { id: "Platform", en: "Platform" }, value: { id: "Windows", en: "Windows" } },
      { label: { id: "Status", en: "Status" }, value: { id: "Internal", en: "Internal" } },
    ],
  },
  {
    id: "amara",
    tagline: {
      id: "AI yang punya wajah, bukan cuma kotak teks.",
      en: "An AI with a face, not just a text box.",
    },
    problem: {
      id: "Asisten AI hari ini terasa seperti formulir. Kamu mengetik, membaca, menunggu. Tidak ada kehadiran, tidak ada rasa sedang berbicara dengan sesuatu, padahal yang dibutuhkan banyak orang justru rasa ditemani.",
      en: "Today's AI assistants feel like a form. You type, read, wait. There is no presence, no sense of talking to something, yet what many people actually want is the feeling of company.",
    },
    vision: {
      id: "Amara mengeksplorasi bentuk lain dari AI: sesuatu yang hadir di desktop, punya avatar, dan bisa diajak bicara dengan suara. Ini eksperimen jangka panjang soal bagaimana komputer bisa terasa menemani tanpa berpura-pura jadi manusia.",
      en: "Amara explores a different shape for AI: something that lives on your desktop, has an avatar, and can be spoken to. It is a long-running experiment in how a computer can feel companionable without pretending to be human.",
    },
    status: { id: "Rilis", en: "Shipped" },
    features: [
      {
        title: { id: "Avatar 3D", en: "A 3D avatar" },
        body: {
          id: "Sosok tiga dimensi yang hadir di layar, bukan ikon bulat yang berdenyut.",
          en: "A three-dimensional presence on screen, not a pulsing round icon.",
        },
      },
      {
        title: { id: "Percakapan suara", en: "Voice conversation" },
        body: {
          id: "Bisa diajak bicara langsung, jadi tangan tetap bebas untuk hal lain.",
          en: "You can speak to it directly, leaving your hands free for other things.",
        },
      },
      {
        title: { id: "Aplikasi desktop", en: "A desktop application" },
        body: {
          id: "Berjalan sebagai aplikasi Windows sendiri, bukan tab browser yang harus dicari.",
          en: "Runs as its own Windows application, not a browser tab you have to hunt for.",
        },
      },
    ],
    gallery: [
      {
        src: "/products/tile-amara.webp",
        caption: {
          id: "Amara dengan avatar 3D dan panel percakapan.",
          en: "Amara with its 3D avatar and chat panel.",
        },
      },
    ],
    facts: [
      { label: { id: "Kategori", en: "Category" }, value: { id: "Kecerdasan artifisial", en: "Artificial intelligence" } },
      { label: { id: "Platform", en: "Platform" }, value: { id: "Windows", en: "Windows" } },
      { label: { id: "Status", en: "Status" }, value: { id: "Rilis", en: "Shipped" } },
    ],
  },
  {
    id: "lumawall",
    tagline: {
      id: "Desktop yang bergerak, bukan gambar mati.",
      en: "A desktop that moves, not a still image.",
    },
    problem: {
      id: "Wallpaper hidup yang ada kebanyakan berat, boros baterai, atau hanya jalan di satu monitor. Begitu pakai dua layar, semuanya berantakan.",
      en: "Most live wallpaper tools are heavy, drain battery, or only work on one monitor. The moment you use two screens, everything falls apart.",
    },
    vision: {
      id: "LumaWall dibuat untuk desktop yang benar-benar dipakai kerja: banyak monitor, seharian menyala, dan tidak boleh mengganggu. Visinya wallpaper yang hidup tanpa mengorbankan mesin yang menjalankannya.",
      en: "LumaWall is built for desktops that are actually worked on: many monitors, on all day, and not allowed to get in the way. The vision is a wallpaper that lives without taxing the machine running it.",
    },
    status: { id: "Rilis", en: "Shipped" },
    features: [
      {
        title: { id: "Dukungan multi-monitor", en: "Multi-monitor support" },
        body: {
          id: "Setiap layar bisa punya wallpaper sendiri, dengan pengaturan per monitor.",
          en: "Each screen can carry its own wallpaper, with per-monitor settings.",
        },
      },
      {
        title: { id: "Katalog wallpaper", en: "A wallpaper catalog" },
        body: {
          id: "Galeri bawaan yang bisa ditelusuri, bukan folder yang harus diisi sendiri.",
          en: "A built-in gallery you can browse, not a folder you must fill yourself.",
        },
      },
      {
        title: { id: "Ringan saat dipakai kerja", en: "Light under real work" },
        body: {
          id: "Dirancang supaya tetap jalan saat aplikasi berat sedang terbuka.",
          en: "Designed to keep running while heavy applications are open.",
        },
      },
    ],
    gallery: [
      {
        src: "/products/tile-lumawall.webp",
        caption: {
          id: "Katalog wallpaper LumaWall dengan pemilihan monitor.",
          en: "The LumaWall wallpaper catalog with monitor targeting.",
        },
      },
    ],
    facts: [
      { label: { id: "Kategori", en: "Category" }, value: { id: "Alat desktop", en: "Desktop tools" } },
      { label: { id: "Platform", en: "Platform" }, value: { id: "Windows", en: "Windows" } },
      { label: { id: "Status", en: "Status" }, value: { id: "Rilis", en: "Shipped" } },
    ],
  },
];

/** Look up one project's detail, or undefined when the id is unknown. */
export function getProjectDetail(id: string): ProjectDetail | undefined {
  return PROJECT_DETAILS.find((p) => p.id === id);
}

/** The product row for one id, or undefined. */
export function getProduct(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id);
}

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
    liveSite: { id: "Situs langsung", en: "Live site" },
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
  stats: {
    eyebrow: { id: "Ekosistem Sekilas", en: "Ecosystem at a glance" },
    heading: { id: "Terukur, bukan klaim.", en: "Measured, not claimed." },
    body: {
      id: "Angka di bawah hanya menghitung yang benar-benar sudah berjalan: produk yang dirilis, dan bidang yang kami kerjakan.",
      en: "The numbers below count only what is actually running: products that shipped, and the areas we work in.",
    },
  },
  how: {
    eyebrow: { id: "Cara Kerja", en: "How It Works" },
    heading: { id: "Dari ide ke produk yang berjalan.", en: "From idea to a running product." },
    stepLabel: { id: "Langkah", en: "Step" },
    back: { id: "Kembali", en: "Back" },
    next: { id: "Lanjut", en: "Next" },
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
