"use client";

import Image from "next/image";
import { useLang } from "@/components/providers/language-provider";
import { COPY } from "@/lib/content";
import { TileReveal } from "@/components/reactbits/TileReveal";

/**
 * EcosystemReveal — the tile sequence that introduces the ecosystem.
 *
 * Every tile is a real capture of a product Xinet built. Products with more than
 * one surface contribute several captures (NexShop: storefront / marketplace /
 * reseller / news; SayBot: several sections; AkunTuntas: several screens), so the
 * grid is filled with genuine product evidence rather than repeated artwork.
 *
 * Tiles carry no text label: the product names already appear in the featured
 * cards and the logo strip, so repeating them here would be redundant.
 */

/** One capture per entry. Order defines how the grid fills. */
const SHOTS: { src: string; alt: string }[] = [
  { src: "/products/tile-saybot.webp", alt: "SayBot messaging workspace" },
  { src: "/products/tile-nexshop.webp", alt: "NexShop game top-up storefront" },
  { src: "/products/tile-akuntuntas.webp", alt: "AkunTuntas financial report" },
  { src: "/products/tile-nexshop-marketplace.webp", alt: "NexShop marketplace" },
  { src: "/products/tile-amara.webp", alt: "Amara AI Assistant desktop companion" },
  { src: "/products/tile-saybot-2.webp", alt: "SayBot workflow section" },
  { src: "/products/tile-lumawall.webp", alt: "LumaWall wallpaper engine" },
  { src: "/products/tile-nexshop-reseller.webp", alt: "NexShop reseller program" },
  { src: "/products/tile-akuntuntas-2.webp", alt: "AkunTuntas general journal" },
  { src: "/products/tile-saybot-3.webp", alt: "SayBot product features" },
  { src: "/products/tile-nexshop-berita.webp", alt: "NexShop news portal" },
  { src: "/products/tile-akuntuntas-3.webp", alt: "AkunTuntas chart of accounts" },
  { src: "/products/tile-saybot-4.webp", alt: "SayBot workflow and pricing" },
  { src: "/products/tile-akuntuntas-4.webp", alt: "AkunTuntas partner records" },
];

export function EcosystemReveal() {
  const { t } = useLang();

  // 12 tiles at 3 columns on desktop; 8 tiles at 2 columns on mobile so the
  // settled grid fits the viewport height without clipping rows.
  const makeTiles = (count: number) =>
    Array.from({ length: count }, (_, i) => {
      const shot = SHOTS[i % SHOTS.length];
      return <TileShot key={i} src={shot.src} alt={shot.alt} />;
    });

  const tiles = makeTiles(12);
  const mobileTiles = makeTiles(8);

  return (
    <section id="ecosystem" className="relative">
      <TileReveal
        items={tiles}
        mobileItems={mobileTiles}
        columns={3}
        gap={14}
        gridWidth={840}
        tileAspect={1.3}
        tileRadius={12}
        zoom={1.5}
        spread={0.5}
        scrollLength={1.6}
        headline={<span className="text-ink">{t(COPY.ecosystem.heading)}</span>}
      >
        <div className="text-center">
          <p className="eyebrow mb-6">{t(COPY.ecosystem.eyebrow)}</p>
          <p className="text-ink mx-auto max-w-2xl text-[clamp(1.125rem,2.1vw,1.5rem)] leading-[1.45] font-medium tracking-[-0.02em]">
            {t(COPY.ecosystem.body)}
          </p>
          <p className="text-ink-subtle mt-8 text-sm">{t(COPY.hero.micro)}</p>
        </div>
      </TileReveal>
    </section>
  );
}

/** A single tile: a real product capture, filling the whole tile. */
function TileShot({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="border-line relative h-full w-full overflow-hidden rounded-[inherit] border bg-[#0B0E11]">
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 768px) 45vw, 270px"
        className="object-cover object-top"
      />
    </div>
  );
}
