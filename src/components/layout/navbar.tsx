"use client";

import { useEffect, useState } from "react";
import { XinetLogo } from "@/components/brand/xinet-logo";
import { LanguageToggle } from "@/components/ui/language-toggle";
import { useLang } from "@/components/providers/language-provider";
import { COPY, NAV } from "@/lib/content";
import { PillNav, type PillNavItem } from "@/components/reactbits/PillNav";
import { cn } from "@/lib/utils";

/**
 * Fixed navigation built on ReactBits PillNav.
 *
 * Behaviour: fully transparent at the top of the page, then a dark translucent
 * surface with backdrop blur once scrolled. Only background/border properties
 * change, so there is no layout shift and no reflow while scrolling.
 *
 * The pill rail and its hover circle animation come from PillNav; the language
 * toggle and CTA ride along in its `trailing` slot so everything shares one
 * 40px baseline instead of competing sizes.
 */
export function Navbar() {
  const { t } = useLang();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const items: PillNavItem[] = NAV.map((item) => ({
    label: t(item.label),
    href: `#${item.id}`,
    ariaLabel: t(item.label),
  }));

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-500 ease-out motion-reduce:transition-none",
        scrolled
          ? "border-line border-b bg-[rgba(8,10,12,0.72)] backdrop-blur-xl"
          : "border-b border-transparent bg-transparent"
      )}
    >
      <div className="shell flex h-[var(--x-nav-h)] items-center justify-between gap-4">
        <PillNav
          items={items}
          logo={
            <XinetLogo variant="wordmark" height={20} priority alt={t(COPY.hero.logoAlt)} />
          }
          initialLoadAnimation={false}
          navHeight={40}
          trailing={
            <>
              <LanguageToggle />
              <a
                href="#products"
                className="bg-ink text-base hover:bg-white inline-flex h-7 items-center rounded-full px-3 text-[0.75rem] font-medium transition-colors duration-300 motion-reduce:transition-none"
              >
                {t(COPY.nav.cta)}
              </a>
            </>
          }
          mobileTrailing={<LanguageToggle />}
        />
      </div>
    </header>
  );
}
