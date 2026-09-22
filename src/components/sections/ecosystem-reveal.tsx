"use client";

import { useLang } from "@/components/providers/language-provider";
import { COPY, PRODUCTS } from "@/lib/content";
import { TileReveal } from "@/components/reactbits/TileReveal";
import { cn } from "@/lib/utils";

/**
 * EcosystemReveal — the tile sequence that introduces the ecosystem.
 *
 * Tiles carry a restrained typographic treatment of each product rather than
 * photography, so the section stays on-brand, ships zero image bytes, and reads
 * as one company rather than a stock gallery. The revealed content restates the
 * ecosystem statement and hands off to the product grid below.
 */
export function EcosystemReveal() {
  const { t } = useLang();

  // 12 tiles at 3 columns on desktop; 8 tiles at 2 columns on mobile so the
  // settled grid fits the viewport height without clipping rows.
  const names = ["NexShop", "SayBot", "AkunTuntas", "Xinet Labs", "Xinet"];
  const makeTiles = (count: number) =>
    Array.from({ length: count }, (_, i) => {
      const name = names[i % names.length];
      const product = PRODUCTS.find((p) => p.name === name);
      const hue = product?.hue ?? "122 131 140";
      return <TileSurface key={i} label={name} hue={hue} />;
    });

  const tiles = makeTiles(12);
  const mobileTiles = makeTiles(8);

  return (
    <section id="ecosystem" className="relative">
      <TileReveal
        items={tiles}
        mobileItems={mobileTiles}
        columns={3}
        gap={16}
        gridWidth={820}
        tileAspect={1.35}
        tileRadius={14}
        zoom={1.5}
        spread={0.5}
        scrollLength={1.6}
        headline={
          <span className="text-ink">
            {t(COPY.ecosystem.heading)}
          </span>
        }
      >
        <div className="text-center">
          <p className="eyebrow mb-6">{t(COPY.ecosystem.eyebrow)}</p>
          <p className="text-ink mx-auto max-w-2xl text-[clamp(1.125rem,2.1vw,1.5rem)] leading-[1.45] font-medium tracking-[-0.02em]">
            {t(COPY.ecosystem.body)}
          </p>
          <p className="text-ink-subtle mt-8 text-sm">
            {t(COPY.hero.micro)}
          </p>
        </div>
      </TileReveal>
    </section>
  );
}

/** A single tile surface: product name on a dark plate with its own accent. */
function TileSurface({ label, hue }: { label: string; hue: string }) {
  return (
    <div
      className={cn(
        "border-line relative flex h-full w-full items-end overflow-hidden rounded-[inherit] border bg-[#0B0E11] p-4"
      )}
    >
      <div className="grid-bg absolute inset-0 opacity-40" />
      <div
        className="absolute -top-10 -right-8 h-32 w-32 rounded-full opacity-25 blur-[40px]"
        style={{ background: `radial-gradient(circle, rgb(${hue}) 0%, transparent 70%)` }}
      />
      <span className="text-ink-muted relative text-[0.8125rem] font-medium tracking-[-0.01em]">
        {label}
      </span>
    </div>
  );
}
