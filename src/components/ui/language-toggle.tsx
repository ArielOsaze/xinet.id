"use client";

import { useLang } from "@/components/providers/language-provider";
import { COPY, type Lang } from "@/lib/content";
import { cn } from "@/lib/utils";

/**
 * Language switch — deliberately minimal.
 *
 * Two bare labels separated by a hairline, no track, no thumb, no border. The
 * active language is full-contrast white; the inactive one is muted. This keeps
 * it visually quieter than the nav CTA (which stays the only filled pill in the
 * header) while remaining a proper radio group for assistive tech.
 *
 * Hit areas are padded to 32x28 so the targets stay comfortable even though the
 * control reads as plain text.
 */
export function LanguageToggle({ className }: { className?: string }) {
  const { lang, setLang, t } = useLang();

  return (
    <div
      role="radiogroup"
      aria-label={t(COPY.nav.langLabel)}
      className={cn("flex items-center", className)}
    >
      {(["id", "en"] as const).map((code, i) => {
        const active = lang === code;
        return (
          <span key={code} className="flex items-center">
            {i === 1 && (
              <span aria-hidden="true" className="bg-line-strong mx-1 block h-3 w-px" />
            )}
            <button
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => setLang(code as Lang)}
              className={cn(
                "px-1.5 py-1 text-[0.6875rem] font-medium tracking-[0.08em] uppercase transition-colors duration-200 motion-reduce:transition-none",
                active ? "text-ink" : "text-ink-subtle hover:text-ink-muted"
              )}
            >
              {code}
            </button>
          </span>
        );
      })}
    </div>
  );
}
