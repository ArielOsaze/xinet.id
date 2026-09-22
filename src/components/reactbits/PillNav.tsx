"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { gsap } from "gsap";

/**
 * PillNav — ReactBits PillNav, vendored and adapted for this site.
 *
 * Changes from upstream:
 *  - `react-router-dom` removed: this is a single-page site, so navigation is
 *    plain anchors and the router dependency would be dead weight.
 *  - Colours come from Xinet tokens instead of hard-coded hex values.
 *  - The logo slot accepts a node, so the real Xinet logo renders inside it
 *    instead of a square image crop.
 *  - The hover circle animation, label swap and mobile drawer are kept as-is.
 */

export type PillNavItem = {
  label: string;
  href: string;
  ariaLabel?: string;
};

export interface PillNavProps {
  logo: React.ReactNode;
  items: PillNavItem[];
  activeHref?: string;
  className?: string;
  ease?: string;
  /** Pill background (the sliding rail). */
  baseColor?: string;
  /** Inactive pill background. */
  pillColor?: string;
  hoveredPillTextColor?: string;
  pillTextColor?: string;
  onMobileMenuClick?: () => void;
  initialLoadAnimation?: boolean;
  /** Height of the nav rail in px. Kept small so it never outweighs the page. */
  navHeight?: number;
  /** Right-hand slot for extra controls (language toggle, CTA). */
  trailing?: React.ReactNode;
  /** Controls shown inside the mobile drawer (language toggle, CTA). */
  mobileTrailing?: React.ReactNode;
}

