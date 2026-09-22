"use client";

import { useLang } from "@/components/providers/language-provider";
import { COPY, type Lang } from "@/lib/content";
import RubberSegment from "@/components/reactbits/RubberSegment";

/**
 * Language toggle built on ReactBits RubberSegment.
 *
 * RubberSegment gives the thumb a rubber-band feel: it stretches across the gap
 * while switching and squashes onto the target slot, and it can be dragged. Its
 * `sm` preset keeps the whole control at 28px tall — visually below the nav CTA
 * so the CTA stays the primary action.
 */
export function LanguageToggle({ className }: { className?: string }) {
  const { lang, setLang, t } = useLang();

  return (
    <RubberSegment
      items={[
        { value: "id", label: "ID" },
        { value: "en", label: "EN" },
      ]}
      value={lang}
      onChange={(v: string) => setLang(v as Lang)}
      size="sm"
      equalSlots
      trackColor="rgba(255,255,255,0.04)"
      thumbColor="#f5f7f8"
      textColor="#7a838c"
      activeTextColor="#080a0c"
      radius={999}
      aria-label={t(COPY.nav.langLabel)}
      className={className}
    />
  );
}
