"use client";

import { useLang } from "@/components/providers/language-provider";
import { CAPABILITIES, COPY } from "@/lib/content";
import { Reveal } from "@/components/ui/reveal";
import BorderGlow from "@/components/reactbits/BorderGlow";
import Magnet from "@/components/reactbits/Magnet";

/**
 * WhatWeBuild — capabilities expressed through numbering and typography rather
 * than icons.
 *
 * WHY BorderGlow AND NOT PixelCard
 *
 * This grid used to use PixelCard, whose hover state fills the card with a
 * canvas of pixels. Inside a card that also carries text that is the wrong
 * effect: the pixels are painted over the copy, so hovering made the text
 * harder to read at exactly the moment the reader is looking at it.
 *
 * BorderGlow puts the motion on the *border* — a light that follows the pointer
 * around the edge — so the animation never overlaps the type. The interior stays
 * a flat, readable surface at all times.
 *
 * Magnet is kept but is deliberately gentle: the whole cell drifts a few pixels
 * toward the pointer so the grid feels physical rather than six flat rectangles.
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
          <Reveal key={cap.n} delay={i * 50} className="h-full">
            <Magnet
              padding={60}
              magnetStrength={18}
              wrapperClassName="block h-full"
              innerClassName="h-full"
            >
              <BorderGlow
                // Brand cyan family only. The component's stock palette is
                // purple/pink/blue, which the brand rules out.
                colors={["#22c7e8", "#7dd3fc", "#a5f3fc"]}
                backgroundColor="#0B0E11"
                borderRadius={12}
                glowRadius={34}
                glowIntensity={1.15}
                coneSpread={28}
                edgeSensitivity={34}
                fillOpacity={0.42}
                animated={false}
                className="!h-full !min-h-[13.5rem] !border !border-[var(--x-line)] !p-7"
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
              </BorderGlow>
            </Magnet>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
