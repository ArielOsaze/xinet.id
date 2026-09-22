"use client";

import Image from "next/image";
import { useLang } from "@/components/providers/language-provider";
import { COPY } from "@/lib/content";
import { TileReveal } from "@/components/reactbits/TileReveal";

/**
 * EcosystemReveal — the tile sequence that introduces the ecosystem.
 *
 * Two things are deliberate here:
 *
 * 1. Aspect ratio. Every capture is 16:10 and `tileAspect` is 1.6 — the same
 *    ratio — so no screenshot is cropped. Cropping a product shot cuts off the
 *    very parts that show what the product does.
 *
 * 2. Tone order. Captures alternate dark and light in a checkerboard, so the
 *    grid reads as one composed surface instead of a random mix. The order below
 *    follows each capture's measured brightness (dark ≈ 10–30, light ≈ 180–250).
 *
 * Tiles carry no text label: product names already appear in the featured cards
 * and the logo strip, so repeating them here would be redundant.
 */

/**
 * One capture per entry, ordered for the checkerboard (D/L) pattern:
 *   D L D
 *   L D L
 *   D L D
 *   L D L
 */
const SHOTS: { src: string; alt: string }[] = [
  // Row 1
  { src: "/products/tile-saybot.webp", alt: "SayBot messaging workspace" },
  { src: "/products/tile-akuntuntas.webp", alt: "AkunTuntas financial report" },
  { src: "/products/tile-nexshop.webp", alt: "NexShop game top-up storefront" },
  // Row 2
  { src: "/products/tile-akuntuntas-2.webp", alt: "AkunTuntas general journal" },
  { src: "/products/tile-saybot-2.webp", alt: "SayBot workflow section" },
  { src: "/products/tile-nexshop-marketplace.webp", alt: "NexShop marketplace" },
  // Row 3
  { src: "/products/tile-lumawall.webp", alt: "LumaWall wallpaper engine" },
  { src: "/products/tile-akuntuntas-3.webp", alt: "AkunTuntas chart of accounts" },
  { src: "/products/tile-saybot-3.webp", alt: "SayBot product features" },
  // Row 4
  { src: "/products/tile-amara.webp", alt: "Amara AI Assistant desktop companion" },
  { src: "/products/tile-saybot-4.webp", alt: "SayBot workflow and pricing" },
  { src: "/products/tile-nexshop-reseller.webp", alt: "NexShop reseller program" },
];

export function EcosystemReveal() {
  const { t } = useLang();

  // Same set at every breakpoint: the ratio match means each tile shows its
  // whole capture, and the grid sizing keeps all 12 inside the viewport.
  const tiles = SHOTS.map((shot, i) => (
    <TileShot key={i} src={shot.src} alt={shot.alt} />
  ));

  return (
    <section id="ecosystem" className="relative">
      <TileReveal
        items={tiles}
        columns={3}
        gap={14}
        gridWidth={860}
        // Exactly 16:10 — the ratio of every capture, so nothing is cropped.
        tileAspect={1.6}
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

/**
 * A single tile: a real product capture.
 * `object-cover` is safe here because the tile ratio matches the image ratio, so
 * cover and contain give the same result — cover just avoids a sub-pixel gap.
 */
function TileShot({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="border-line relative h-full w-full overflow-hidden rounded-[inherit] border bg-[#0B0E11]">
      <Image src={src} alt={alt} fill sizes="(max-width: 768px) 45vw, 280px" className="object-cover" />
    </div>
  );
}
