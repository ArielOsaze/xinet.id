"use client";

import { useLang } from "@/components/providers/language-provider";
import { CAPABILITIES, COPY } from "@/lib/content";
import { Reveal } from "@/components/ui/reveal";
import PixelCard from "@/components/reactbits/PixelCard";
import Magnet from "@/components/reactbits/Magnet";

/**
 * WhatWeBuild — capabilities expressed through numbering and typography rather
 * than icons.
 *
 * Two ReactBits effects, each doing a different job:
 *  - PixelCard: the pixel field expands on hover, the section's signature.
 *  - Magnet: the whole cell drifts a few pixels toward the pointer, so the grid
 *    feels physical rather than six flat rectangles.
 *
 * Magnet is deliberately gentle (strength 14, not the default 2) and is skipped
 * entirely under `prefers-reduced-motion`.
 */
export function WhatWeBuild() {
  const { t } = useLang();

  return (
    <section className="shell py-24 md:py-32">
      <Reveal className="mb-14 md:mb-16">
        <p className="eyebrow mb-5">{t(COPY.build.eyebrow)}</p>
        <h2 className="text-ink max-w-2xl text-[clamp(1.75rem,3.4vw,2.75rem)] leading-[1.1] font-semibold">
          {t(COPY.build.heading)}
        </h2>
      </Reveal>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CAPABILITIES.map((cap, i) => (
          <Reveal key={cap.n} delay={i * 50}>
            <Magnet
              padding={70}
              magnetStrength={14}
              wrapperClassName="block h-full"
              innerClassName="h-full"
            >
              <PixelCard
                // Restrained palette: cyan accent for the first three, neutral
                // for the rest, so the grid does not turn into a colour wheel.
                variant={i < 3 ? "blue" : "default"}
                gap={7}
                speed={38}
                className="!aspect-auto !h-full !w-full !min-h-[13.5rem] !place-items-stretch !rounded-xl !border-[var(--x-line)] !bg-[#0B0E11] !p-7"
              >
                <div className="relative z-[1] flex h-full flex-col">
                  <span className="text-ink-subtle font-mono text-[0.6875rem] tracking-[0.1em]">
                    {cap.n}
                  </span>

                  <h3 className="text-ink mt-5 text-[1.0625rem] font-medium tracking-[-0.015em]">
                    {t(cap.title)}
                  </h3>

                  <p className="text-ink-muted mt-2.5 max-w-xs text-sm leading-relaxed">
                    {t(cap.description)}
                  </p>
                </div>
              </PixelCard>
            </Magnet>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
