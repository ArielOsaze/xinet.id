"use client";

import { useEffect, useRef, useState } from "react";
import { XinetLogo } from "@/components/brand/xinet-logo";
import { LanguageToggle } from "@/components/ui/language-toggle";
import { useLang } from "@/components/providers/language-provider";
import { COPY, NAV } from "@/lib/content";
import { PillLinks } from "@/components/reactbits/PillLinks";
import { ScrollLink } from "@/components/ui/scroll-link";
import { cn } from "@/lib/utils";

/**
 * Fixed navigation.
 *
 * Behaviour: fully transparent at the top of the page, then a dark translucent
 * surface with backdrop blur once scrolled. Only background/border properties
 * change, so there is no layout shift and no reflow while scrolling.
 */
export function Navbar() {
  const { t } = useLang();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the mobile panel on Escape and lock scroll while it is open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-500 ease-out motion-reduce:transition-none",
        scrolled
          ? "border-line border-b bg-[rgba(8,10,12,0.72)] backdrop-blur-xl"
          : "border-b border-transparent bg-transparent"
      )}
    >
      <nav
        aria-label="Utama"
        className="shell flex h-[var(--x-nav-h)] items-center justify-between gap-6"
      >
        {/* Brand */}
        <ScrollLink
          href="#top"
          className="flex shrink-0 items-center rounded-md py-2"
          ariaLabel="Xinet — beranda"
        >
          <XinetLogo variant="wordmark" height={22} priority alt={t(COPY.hero.logoAlt)} />
        </ScrollLink>

        {/* Desktop links — ReactBits PillNav hover animation, no floating rail */}
        <PillLinks
          className="hidden gap-0.5 lg:flex"
          items={NAV.map((item) => ({
            label: t(item.label),
            href: `#${item.id}`,
            ariaLabel: t(item.label),
          }))}
        />

        {/* Desktop actions — deliberately lighter than the page CTAs so the
            navbar never competes with the hero. */}
        <div className="hidden items-center gap-2.5 lg:flex">
          <LanguageToggle />
          <ScrollLink
            href="#products"
            className="bg-ink text-[#080A0C] hover:bg-white inline-flex h-8 items-center rounded-full px-3.5 text-[0.8125rem] font-medium transition-colors duration-300 motion-reduce:transition-none"
          >
            {t(COPY.nav.cta)}
          </ScrollLink>
        </div>

        {/* Mobile actions */}
        <div className="flex items-center gap-2 lg:hidden">
          <LanguageToggle />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? t(COPY.nav.menuClose) : t(COPY.nav.menuOpen)}
            className="border-line text-ink hover:bg-white/[0.04] flex size-9 items-center justify-center rounded-full border transition-colors duration-200 motion-reduce:transition-none"
          >
            <span className="relative block h-3 w-4" aria-hidden="true">
              <span
                className={cn(
                  "bg-ink absolute left-0 block h-px w-4 transition-transform duration-300 motion-reduce:transition-none",
                  open ? "top-1.5 rotate-45" : "top-0.5"
                )}
              />
              <span
                className={cn(
                  "bg-ink absolute left-0 block h-px transition-all duration-300 motion-reduce:transition-none",
                  open ? "top-1.5 w-4 -rotate-45" : "top-2.5 w-3"
                )}
              />
            </span>
          </button>
        </div>
      </nav>

      {/* Mobile panel — opaque surface, simple stacking, no animation overhead */}
      <div
        id="mobile-menu"
        ref={panelRef}
        hidden={!open}
        className="border-line bg-base/97 border-t backdrop-blur-xl lg:hidden"
      >
        <ul className="shell flex flex-col py-3">
          {NAV.map((item) => (
            <li key={item.id}>
              <ScrollLink
                href={`#${item.id}`}
                onNavigate={() => setOpen(false)}
                className="text-ink-muted hover:text-ink border-line block border-b py-3.5 text-[1rem] transition-colors duration-200 last:border-0 motion-reduce:transition-none"
              >
                {t(item.label)}
              </ScrollLink>
            </li>
          ))}
        </ul>
        <div className="shell pb-5">
          <ScrollLink
            href="#products"
            onNavigate={() => setOpen(false)}
            className="bg-ink text-[#080A0C] flex h-10 w-full items-center justify-center rounded-full text-[0.8125rem] font-medium"
          >
            {t(COPY.nav.cta)}
          </ScrollLink>
        </div>
      </div>
    </header>
  );
}
