"use client";

import { useLang } from "@/components/providers/language-provider";
import { COPY } from "@/lib/content";
import { cn } from "@/lib/utils";

/**
 * Compact ID / EN switch. Rendered as a radio group so the current language is
 * exposed to assistive tech instead of being a purely visual toggle.
 */
export function LanguageToggle({ className }: { className?: string }) {
  const { lang, setLang, t } = useLang();

  return (
    <div
      role="radiogroup"
      aria-label={t(COPY.nav.langLabel)}
      className={cn(
        "border-line flex items-center gap-0.5 rounded-full border p-0.5",
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
              "rounded-full px-2.5 py-1 text-[0.6875rem] font-semibold tracking-[0.08em] uppercase transition-colors duration-200 motion-reduce:transition-none",
              active
                ? "bg-ink text-base"
                : "text-ink-subtle hover:text-ink"
            )}
          >
            {code}
          </button>
        );
      })}
    </div>
  );
}
