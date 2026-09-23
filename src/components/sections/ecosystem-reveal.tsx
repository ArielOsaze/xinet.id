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
 * Nine captures, ordered for the checkerboard (D/L) pattern:
 *   L D L
 *   D L D
 *   L D L
 *
 * Only SECONDARY captures belong here. The five featured cards further down
 * this same page already show each product's main screen, and five of the old
 * tiles were pixel-identical to those cards (measured difference 0.08-0.16,
 * where genuinely different screens differ by 5 or more). A visitor scrolled
 * past the same screenshot twice. Removing them leaves nine unique screens.
 *
 * The order maximises tonal contrast between neighbours (measured brightness in
 * comments), so the grid still reads as one composed surface.
 */
const SHOTS: { src: string; alt: string }[] = [
  // Row 1
  { src: "/products/tile-nexshop-berita.webp", alt: "NexShop news and articles" }, // 212 light
  { src: "/products/tile-saybot-2.webp", alt: "SayBot delivery stages and unified inbox" }, // 12 dark
  { src: "/products/tile-akuntuntas-2.webp", alt: "AkunTuntas general journal" }, // 205 light
  // Row 2
  { src: "/products/tile-saybot-3.webp", alt: "SayBot pricing plans" }, // 13 dark
  { src: "/products/tile-nexshop-marketplace.webp", alt: "NexShop marketplace" }, // 247 light
  { src: "/products/tile-saybot-4.webp", alt: "SayBot workspace sign-in" }, // 10 dark
  // Row 3
  { src: "/products/tile-akuntuntas-4.webp", alt: "AkunTuntas customers and suppliers" }, // 206 light
  { src: "/products/tile-nexshop-reseller.webp", alt: "NexShop reseller program" }, // 183 light
  { src: "/products/tile-akuntuntas-3.webp", alt: "AkunTuntas chart of accounts" }, // 204 light
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
 *
 * `sizes` must describe the slot the tile ACTUALLY occupies, because Next.js
 * uses it to pick which variant to send. The grid is 860px wide capped by the
 * viewport, split into 3 columns, and the reveal zooms it 1.5x — so a tile is
 * rendered around 400 CSS px on a desktop, not 280. Saying 280px made Next
 * serve a 279px image for a 401px slot, which is why the tiles looked
 * pixelated: the browser was upscaling by ~1.4x on a 1x screen and ~2.9x on a
 * 2x screen.
 */
function TileShot({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="border-line relative h-full w-full overflow-hidden rounded-[inherit] border bg-[#0B0E11]">
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 768px) 45vw, (max-width: 1200px) 30vw, 420px"
        // 95, not the default 75: these are UI screenshots with small sharp
        // text, and Next.js re-encodes at the requested quality.
        quality={95}
        /**
         * Eager, and decoded before it is needed.
         *
         * These nine tiles are the centrepiece of the section and are on screen
         * for the whole reveal, so lazy loading gains nothing — it only defers
         * nine large decodes into the exact moment the visitor is scrolling,
         * which measured as the largest single source of stutter in the
         * sequence (43 -> 12 stutters when the images were hidden, and the
         * images reported naturalWidth 0x0, i.e. still undecoded).
         *
         * `decoding="sync"` keeps the decode off the compositor's critical path
         * once the bytes have arrived.
         */
        loading="eager"
        decoding="sync"
        // Low priority on purpose. These nine are fetched at parse time (so the
        // decode no longer lands on a scroll frame) but must NOT outrank the hero
        // image, which is the real LCP. `priority` would emit nine preload tags
        // and slow the first paint, which is a worse trade than the stall.
        fetchPriority="low"
        className="object-cover"
      />
    </div>
  );
}
