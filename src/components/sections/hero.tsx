"use client";

import { useLang } from "@/components/providers/language-provider";
import { COPY } from "@/lib/content";
import { Cta, CtaArrow } from "@/components/ui/cta";
import { XinetLogo } from "@/components/brand/xinet-logo";
import { HeroBackground } from "@/components/sections/hero-background";

/**
 * Hero — Xinet first, products later.
 *
 * Motion: one presentation-only logo entrance (mask reveal + blur-to-sharp,
 * ~1.8s) that settles into a completely stable mark. Implemented as a pure CSS
 * keyframe animation rather than a JS/ScrollTrigger timeline, because a JS
 * timeline that fails to fire leaves the logo invisible — the CSS version always
 * completes, and `prefers-reduced-motion` skips straight to the final frame.
 */
export function Hero() {
  const { t } = useLang();

  return (
    <section
      id="top"
      className="relative isolate flex min-h-[88svh] flex-col justify-center overflow-hidden pt-[var(--x-nav-h)]"
    >
      <HeroBackground />

      <div className="shell relative w-full py-20 md:py-28">
        <div className="max-w-4xl">
          <p className="eyebrow mb-7">{t(COPY.hero.eyebrow)}</p>

          {/* Logo entrance: the strongest animation on the page.
              Uses the wordmark (no tagline) — the H1 below already carries
              "Build what's next.", so the full lockup would duplicate it. */}
          <div className="mb-9">
            <div className="xinet-logo-in inline-block">
              <XinetLogo
                variant="wordmark"
                height={72}
                priority
                alt={t(COPY.hero.logoAlt)}
                className="max-w-full"
              />
            </div>
          </div>

          <h1 className="text-ink max-w-3xl text-[clamp(2.25rem,6.4vw,4.75rem)] leading-[1.02] font-semibold tracking-[-0.035em]">
            {t(COPY.hero.heading)}
          </h1>

          <p className="text-ink-muted mt-7 max-w-2xl text-[clamp(1rem,1.35vw,1.1875rem)] leading-relaxed">
            {t(COPY.hero.sub)}
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Cta href="#products" variant="primary">
              {t(COPY.hero.ctaPrimary)}
              <CtaArrow />
            </Cta>
            <Cta href="#about" variant="secondary">
              {t(COPY.hero.ctaSecondary)}
            </Cta>
          </div>

          <p className="text-ink-subtle mt-10 text-sm tracking-[-0.01em]">
            {t(COPY.hero.micro)}
          </p>
        </div>
      </div>
    </section>
  );
}
