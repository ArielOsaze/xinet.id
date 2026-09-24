import type { ReactNode } from "react";
import { ScrollLink } from "@/components/ui/scroll-link";
import { cn } from "@/lib/utils";

/**
 * Xinet CTA button. Separate from the shadcn primitive on purpose: the brand
 * uses pill geometry and its own surface rules, and nothing here should drift
 * if the shadcn defaults are regenerated later.
 */

type Variant = "primary" | "secondary" | "quiet";

const base =
  "group/cta relative inline-flex items-center justify-center gap-2 rounded-full text-sm font-medium tracking-[-0.01em] transition-[background-color,border-color,color,transform] duration-300 ease-out select-none";

// Both solid and outlined variants carry a 1px border so the pair renders at
// exactly the same height.
//
// `text-base` is NOT used here on purpose. The site defines `--color-base` in
// its @theme block, which makes Tailwind resolve `text-base` as the COLOUR
// `base` rather than the font-size `base`. On a filled pill that produced
// white-on-white text (both resolved to #F5F7F8), i.e. an apparently blank
// button. The size is set explicitly instead.
const variants: Record<Variant, string> = {
  primary:
    "border border-transparent bg-ink text-[#080A0C] px-6 py-3 text-sm hover:bg-white active:scale-[0.98] motion-reduce:active:scale-100",
  secondary:
    "border border-line-strong text-ink px-6 py-3 text-sm hover:border-white/30 hover:bg-white/[0.04] active:scale-[0.98] motion-reduce:active:scale-100",
  quiet: "text-ink-muted hover:text-ink px-1 py-1 text-sm",
};

type CtaProps = {
  children: ReactNode;
  variant?: Variant;
  className?: string;
  href?: string;
  external?: boolean;
  ariaLabel?: string;
};

export function Cta({
  children,
  variant = "primary",
  className,
  href,
  external,
  ariaLabel,
}: CtaProps) {
  const classes = cn(base, variants[variant], className);

  if (href && external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={classes}
        aria-label={ariaLabel}
      >
        {children}
      </a>
    );
  }

  // An in-page fragment is the only thing ScrollLink can act on. `mailto:`,
  // `tel:` and real routes must be ordinary anchors: ScrollLink would try to
  // find an element whose id is the whole string, fail, and preventDefault()
  // the click, which is why a mailto CTA did nothing at all.
  if (href && href.startsWith("#")) {
    return (
      <ScrollLink href={href} className={classes} ariaLabel={ariaLabel}>
        {children}
      </ScrollLink>
    );
  }

  if (href) {
    return (
      <a href={href} className={classes} aria-label={ariaLabel}>
        {children}
      </a>
    );
  }

  return (
    <ScrollLink href="#contact" className={classes} ariaLabel={ariaLabel}>
      {children}
    </ScrollLink>
  );
}

/** Arrow that nudges on hover — the only motion permitted on a CTA. */
export function CtaArrow({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-block transition-transform duration-300 ease-out group-hover/cta:translate-x-0.5 motion-reduce:transition-none motion-reduce:group-hover/cta:translate-x-0",
        className
      )}
    >
      →
    </span>
  );
}
