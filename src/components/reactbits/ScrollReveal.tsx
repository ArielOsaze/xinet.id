"use client";

import {
  Fragment,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

/**
 * ScrollReveal — word-by-word reveal on scroll (ReactBits Scroll Reveal, made
 * production-safe).
 *
 * Why this differs from the stock implementation:
 *  - Upstream sets every word to `baseOpacity` as its initial state, so if the
 *    animation never runs the copy stays unreadable. Here the server renders
 *    fully legible text; the dimmed state is applied on the client only, before
 *    paint, and only when motion is allowed.
 *  - Upstream cleanup calls `ScrollTrigger.getAll().kill()`, which tears down
 *    every other scroll animation on the page. This version owns nothing but its
 *    own IntersectionObserver.
 *  - No GSAP: one observer plus per-word transitions gives the same scrub-style
 *    reveal at a fraction of the main-thread cost.
 */

// useLayoutEffect warns during SSR; this keeps the pre-paint write without it.
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

type ScrollRevealProps = {
  children: ReactNode;
  /** Dimmed starting opacity for words not yet revealed. */
  baseOpacity?: number;
  enableBlur?: boolean;
  blurStrength?: number;
  containerClassName?: string;
  textClassName?: string;
};

export function ScrollReveal({
  children,
  baseOpacity = 0.12,
  enableBlur = true,
  blurStrength = 5,
  containerClassName = "",
  textClassName = "",
}: ScrollRevealProps) {
  const ref = useRef<HTMLHeadingElement>(null);
  const [armed, setArmed] = useState(false);
  const [revealed, setRevealed] = useState(false);

  /** Tokenised words. Each word is its own inline-block so it can animate. */
  const words = useMemo(() => {
    const text = typeof children === "string" ? children : "";
    return text.split(/(\s+)/).map((token, i) => ({
      key: i,
      text: token,
      isSpace: /^\s+$/.test(token),
    }));
  }, [children]);

  // Arm the dimmed state before paint so there is no visible flash.
  useIsomorphicLayoutEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setArmed(true);
  }, []);

  const reveal = useCallback(() => setRevealed(true), []);

  useEffect(() => {
    if (!armed || revealed) return;
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            reveal();
            observer.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -18% 0px", threshold: 0.05 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [armed, revealed, reveal]);

  const dimmed = armed && !revealed;

  return (
    <h2 ref={ref} className={cn("my-5", containerClassName)}>
      <span
        className={cn(
          "block text-[clamp(1.6rem,4vw,3rem)] leading-[1.5] font-semibold",
          textClassName
        )}
      >
        {words.map((word) =>
          word.isSpace ? (
            <Fragment key={word.key}>{word.text}</Fragment>
          ) : (
            <span
              key={word.key}
              className="inline-block"
              style={{
                opacity: dimmed ? baseOpacity : 1,
                filter:
                  dimmed && enableBlur ? `blur(${blurStrength}px)` : "blur(0px)",
                transform: dimmed ? "translateY(0.12em)" : "translateY(0)",
                transition:
                  "opacity 700ms cubic-bezier(0.16,1,0.3,1), filter 700ms cubic-bezier(0.16,1,0.3,1), transform 700ms cubic-bezier(0.16,1,0.3,1)",
                transitionDelay: revealed ? `${word.key * 22}ms` : "0ms",
                willChange: dimmed ? "opacity, filter, transform" : "auto",
              }}
            >
              {word.text}
            </span>
          )
        )}
      </span>
    </h2>
  );
}

export default ScrollReveal;
