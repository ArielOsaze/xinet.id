"use client";

import { useLang } from "@/components/providers/language-provider";
import { COPY, LAB_CATEGORIES, LAB_ITEMS } from "@/lib/content";
import { Reveal } from "@/components/ui/reveal";
import PixelTransition from "@/components/reactbits/PixelTransition";
import SpotlightCard from "@/components/reactbits/SpotlightCard";
import { ScrollLink } from "@/components/ui/scroll-link";
import { cn } from "@/lib/utils";

/**
 * XinetLabs — the one place allowed slightly more experimental motion.
 *
 * PixelTransition is used on a single element (the section's index tile) and
 * nowhere else, so the section feels alive without turning into a showcase.
 */
export function Labs() {
  const { t, lang } = useLang();

  return (
    <section id="labs" className="border-line scroll-mt-24 border-t py-24 md:py-32">
      <div className="shell">
        <div className="grid gap-14 lg:grid-cols-12 lg:gap-16">
          {/* Left: statement + categories */}
          <div className="lg:col-span-7">
            <Reveal>
              <p className="eyebrow mb-5">{t(COPY.labs.eyebrow)}</p>
              <h2 className="text-ink text-[clamp(1.75rem,3.6vw,3rem)] leading-[1.08] font-semibold tracking-[-0.03em]">
                {t(COPY.labs.heading)}
              </h2>
              <p className="text-ink-muted mt-6 max-w-lg text-[1.0625rem] leading-relaxed">
                {t(COPY.labs.body)}
              </p>
            </Reveal>

            <Reveal delay={80} className="mt-11">
              <p className="eyebrow mb-5">{t(COPY.labs.categoriesLabel)}</p>
              <ul className="flex flex-wrap gap-2">
                {LAB_CATEGORIES.map((cat) => (
                  <li
                    key={cat.en}
                    className="border-line text-ink-muted hover:border-line-strong hover:text-ink rounded-full border px-3.5 py-1.5 text-[0.8125rem] transition-colors duration-300 motion-reduce:transition-none"
                  >
                    {t(cat)}
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal delay={140} className="mt-10">
              <ScrollLink
                href="#labs-work"
                className="group/cta text-ink inline-flex items-center gap-2 text-sm font-medium underline decoration-transparent underline-offset-4 transition-colors duration-300 hover:underline motion-reduce:transition-none"
              >
                {t(COPY.labs.cta)}
                <span
                  aria-hidden="true"
                  className="inline-block transition-transform duration-300 ease-out group-hover/cta:translate-x-0.5 motion-reduce:transition-none motion-reduce:group-hover/cta:translate-x-0"
                >
                  →
                </span>
              </ScrollLink>
            </Reveal>
          </div>

          {/* Right: the experimental tile — the only pixel-transition surface */}
          <Reveal delay={60} className="lg:col-span-5">
            <div className="border-line bg-surface relative overflow-hidden rounded-2xl border">
              <PixelTransition
                gridSize={9}
                pixelColor="#101316"
                animationStepDuration={0.34}
                aspectRatio="118%"
                once={false}
                className="!h-auto !w-full"
                style={{ background: "transparent" }}
                firstContent={
                  <LabTileContent
                    label={lang === "id" ? "Xinet Labs" : "Xinet Labs"}
                    hint={lang === "id" ? "Arahkan kursor" : "Hover to reveal"}
                    tone="idle"
                  />
                }
                secondContent={
                  <LabTileContent
                    label={lang === "id" ? "Dalam eksperimen" : "In experiment"}
                    hint={lang === "id" ? "Fokus: purwarupa" : "Focus: prototypes"}
                    tone="active"
                  />
                }
              />
            </div>
          </Reveal>
        </div>

        {/* Lab projects — real, honestly labelled by stage */}
        <div id="labs-work" className="mt-20 scroll-mt-24">
          <p className="eyebrow mb-8">{t(COPY.labs.currentLabel)}</p>

          <ul className="border-line grid grid-cols-1 border-t border-l md:grid-cols-3">
            {LAB_ITEMS.map((item, i) => (
              <Reveal
                key={item.name}
                as="li"
                delay={i * 60}
                className="border-line group border-r border-b transition-colors duration-500 motion-reduce:transition-none"
              >
                {/* SpotlightCard: a soft light that tracks the pointer. It is the
                    quiet counterpart to the pixel tile above — same family of
                    motion, far lower amplitude, so the grid stays legible. */}
                <SpotlightCard
                  spotlightColor="rgba(34, 199, 232, 0.10)"
                  className="!h-full !rounded-none !border-0 !bg-transparent !p-7"
                >
                  <div className="mb-4 flex items-center gap-2.5">
                    <span className="border-line-strong text-ink-subtle rounded-full border px-2.5 py-0.5 text-[0.625rem] font-medium tracking-[0.1em] uppercase">
                      {t(item.status)}
                    </span>
                  </div>
                  <h3 className="text-ink font-mono text-[1rem] font-medium tracking-[-0.01em]">
                    {item.name}
                  </h3>
                  <p className="text-ink-muted mt-2.5 text-sm leading-relaxed">
                    {t(item.description)}
                  </p>
                </SpotlightCard>
              </Reveal>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function LabTileContent({
  label,
  hint,
  tone,
}: {
  label: string;
  hint: string;
  tone: "idle" | "active";
}) {
  return (
    <div
      className={cn(
        "relative flex h-full w-full flex-col justify-between p-8",
        tone === "active" ? "bg-elevated" : "bg-surface"
      )}
    >
      <div className="grid-bg absolute inset-0 opacity-60" aria-hidden="true" />
      <div
        className="absolute -top-20 -left-10 h-56 w-56 rounded-full opacity-25 blur-[60px]"
        style={{
          background:
            tone === "active"
              ? "radial-gradient(circle, rgba(34,199,232,0.8) 0%, transparent 70%)"
              : "radial-gradient(circle, rgba(255,255,255,0.28) 0%, transparent 70%)",
        }}
        aria-hidden="true"
      />

      <div className="relative flex items-center justify-between">
        <span className="eyebrow">{label}</span>
        <span
          className={cn(
            "block size-2 rounded-full",
            tone === "active" ? "bg-accent" : "bg-white/30"
          )}
          aria-hidden="true"
        />
      </div>

      <div className="relative">
        <p className="text-ink-subtle font-mono text-[0.6875rem] tracking-[0.08em] uppercase">
          {hint}
        </p>
      </div>
    </div>
  );
}
