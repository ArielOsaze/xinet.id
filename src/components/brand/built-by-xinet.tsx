import { COPY } from "@/lib/content";
import { cn } from "@/lib/utils";

/**
 * BuiltByXinet — reusable company signature.
 *
 * Intended to be dropped into NexShop, SayBot, AkunTuntas, AkuAI and future
 * Xinet projects. It is a quiet endorsement line, never a badge: hairline rule,
 * small caps label, no fill and no glow.
 *
 * Usage in another product:
 *   <BuiltByXinet href="https://xinet.id" lang="id" />
 */
export function BuiltByXinet({
  href = "https://xinet.id",
  lang = "en",
  className,
}: {
  href?: string;
  lang?: "id" | "en";
  className?: string;
}) {
  return (
    <a
      href={href}
      className={cn(
        "group/sig text-ink-subtle hover:text-ink-muted inline-flex items-center gap-2 text-[0.6875rem] font-medium tracking-[0.14em] uppercase transition-colors duration-300 motion-reduce:transition-none",
        className
      )}
    >
      <span aria-hidden="true" className="bg-line-strong h-px w-6 transition-all duration-300 group-hover/sig:w-8 motion-reduce:transition-none" />
      <span>{COPY.builtBy.label[lang]}</span>
    </a>
  );
}
