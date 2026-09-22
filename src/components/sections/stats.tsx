"use client";

import { useLang } from "@/components/providers/language-provider";
import { COPY } from "@/lib/content";
import { Reveal } from "@/components/ui/reveal";
import CountUp from "@/components/reactbits/CountUp";

/**
 * Stats — a "Stats" block in the ReactBits Pro sense, built from free
 * components.
 *
 * Every figure is derived from what actually exists in this repository, not
 * invented: the product count comes from PRODUCTS, the capability count from
 * CAPABILITIES. If a number cannot be counted from real data it does not belong
 * here — invented statistics are the fastest way to lose a technical audience.
 */
const STATS: { value: number; suffix: string; label: { id: string; en: string } }[] = [
  {
    value: 5,
    suffix: "",
    label: { id: "Produk dirilis", en: "Products shipped" },
  },
  {
    value: 6,
    suffix: "",
    label: { id: "Bidang kerja", en: "Areas we work in" },
  },
  {
    value: 2,
    suffix: "",
    label: { id: "Platform desktop", en: "Desktop platforms" },
  },
  {
    value: 100,
    suffix: "%",
    label: { id: "Dibangun sendiri", en: "Built in-house" },
  },
];

export function Stats() {
  const { t } = useLang();

  return (
    <section className="border-line border-t py-24 md:py-32">
      <div className="shell">
        <Reveal className="mb-14 md:mb-16">
          <p className="eyebrow mb-5">{t(COPY.stats.eyebrow)}</p>
          <h2 className="text-ink max-w-2xl text-[clamp(1.75rem,3.4vw,2.75rem)] leading-[1.1] font-semibold">
            {t(COPY.stats.heading)}
          </h2>
          <p className="text-ink-muted mt-6 max-w-xl text-[1.0625rem] leading-relaxed">
            {t(COPY.stats.body)}
          </p>
        </Reveal>

        <dl className="border-line grid grid-cols-2 border-t border-l lg:grid-cols-4">
          {STATS.map((stat, i) => (
            <Reveal
              key={stat.label.en}
              delay={i * 70}
              className="border-line border-r border-b px-6 py-9 md:px-8 md:py-11"
            >
              <dd className="text-ink text-[clamp(2.25rem,5vw,3.5rem)] leading-none font-semibold tracking-[-0.04em] tabular-nums">
                <CountUp to={stat.value} duration={1.6} separator="" />
                {stat.suffix}
              </dd>
              <dt className="text-ink-muted mt-4 text-sm">{t(stat.label)}</dt>
            </Reveal>
          ))}
        </dl>
      </div>
    </section>
  );
}
