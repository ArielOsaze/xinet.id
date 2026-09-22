"use client";

import { useLang } from "@/components/providers/language-provider";
import { COPY } from "@/lib/content";
import ScrollReveal from "@/components/reactbits/ScrollReveal";

/**
 * Philosophy — one editorial statement, given room to breathe.
 * Only the key statement animates; everything else is still.
 */
export function Philosophy() {
  const { t } = useLang();

  return (
    <section className="shell py-28 md:py-40">
      <div className="mx-auto max-w-4xl text-center">
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

        <p className="text-ink-subtle mt-14 text-[clamp(1rem,1.7vw,1.25rem)] tracking-[-0.01em]">
          {t(COPY.philosophy.statement)}
        </p>
      </div>
    </section>
  );
}
