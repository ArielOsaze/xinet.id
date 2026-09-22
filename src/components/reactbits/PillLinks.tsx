"use client";

import { useCallback, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollLink } from "@/components/ui/scroll-link";

/**
 * PillLinks — the hover animation from ReactBits PillNav, applied to ordinary
 * nav links.
 *
 * The stock PillNav wraps its links in a dark floating rail, which changes the
 * header layout. This site keeps its original header (logo left, links centre,
 * actions right), so only the animation was extracted: the circle that expands
 * from the bottom edge plus the label swap.
 *
 * Links render through ScrollLink so clicking one scrolls without writing a `#`
 * fragment into the address bar.
 */

export type PillLinkItem = {
  label: string;
  href: string;
  ariaLabel?: string;
};

type Props = {
  items: PillLinkItem[];
  className?: string;
  ease?: string;
};

export function PillLinks({ items, className = "", ease = "power3.easeOut" }: Props) {
  const circleRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const linkRefs = useRef<Array<HTMLAnchorElement | null>>([]);
  const tlRefs = useRef<Array<gsap.core.Timeline | null>>([]);
  const activeTweens = useRef<Array<gsap.core.Tween | null>>([]);

  useEffect(() => {
    const layout = () => {
      circleRefs.current.forEach((circle, i) => {
        const link = linkRefs.current[i];
        if (!circle || !link) return;

        const { width: w, height: h } = link.getBoundingClientRect();
        if (!w || !h) return;

        // Circle big enough to cover the link when scaled up from the bottom.
        const R = (w * w) / 4 / h + h / 4;
        const D = Math.ceil(2 * R) + 2;
        const delta = Math.ceil(R - Math.sqrt(Math.max(0, R * R - (w * w) / 4))) + 1;
        const originY = D - delta;

        circle.style.width = `${D}px`;
        circle.style.height = `${D}px`;
        circle.style.bottom = `-${delta}px`;

        gsap.set(circle, { xPercent: -50, scale: 0, transformOrigin: `50% ${originY}px` });

        const label = link.querySelector<HTMLElement>(".pill-label");
        const swap = link.querySelector<HTMLElement>(".pill-label-hover");

        if (label) gsap.set(label, { y: 0 });
        if (swap) gsap.set(swap, { y: h + 12, opacity: 0 });

        tlRefs.current[i]?.kill();
        const tl = gsap.timeline({ paused: true });
        tl.to(circle, { scale: 1.2, xPercent: -50, duration: 2, ease, overwrite: "auto" }, 0);
        if (label) tl.to(label, { y: -(h + 8), duration: 2, ease, overwrite: "auto" }, 0);
        if (swap) tl.to(swap, { y: 0, opacity: 1, duration: 2, ease, overwrite: "auto" }, 0);
        tlRefs.current[i] = tl;
      });
    };

    layout();
    window.addEventListener("resize", layout);
    if (document.fonts) document.fonts.ready.then(layout).catch(() => {});
    return () => window.removeEventListener("resize", layout);
  }, [items, ease]);

  const enter = useCallback(
    (i: number) => {
      const tl = tlRefs.current[i];
      if (!tl) return;
      activeTweens.current[i]?.kill();
      activeTweens.current[i] = tl.tweenTo(tl.duration(), {
        duration: 0.3,
        ease,
        overwrite: "auto",
      });
    },
    [ease]
  );

  const leave = useCallback(
    (i: number) => {
      const tl = tlRefs.current[i];
      if (!tl) return;
      activeTweens.current[i]?.kill();
      activeTweens.current[i] = tl.tweenTo(0, { duration: 0.2, ease, overwrite: "auto" });
    },
    [ease]
  );

  return (
    <ul className={`flex list-none items-center ${className}`}>
      {items.map((item, i) => (
        <li key={item.href}>
          <ScrollLink
            ref={(el) => {
              linkRefs.current[i] = el;
            }}
            href={item.href}
            ariaLabel={item.ariaLabel || item.label}
            onMouseEnter={() => enter(i)}
            onMouseLeave={() => leave(i)}
            onFocus={() => enter(i)}
            onBlur={() => leave(i)}
            className="text-ink-muted relative inline-flex items-center overflow-hidden rounded-full px-3.5 py-2 text-sm font-medium"
          >
            <span
              ref={(el) => {
                circleRefs.current[i] = el;
              }}
              aria-hidden="true"
              className="pointer-events-none absolute bottom-0 left-1/2 z-[1] block rounded-full"
              style={{ background: "#f5f7f8", willChange: "transform" }}
            />
            <span className="relative z-[2] inline-block leading-none">
              <span
                className="pill-label relative z-[2] inline-block leading-none"
                style={{ willChange: "transform" }}
              >
                {item.label}
              </span>
              <span
                aria-hidden="true"
                className="pill-label-hover absolute top-0 left-0 z-[3] inline-block leading-none"
                style={{ color: "#080a0c", willChange: "transform, opacity" }}
              >
                {item.label}
              </span>
            </span>
          </ScrollLink>
        </li>
      ))}
    </ul>
  );
}

export default PillLinks;
