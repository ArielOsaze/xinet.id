import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/components/providers/language-provider";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const SITE_URL = "https://xinet.id";
const TITLE = "Xinet — Build What's Next";
const DESCRIPTION =
  "Xinet is a digital product company building products across commerce, communication, business tools, automation and emerging technology.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: "%s — Xinet",
  },
  description: DESCRIPTION,
  applicationName: "Xinet",
  keywords: [
    "Xinet",
    "digital product company",
    "venture studio",
    "NexShop",
    "SayBot",
    "AkunTuntas",
    "Indonesia",
  ],
  authors: [{ name: "Xinet", url: SITE_URL }],
  creator: "Xinet",
  publisher: "Xinet",
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "Xinet",
    title: TITLE,
    description: DESCRIPTION,
    locale: "id_ID",
    alternateLocale: ["en_US"],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  category: "technology",
  formatDetection: { telephone: false, address: false, email: false },
};

/**
 * Structured data. Describes the company and lists the products as an
 * ItemList so search engines can associate each product name with Xinet as the
 * publisher — that association is what makes "Xinet NexShop" resolvable.
 */
const STRUCTURED_DATA = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "Xinet",
      url: SITE_URL,
      description: DESCRIPTION,
      slogan: "Build what's next.",
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/brand/xinet-wordmark.png`,
      },
      knowsAbout: [
        "digital products",
        "commerce platforms",
        "business software",
        "automation",
        "desktop applications",
      ],
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "Xinet",
      description: DESCRIPTION,
      publisher: { "@id": `${SITE_URL}/#organization` },
      inLanguage: ["id-ID", "en-US"],
    },
    {
      "@type": "ItemList",
      name: "Products by Xinet",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "NexShop" },
        { "@type": "ListItem", position: 2, name: "SayBot" },
        { "@type": "ListItem", position: 3, name: "AkunTuntas" },
        { "@type": "ListItem", position: 4, name: "Amara AI Assistant" },
        { "@type": "ListItem", position: 5, name: "LumaWall" },
      ],
    },
  ],
};

export const viewport: Viewport = {
  themeColor: "#080A0C",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="id"
      className={`${jakarta.variable} dark h-full`}
      suppressHydrationWarning
    >
      <body className="bg-base text-ink min-h-full font-sans antialiased">
        {/* Keyboard users can jump straight to the content */}
        <a
          href="#main"
          className="bg-elevated text-ink border-line focus:ring-accent sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-100 focus:rounded-lg focus:border focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:ring-2 focus:outline-none"
        >
          Lewati ke konten
        </a>
        <LanguageProvider>{children}</LanguageProvider>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(STRUCTURED_DATA) }}
        />
      </body>
    </html>
  );
}