export function PillNav({
  logo,
  items,
  activeHref,
  className = "",
  ease = "power3.easeOut",
  baseColor = "#15191d",
  pillColor = "transparent",
  hoveredPillTextColor = "#080a0c",
  pillTextColor,
  onMobileMenuClick,
  initialLoadAnimation = true,
  navHeight = 40,
  trailing,
  mobileTrailing,
}: PillNavProps) {
  const resolvedPillTextColor = pillTextColor ?? "#929aa3";
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const circleRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const tlRefs = useRef<Array<gsap.core.Timeline | null>>([]);
  const activeTweenRefs = useRef<Array<gsap.core.Tween | null>>([]);
  const logoTweenRef = useRef<gsap.core.Tween | null>(null);
  const hamburgerRef = useRef<HTMLButtonElement | null>(null);
  const mobileMenuRef = useRef<HTMLDivElement | null>(null);
  const navItemsRef = useRef<HTMLDivElement | null>(null);
  const logoRef = useRef<HTMLAnchorElement | null>(null);

  useEffect(() => {
    const layout = () => {
      circleRefs.current.forEach((circle) => {
        if (!circle?.parentElement) return;

        const pill = circle.parentElement as HTMLElement;
        const rect = pill.getBoundingClientRect();
        const { width: w, height: h } = rect;
        if (!w || !h) return;

        // Circle sized so it can fill the pill when scaled from the bottom edge.
        const R = (w * w) / 4 / h + h / 4;
        const D = Math.ceil(2 * R) + 2;
        const delta = Math.ceil(R - Math.sqrt(Math.max(0, R * R - (w * w) / 4))) + 1;
        const originY = D - delta;

        circle.style.width = `${D}px`;
        circle.style.height = `${D}px`;
        circle.style.bottom = `-${delta}px`;

        gsap.set(circle, {
          xPercent: -50,
          scale: 0,
          transformOrigin: `50% ${originY}px`,
        });

        const label = pill.querySelector<HTMLElement>(".pill-label");
        const white = pill.querySelector<HTMLElement>(".pill-label-hover");

        if (label) gsap.set(label, { y: 0 });
        if (white) gsap.set(white, { y: h + 12, opacity: 0 });

        const index = circleRefs.current.indexOf(circle);
        if (index === -1) return;

        tlRefs.current[index]?.kill();
        const tl = gsap.timeline({ paused: true });

        tl.to(circle, { scale: 1.2, xPercent: -50, duration: 2, ease, overwrite: "auto" }, 0);
        if (label) tl.to(label, { y: -(h + 8), duration: 2, ease, overwrite: "auto" }, 0);
        if (white) tl.to(white, { y: 0, opacity: 1, duration: 2, ease, overwrite: "auto" }, 0);

        tlRefs.current[index] = tl;
      });
    };

    layout();
    window.addEventListener("resize", layout);
    if (document.fonts) document.fonts.ready.then(layout).catch(() => {});

    const menu = mobileMenuRef.current;
    if (menu) gsap.set(menu, { visibility: "hidden", opacity: 0, scaleY: 1, y: 0 });

    if (initialLoadAnimation) {
      const logoEl = logoRef.current;
      const navItems = navItemsRef.current;
      if (logoEl) {
        gsap.set(logoEl, { scale: 0 });
        gsap.to(logoEl, { scale: 1, duration: 0.6, ease });
      }
      if (navItems) {
        gsap.set(navItems, { width: 0, overflow: "hidden" });
        gsap.to(navItems, { width: "auto", duration: 0.6, ease });
      }
    }

    return () => window.removeEventListener("resize", layout);
  }, [items, ease, initialLoadAnimation]);

  const handleEnter = useCallback(
    (i: number) => {
      const tl = tlRefs.current[i];
      if (!tl) return;
      activeTweenRefs.current[i]?.kill();
      activeTweenRefs.current[i] = tl.tweenTo(tl.duration(), {
        duration: 0.3,
        ease,
        overwrite: "auto",
      });
    },
    [ease]
  );

  const handleLeave = useCallback(
    (i: number) => {
      const tl = tlRefs.current[i];
      if (!tl) return;
      activeTweenRefs.current[i]?.kill();
      activeTweenRefs.current[i] = tl.tweenTo(0, {
        duration: 0.2,
        ease,
        overwrite: "auto",
      });
    },
    [ease]
  );

  const handleLogoEnter = () => {
    const el = logoRef.current;
    if (!el) return;
    logoTweenRef.current?.kill();
    logoTweenRef.current = gsap.to(el, {
      scale: 1.06,
      duration: 0.25,
      ease,
      yoyo: true,
      repeat: 1,
      overwrite: "auto",
    });
  };

  const toggleMobileMenu = () => {
    const newState = !isMobileMenuOpen;
    setIsMobileMenuOpen(newState);

    const hamburger = hamburgerRef.current;
    const menu = mobileMenuRef.current;

    if (hamburger) {
      const lines = hamburger.querySelectorAll(".hamburger-line");
      if (lines.length >= 2) {
        gsap.to(lines[0], { rotation: newState ? 45 : 0, y: newState ? 3 : 0, duration: 0.3, ease });
        gsap.to(lines[1], { rotation: newState ? -45 : 0, y: newState ? -3 : 0, duration: 0.3, ease });
      }
    }

    if (menu) {
      if (newState) {
        gsap.set(menu, { visibility: "visible" });
        gsap.fromTo(
          menu,
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, duration: 0.3, ease, transformOrigin: "top center" }
        );
      } else {
        gsap.to(menu, {
          opacity: 0,
          y: 10,
          duration: 0.2,
          ease,
          onComplete: () => gsap.set(menu, { visibility: "hidden" }),
        });
      }
    }

    onMobileMenuClick?.();
  };

  const cssVars = {
    "--base": baseColor,
    "--pill-bg": pillColor,
    "--hover-text": hoveredPillTextColor,
    "--pill-text": resolvedPillTextColor,
    "--nav-h": `${navHeight}px`,
    "--pill-pad-x": "14px",
    "--pill-gap": "2px",
  } as CSSProperties;

  return (
    <nav
      className={`relative flex w-full items-center justify-between md:w-max md:justify-start ${className}`}
      aria-label="Primary"
      style={cssVars}
    >
      {/* Brand */}
      <a
        href="#top"
        aria-label="Xinet — beranda"
        onMouseEnter={handleLogoEnter}
        ref={logoRef}
        className="inline-flex shrink-0 items-center"
      >
        {logo}
      </a>

      {/* Desktop pills */}
      <div
        ref={navItemsRef}
        className="relative ml-2 hidden items-center rounded-full md:flex"
        style={{ height: "var(--nav-h)", background: "var(--base, #000)" }}
      >
        <ul role="menubar" className="m-0 flex h-full list-none items-stretch p-[3px]" style={{ gap: "var(--pill-gap)" }}>
          {items.map((item, i) => {
            const isActive = activeHref === item.href;
            const pillStyle: CSSProperties = {
              background: isActive ? "var(--pill-bg-active, rgba(255,255,255,0.06))" : "var(--pill-bg)",
              color: "var(--pill-text, var(--base, #000))",
              paddingLeft: "var(--pill-pad-x)",
              paddingRight: "var(--pill-pad-x)",
            };

            return (
              <li key={item.href} role="none" className="flex">
                <a
                  role="menuitem"
                  href={item.href}
                  aria-label={item.ariaLabel || item.label}
                  className="hover-circle-host relative inline-flex h-full items-center overflow-hidden rounded-full px-0 text-[0.8125rem] font-medium no-underline"
                  style={pillStyle}
                  onMouseEnter={() => handleEnter(i)}
                  onMouseLeave={() => handleLeave(i)}
                >
                  <span
                    className="hover-circle pointer-events-none absolute bottom-0 left-1/2 z-[1] block rounded-full"
                    style={{ background: "#f5f7f8", willChange: "transform" }}
                    aria-hidden="true"
                    ref={(el) => {
                      circleRefs.current[i] = el;
                    }}
                  />
                  <span className="relative z-[2] inline-block leading-none">
                    <span className="pill-label relative z-[2] inline-block leading-none" style={{ willChange: "transform" }}>
                      {item.label}
                    </span>
                    <span
                      className="pill-label-hover absolute top-0 left-0 z-[3] inline-block leading-none"
                      style={{ color: "var(--hover-text, #fff)", willChange: "transform, opacity" }}
                      aria-hidden="true"
                    >
                      {item.label}
                    </span>
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Trailing controls: language toggle + CTA on desktop */}
      {trailing && <div className="ml-2.5 hidden items-center gap-2 md:flex">{trailing}</div>}

      {/* Mobile controls: keep the language toggle reachable without opening the
          drawer, then the hamburger. */}
      <div className="flex items-center gap-2 md:hidden">
        {mobileTrailing}
        <button
          ref={hamburgerRef}
          type="button"
          onClick={toggleMobileMenu}
          aria-expanded={isMobileMenuOpen}
          aria-controls="pill-mobile-menu"
          aria-label="Menu"
          className="border-line flex size-9 items-center justify-center rounded-full border"
        >
          <span className="relative block h-3 w-4" aria-hidden="true">
            <span className="hamburger-line bg-ink absolute top-0.5 left-0 block h-px w-4" />
            <span className="hamburger-line bg-ink absolute top-2.5 left-0 block h-px w-4" />
          </span>
        </button>
      </div>

      {/* Mobile drawer */}
      <div
        id="pill-mobile-menu"
        ref={mobileMenuRef}
        className="border-line bg-base/97 absolute top-full left-0 w-full rounded-b-2xl border backdrop-blur-xl md:hidden"
      >
        <ul className="m-0 flex list-none flex-col p-3">
          {items.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-ink-muted hover:text-ink block px-3 py-3 text-base"
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}

export default PillNav;
