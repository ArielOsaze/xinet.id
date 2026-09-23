"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Completes a cross-page section jump without putting a `#` in the URL.
 *
 * The navbar is shared, but its sections only exist on the landing page. When a
 * visitor clicks "Products" from /projects/<id>, ScrollLink records the intended
 * section and routes home. This component reads that record on arrival, scrolls
 * to the section, and clears it.
 *
 * Using sessionStorage rather than a `#fragment` (or a query string) keeps the
 * address bar clean, which was an explicit requirement — a `#` in the URL is
 * what this whole ScrollLink component exists to avoid.
 *
 * It also handles a real `#` fragment typed or pasted by a visitor, so a shared
 * deep link still lands in the right place.
 *
 * The effect is keyed on `pathname` deliberately. This component lives in the
 * root layout, which React preserves across a client-side route change — so a
 * plain `[]` effect runs once, on whatever page happened to load first, and
 * never again. That is why the jump silently did nothing: the storage entry was
 * written, the home page mounted, and no code ever looked at it.
 */
const KEY = "xinet:scroll-to";

export function PendingScroll() {
  const pathname = usePathname();

  useEffect(() => {
    const scrollTo = (id: string) => {
      const el = document.getElementById(id);
      if (!el) return false;
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
      if (!el.hasAttribute("tabindex")) el.setAttribute("tabindex", "-1");
      el.focus({ preventScroll: true });
      return true;
    };

    const pending = (() => {
      try {
        return sessionStorage.getItem(KEY);
      } catch {
        return null;
      }
    })();

    if (pending) {
      try {
        sessionStorage.removeItem(KEY);
      } catch {
        /* ignore */
      }
    }

    // Fall back to a real fragment if one is present in the address bar.
    const fragment = window.location.hash.replace(/^#/, "");
    const wanted = pending || fragment;
    if (!wanted) return;

    // The sections are client components that mount after this effect on a cold
    // load, so retry briefly rather than dropping the jump.
    let tries = 0;
    let raf = 0;
    const attempt = () => {
      if (scrollTo(wanted) || tries++ > 60) return;
      raf = requestAnimationFrame(attempt);
    };
    raf = requestAnimationFrame(attempt);

    // If we arrived via a real fragment, drop it so the URL stays clean.
    if (fragment && !pending) {
      try {
        history.replaceState(null, "", window.location.pathname + window.location.search);
      } catch {
        /* ignore */
      }
    }

    return () => cancelAnimationFrame(raf);
  }, [pathname]);

  return null;
}

/** Record the section a cross-page link should land on. */
export function rememberScrollTarget(id: string) {
  try {
    sessionStorage.setItem(KEY, id);
  } catch {
    /* storage unavailable — the home page will simply open at the top */
  }
}

export default PendingScroll;
