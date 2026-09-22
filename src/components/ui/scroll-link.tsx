"use client";

import { useCallback, forwardRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * ScrollLink — in-page navigation without the `#` in the address bar.
 *
 * A plain `href="#products"` writes the fragment into the URL, which the user
 * found visually ugly. This intercepts the click and scrolls programmatically
 * instead, so the address bar keeps showing the clean origin.
 *
 * Accessibility is preserved deliberately:
 *  - it renders a real `<a>` with the fragment in `href`, so middle-click,
 *    "open in new tab", and the status-bar preview all still work;
 *  - keyboard activation is identical to a click (Enter on a focused link);
 *  - focus moves to the target element, which is what a fragment navigation
 *    would have done, so screen-reader position is not lost;
 *  - `preventDefault` is skipped for modified clicks (ctrl/cmd/shift/alt), so
 *    the user can still open the target in a new tab if they want to.
 *
 * The scroll itself respects `prefers-reduced-motion`: smooth scrolling is
 * motion, so those users get an instant jump instead.
 *
 * Extra props (ref, mouse handlers, aria attributes) pass straight through to
 * the anchor, because callers such as PillLinks attach GSAP refs and hover
 * handlers to it.
 */

type ScrollLinkProps = {
  /** Fragment href, e.g. "#products". */
  href: string;
  children: ReactNode;
  className?: string;
  ariaLabel?: string;
  /** Called after the scroll starts — used to close the mobile menu. */
  onNavigate?: () => void;
} & Omit<React.ComponentPropsWithoutRef<"a">, "href" | "children" | "className">;

export const ScrollLink = forwardRef<HTMLAnchorElement, ScrollLinkProps>(
  function ScrollLink(
    { href, children, className, ariaLabel, onNavigate, onClick, ...rest },
    ref
  ) {
    const handleClick = useCallback(
      (e: React.MouseEvent<HTMLAnchorElement>) => {
        // Give the caller first refusal (PillLinks and friends may need to act).
        onClick?.(e);

        // Let the browser handle modified clicks normally.
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;

        const id = href.startsWith("#") ? href.slice(1) : href;
        const target = document.getElementById(id);
        if (!target) return;

        e.preventDefault();

        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        target.scrollIntoView({
          behavior: reduce ? "auto" : "smooth",
          block: "start",
        });

        // Move focus without adding a scroll jump of its own.
        if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
        target.focus({ preventScroll: true });

        onNavigate?.();
      },
      [href, onNavigate, onClick]
    );

    return (
      <a
        ref={ref}
        href={href}
        onClick={handleClick}
        className={cn(className)}
        aria-label={ariaLabel}
        {...rest}
      >
        {children}
      </a>
    );
  }
);

export default ScrollLink;
