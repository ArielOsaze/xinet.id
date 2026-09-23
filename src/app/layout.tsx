import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/components/providers/language-provider";
import { ScrollLink } from "@/components/ui/scroll-link";
import { PendingScroll } from "@/components/ui/pending-scroll";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const SITE_URL = "https://xinet.id";
const TITLE = "Xinet · Build What's Next";
const DESCRIPTION =
  "Xinet is a digital product company building products across commerce, communication, business tools, automation and emerging technology.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: "%s · Xinet",
  },
  description: DESCRIPTION,
  applicationName: "Xinet",
  keywords: [
    "Xinet",
    "xinet.id",
    "Xinet Indonesia",
    "digital product company",
    "venture studio",
    "product studio Indonesia",
    "NexShop",
    "NexShop Cloud",
    "SayBot",
    "AkunTuntas",
    "Amara AI Assistant",
    "LumaWall",
    "top up game",
    "WhatsApp automation",
    "software akuntansi",
    "AI assistant Indonesia",
    "live wallpaper Windows",
    "digital products",
    "business software",
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
        {
          "@type": "ListItem",
          position: 1,
          item: {
            "@type": "SoftwareApplication",
            name: "NexShop",
            applicationCategory: "BusinessApplication",
            description:
              "A digital commerce platform for game top-ups, digital products and reseller services.",
            url: "https://nexshop.cloud",
            operatingSystem: "Web",
            publisher: { "@id": `${SITE_URL}/#organization` },
          },
        },
        {
          "@type": "ListItem",
          position: 2,
          item: {
            "@type": "SoftwareApplication",
            name: "SayBot",
            applicationCategory: "BusinessApplication",
            description:
              "A multi-channel messaging workspace for WhatsApp, Telegram, Email and Website.",
            url: "https://saybot.nexshop.cloud",
            operatingSystem: "Web",
            publisher: { "@id": `${SITE_URL}/#organization` },
          },
        },
        {
          "@type": "ListItem",
          position: 3,
          item: {
            "@type": "SoftwareApplication",
            name: "AkunTuntas",
            "applicationCategory": "FinanceApplication",
            description:
              "Bookkeeping and tax software for Indonesian small businesses, computing PPh 21, corporate income tax and VAT offline.",
            url: "https://akuntuntas.xinet.id",
            operatingSystem: "Windows",
            publisher: { "@id": `${SITE_URL}/#organization` },
          },
        },
        {
          "@type": "ListItem",
          position: 4,
          item: {
            "@type": "SoftwareApplication",
            name: "Amara AI Assistant",
            applicationCategory: "UtilitiesApplication",
            description:
              "An AI desktop companion with a 3D avatar and voice conversation.",
            operatingSystem: "Windows",
            publisher: { "@id": `${SITE_URL}/#organization` },
          },
        },
        {
          "@type": "ListItem",
          position: 5,
          item: {
            "@type": "SoftwareApplication",
            name: "LumaWall",
            applicationCategory: "UtilitiesApplication",
            description:
              "A Windows live wallpaper application with a multi-monitor catalog.",
            operatingSystem: "Windows",
            publisher: { "@id": `${SITE_URL}/#organization` },
          },
        },
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
        {/* Keyboard users can jump straight to the content. ScrollLink keeps the
            `#` out of the address bar here too. */}
        <ScrollLink
          href="#main"
          className="bg-elevated text-ink border-line focus:ring-accent sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-100 focus:rounded-lg focus:border focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:ring-2 focus:outline-none"
        >
          Lewati ke konten
        </ScrollLink>
        <LanguageProvider>{children}</LanguageProvider>
        {/* Completes a cross-page section jump (e.g. "Products" clicked from a
            project page) without writing a `#` into the URL. */}
        <PendingScroll />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(STRUCTURED_DATA) }}
        />
      </body>
    </html>
  );
}
