"use client";

import { useLang } from "@/components/providers/language-provider";
import { COPY } from "@/lib/content";
import { Reveal } from "@/components/ui/reveal";
import { BuiltByXinet } from "@/components/brand/built-by-xinet";

/**
 * AboutXinet — kept deliberately short. No filler, no invented history,
 * no numbers we cannot stand behind.
 */
export function About() {
  const { t, lang } = useLang();

  return (
    <section id="about" className="shell scroll-mt-24 py-24 md:py-32">
      <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-3">
          <Reveal>
            <p className="eyebrow lg:sticky lg:top-32">{t(COPY.about.eyebrow)}</p>
          </Reveal>
        </div>

        <div className="lg:col-span-9">
          <Reveal>
            <h2 className="text-ink max-w-3xl text-[clamp(1.75rem,3.6vw,3rem)] leading-[1.1] font-semibold tracking-[-0.03em]">
              {t(COPY.about.heading)}
            </h2>
            <p className="text-ink-muted mt-7 max-w-2xl text-[1.0625rem] leading-relaxed">
              {t(COPY.about.body)}
            </p>
          </Reveal>

          <Reveal delay={100} className="mt-12">
            <BuiltByXinet lang={lang} />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
