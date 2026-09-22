"use client";

import { useLang } from "@/components/providers/language-provider";
import { COPY } from "@/lib/content";
import { cn } from "@/lib/utils";

/**
 * Compact ID / EN switch. Rendered as a radio group so the current language is
 * exposed to assistive tech instead of being a purely visual toggle.
 *
 * Sized to sit *below* the CTA in visual weight: a fixed 32px height keeps it
 * aligned with the nav CTA without out-measuring it, and each option still
 * clears the WCAG 2.2 target-size minimum (24×24).
 */
export function LanguageToggle({ className }: { className?: string }) {
  const { lang, setLang, t } = useLang();

  return (
    <div
      role="radiogroup"
      aria-label={t(COPY.nav.langLabel)}
      className={cn(
        "border-line flex h-8 items-center gap-[3px] rounded-full border p-[3px]",
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
              "flex h-full items-center rounded-full px-2.5 text-[0.625rem] font-semibold tracking-[0.06em] uppercase transition-colors duration-200 motion-reduce:transition-none",
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
