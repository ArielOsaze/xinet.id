"use client";

import { useLang } from "@/components/providers/language-provider";
import { COPY } from "@/lib/content";
import { Reveal } from "@/components/ui/reveal";
import { Cta, CtaArrow } from "@/components/ui/cta";
import GradualBlur from "@/components/reactbits/GradualBlur";

/**
 * FinalCta — the closing statement.
 *
 * Background motion is intentionally different from the hero: a slow horizontal
 * light sweep plus a bottom edge blur, no WebGL. Cheap, and it reads as a
 * settle-down rather than a second opening.
 */
export function FinalCta() {
  const { t } = useLang();

  return (
    <section id="contact" className="relative scroll-mt-24 overflow-hidden py-28 md:py-40">
      {/* Static bloom, distinct from the hero's vertical treatment */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-1/2 h-[34rem] w-[68rem] max-w-[130vw] -translate-x-1/2 -translate-y-1/2 opacity-[0.1] blur-[120px]"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(34,199,232,0.6) 0%, transparent 65%)",
        }}
      />

      {/* A single slow sweep — the only looping motion below the fold */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.35] motion-reduce:hidden"
        style={{
          background:
            "linear-gradient(105deg, transparent 38%, rgba(255,255,255,0.045) 50%, transparent 62%)",
          backgroundSize: "260% 100%",
          animation: "xinet-sweep 14s linear infinite",
        }}
      />

      <div className="shell relative">
        <Reveal className="mx-auto max-w-3xl text-center">
          <h2 className="text-ink text-[clamp(2rem,5vw,3.75rem)] leading-[1.05] font-semibold tracking-[-0.035em]">
            {t(COPY.finalCta.heading)}
          </h2>

          <p className="text-ink-muted mx-auto mt-7 max-w-xl text-[1.0625rem] leading-relaxed">
            {t(COPY.finalCta.body)}
          </p>

          <div className="mt-11 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Cta href="mailto:hello@xinet.id" variant="primary">
              {t(COPY.finalCta.primary)}
              <CtaArrow />
            </Cta>
            <Cta href="#products" variant="secondary">
              {t(COPY.finalCta.secondary)}
            </Cta>
          </div>
        </Reveal>
      </div>

      {/* Soften the section's bottom edge into the footer */}
      <GradualBlur
        target="parent"
        position="bottom"
        height="6rem"
        strength={1.6}
        divCount={5}
        curve="bezier"
        opacity={0.9}
        zIndex={1}
      />
    </section>
  );
}
