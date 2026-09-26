"use client";

import Image from "next/image";
import { useLang } from "@/components/providers/language-provider";
import { COPY } from "@/lib/content";
import { TileReveal } from "@/components/reactbits/TileReveal";

/**
 * EcosystemReveal — the tile sequence that introduces the ecosystem.
 *
 * Three things are deliberate here:
 *
 * 1. Every tile is a real FEATURE screen. The previous set had four marketing
 *    pages (a pricing table, a closing CTA, a blog list, a reseller promo) in a
 *    section whose whole job is to show what the products do.
 *
 * 2. All five products appear. The previous set covered only three, so LumaWall
 *    and Amara were missing from the ecosystem entirely.
 *
 * 3. Tone order. Captures alternate dark and light in a checkerboard, so the
 *    grid reads as one composed surface instead of a random mix. The order below
 *    follows each capture's measured brightness (dark ≈ 10–60, light ≈ 180–250).
 *
 * Tiles carry no text label: product names already appear in the featured cards
 * and the logo strip, so repeating them here would be redundant.
 */

/**
 * Nine captures, ordered for the checkerboard:
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
 * Files are named mosaic-* and are built by scripts/build-mosaic-tiles.py, which
 * also records what each screen shows. They are separate from the tile-* files
 * used by the product pages: those stay at their own ratios so the gallery cards
 * there keep a uniform height.
 */
const SHOTS: { src: string; alt: string }[] = [
  // Row 1
  { src: "/products/mosaic-nexshop-marketplace.webp", alt: "NexShop marketplace: search, categories and the provider list" }, // 247 light
  { src: "/products/mosaic-saybot-inbox.webp", alt: "SayBot unified inbox: every channel and contact in one workspace" }, // 13 dark
  { src: "/products/mosaic-akun-ledger.webp", alt: "AkunTuntas general ledger with posted transactions" }, // 206 light
  // Row 2
  { src: "/products/mosaic-lumawall-catalog.webp", alt: "LumaWall catalog: category filters and the wallpaper detail panel" }, // 55 dark
  { src: "/products/mosaic-amara-chat.webp", alt: "Amara: the character stage beside the conversation" }, // 180 light
  { src: "/products/mosaic-lumawall-library.webp", alt: "LumaWall library: downloaded wallpapers ready to apply" }, // 57 dark
  // Row 3
  { src: "/products/mosaic-akun-coa.webp", alt: "AkunTuntas chart of accounts with the full account tree" }, // 205 light
  { src: "/products/mosaic-lumawall-performance.webp", alt: "LumaWall performance: frame-rate limit and live GPU telemetry" }, // 19 dark
  { src: "/products/mosaic-akun-partners.webp", alt: "AkunTuntas business partners with contact records" }, // 207 light
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
        // 1.75, not 16:10. TileReveal draws tiles with `object-cover`, so a
        // capture at a different ratio is cropped by the browser. Most captures
        // are 1.60 and the new LumaWall ones are 1.89-1.98, so a 16:10 tile
        // costs LumaWall 15-30% of its width while 1.75 costs every capture only
        // 7-12%. At 1.75 the crops leave each screen's sidebar, title bar and
        // content grid intact; at 1.60 they cut through floating buttons and the
        // telemetry chart, so those two screens read as broken.
        tileAspect={1.75}
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
 *
 * `object-cover` is intentional: the tiles are built at the tile ratio by
 * scripts/build-mosaic-tiles.py, so the crop is already baked in and this only
 * matters for the brief moment before the image loads.
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
