"use client";

import { useLang } from "@/components/providers/language-provider";
import { COPY } from "@/lib/content";
import ScrollReveal from "@/components/reactbits/ScrollReveal";
import ScrollVelocity from "@/components/reactbits/ScrollVelocity";

/**
 * Philosophy — one editorial statement, given room to breathe.
 *
 * The closing line runs as a ReactBits ScrollVelocity marquee: its speed and
 * direction react to how fast the visitor is scrolling, so the section feels
 * connected to the page rather than looping on its own. Static for
 * reduced-motion users (the global CSS rule neutralises the transform).
 */
export function Philosophy() {
  const { t } = useLang();

  return (
    <section className="py-28 md:py-40">
      <div className="shell mx-auto max-w-4xl text-center">
        <ScrollReveal
          baseOpacity={0.12}
          enableBlur
          blurStrength={6}
          containerClassName="!my-0"
          textClassName="!text-[clamp(1.75rem,4.4vw,3.5rem)] !leading-[1.14] !font-semibold !text-ink !tracking-[-0.035em]"
        >
          {t(COPY.philosophy.heading)}
        </ScrollReveal>

        <p className="text-ink-muted mx-auto mt-10 max-w-2xl text-[1.0625rem] leading-relaxed">
          {t(COPY.philosophy.body)}
        </p>
      </div>

      {/* Scroll-reactive marquee. Kept to a single line so it reads as a
          statement rather than decoration. */}
      <div className="mt-16 md:mt-20">
        <ScrollVelocity
          texts={[t(COPY.philosophy.statement)]}
          velocity={38}
          numCopies={8}
          damping={55}
          stiffness={320}
          velocityMapping={{ input: [0, 1000], output: [0, 3] }}
          className="text-ink-subtle !text-[clamp(1rem,1.7vw,1.35rem)] !font-normal !tracking-[-0.01em]"
          scrollerClassName="!text-[clamp(1rem,1.7vw,1.35rem)] !font-normal !leading-normal"
        />
      </div>
    </section>
  );
}
