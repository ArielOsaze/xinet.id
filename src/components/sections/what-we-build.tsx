"use client";

import { useLang } from "@/components/providers/language-provider";
import { CAPABILITIES, COPY } from "@/lib/content";
import { Reveal } from "@/components/ui/reveal";

/**
 * WhatWeBuild — capabilities expressed through numbering and typography rather
 * than icons. Hover only shifts colour and a hairline rule; nothing moves.
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

      {/* Container owns top/left rules; each cell owns bottom/right. This stays
          correct at every column count without nth-child gymnastics. */}
      <div className="border-line grid grid-cols-1 border-t border-l sm:grid-cols-2 lg:grid-cols-3">
        {CAPABILITIES.map((cap, i) => (
          <Reveal
            key={cap.n}
            delay={i * 50}
            className="border-line group hover:bg-white/[0.02] relative border-r border-b p-7 transition-colors duration-500 motion-reduce:transition-none"
          >
            <span className="text-ink-subtle group-hover:text-accent font-mono text-[0.6875rem] tracking-[0.1em] transition-colors duration-500 motion-reduce:transition-none">
              {cap.n}
            </span>

            <h3 className="text-ink mt-5 text-[1.0625rem] font-medium tracking-[-0.015em]">
              {t(cap.title)}
            </h3>

            <p className="text-ink-muted mt-2.5 max-w-xs text-sm leading-relaxed">
              {t(cap.description)}
            </p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
