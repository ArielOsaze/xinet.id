import Link from "next/link";
import type { ReactNode } from "react";
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
const variants: Record<Variant, string> = {
  primary:
    "border border-transparent bg-ink text-base px-6 py-3 hover:bg-white active:scale-[0.98] motion-reduce:active:scale-100",
  secondary:
    "border border-line-strong text-ink px-6 py-3 hover:border-white/30 hover:bg-white/[0.04] active:scale-[0.98] motion-reduce:active:scale-100",
  quiet: "text-ink-muted hover:text-ink px-1 py-1",
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

  if (href) {
    return (
      <Link href={href} className={classes} aria-label={ariaLabel}>
        {children}
      </Link>
    );
  }

  return (
    <a href="#contact" className={classes} aria-label={ariaLabel}>
      {children}
    </a>
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
