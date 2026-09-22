"use client";

import { useLang } from "@/components/providers/language-provider";
import { COPY } from "@/lib/content";
import { cn } from "@/lib/utils";

/**
 * Compact ID / EN switch. Rendered as a radio group so the current language is
 * exposed to assistive tech instead of being a purely visual toggle.
 *
 * Deliberately small: 24px tall, a step below the nav CTA in weight so the CTA
 * stays the primary action. Each option is 24px tall and ≥24px wide, which is
 * the WCAG 2.2 minimum target size — going smaller would start failing that.
 */
export function LanguageToggle({ className }: { className?: string }) {
  const { lang, setLang, t } = useLang();

  return (
    <div
      role="radiogroup"
      aria-label={t(COPY.nav.langLabel)}
      className={cn(
        "border-line flex h-6 items-center gap-px rounded-full border p-px",
        className
      )}
    >
      {(["id", "en"] as const).map((code) => {
        const active = lang === code;
        return (
          <button
            key={code}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => setLang(code)}
            className={cn(
              "flex h-full min-w-[26px] items-center justify-center rounded-full px-1.5 text-[0.5625rem] font-semibold tracking-[0.05em] uppercase transition-colors duration-200 motion-reduce:transition-none",
              active ? "bg-ink text-base" : "text-ink-subtle hover:text-ink"
            )}
          >
            {code}
          </button>
        );
      })}
    </div>
  );
}
