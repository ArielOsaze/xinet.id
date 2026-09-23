"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

/**
 * TileReveal — scroll-driven tile sequence.
 *
 * Equivalent in behaviour to the React Bits Pro "Tile Reveal": a grid of tiles
 * flies in from the edges, zooms toward the viewer, then spreads outward and
 * clears the stage to reveal the content behind it. Implemented natively here
 * because that component ships only with a React Bits Pro licence.
 *
 * Engineering notes:
 *  - Progress is read from the sticky container's own geometry, so no
 *    ScrollTrigger or global scroll library is involved.
 *  - Transforms are written straight to DOM nodes inside a single rAF callback.
 *    React never re-renders during the sequence, which keeps scrolling at 60fps
 *    with no layout thrash.
 *  - Only `transform` and `opacity` animate, both GPU-composited.
 *  - prefers-reduced-motion (and no-JS) render the final state directly: the
 *    headline and content, fully visible, with no sequence and no extra scroll.
 */

// useLayoutEffect warns during SSR; this keeps the pre-paint write without it.
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

/** Phase boundaries within the 0..1 progress. */
const FLY_END = 0.42;
const ZOOM_END = 0.7;
const FLY_WINDOW = 0.28;

type TileRevealProps = {
  /** Tile surfaces, laid out row by row. */
  items: ReactNode[];
  /**
   * Optional reduced set for narrow screens. Fewer rows keep the settled grid
   * inside the viewport instead of clipping the top and bottom rows.
   */
  mobileItems?: ReactNode[];
  /** Stays centred over the tiles for the whole sequence. */
  headline?: ReactNode;
  /** Revealed once the tiles have cleared the stage. */
  children: ReactNode;
  columns?: number;
  gap?: number;
  /** Maximum grid width in px; shrinks with the viewport. */
  gridWidth?: number;
  /** Width-to-height ratio of each tile. `mobileAspect` overrides it when set. */
  tileAspect?: number;
  /**
   * Ratio used on narrow screens. Mobile viewports are tall, so a lower ratio
   * (taller tiles) lets the grid fill the screen instead of leaving dead space.
   */
  mobileAspect?: number;
  tileRadius?: number;
  direction?: "alternate" | "top" | "bottom";
  /** Delay between tiles, as a fraction of the fly-in window. */
  stagger?: number;
  /** Scale the grid reaches before the tiles leave the stage. */
  zoom?: number;
  /** How far tiles travel outward as they clear, relative to the fly distance. */
  spread?: number;
  /** Extra viewport heights of scroll that drive the sequence. */
  scrollLength?: number;
  className?: string;
};

export function TileReveal({
  items,
  mobileItems,
  headline,
  children,
  columns = 3,
  gap = 18,
  gridWidth = 780,
  tileAspect = 1.25,
  mobileAspect,
  tileRadius = 12,
  direction = "alternate",
  stagger = 0.5,
  zoom = 1.55,
  spread = 0.45,
  scrollLength = 1.8,
  className,
}: TileRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const tileRefs = useRef<(HTMLDivElement | null)[]>([]);
  const headlineRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const [armed, setArmed] = useState(false);
  const [cols, setCols] = useState(columns);
  const [isNarrow, setIsNarrow] = useState(false);
  /**
   * True when the visitor's OS asks for reduced motion.
   *
   * This used to make the component render a plain static block — no tiles at
   * all. That was wrong twice over:
   *
   *  1. It meant the section looked completely different on a machine with
   *     "reduce motion" switched on, which reads as a bug ("the animation is
   *     missing on my other PC") rather than as an accessibility feature.
   *  2. The whole point of the section is the reveal; replacing it with a bare
   *     block loses the content's structure, not just its motion.
   *
   * Reduced motion is honoured by *changing* the animation, not removing it:
   * the tiles still travel and the content still reveals, but the distance,
   * zoom and duration are cut right down and no scroll is hijacked. Same
   * information, minimal movement.
   */
  const [reduced, setReduced] = useState(false);

  // Arm the sequence before paint so nothing flashes.
  useIsomorphicLayoutEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    setArmed(true);
  }, []);

  // Follow the setting if the visitor changes it while the page is open.
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // Fewer columns on small screens keeps tiles legible and the fly-in readable.
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const apply = () => {
      setIsNarrow(!mq.matches);
      setCols(mq.matches ? columns : Math.min(2, columns));
    };
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [columns]);

  // Narrow screens use the reduced tile set so the settled grid fits vertically.
  const activeItems = isNarrow && mobileItems ? mobileItems : items;

  // Taller tiles on mobile so the grid fills the tall viewport instead of
  // leaving dead space below it.
  const aspect = isNarrow && mobileAspect ? mobileAspect : tileAspect;

  const rows = Math.max(1, Math.ceil(activeItems.length / cols));
  const lastOrder = Math.max(1, activeItems.length - 1);

  /** Write one frame of the sequence to the DOM. */
  const apply = useCallback(() => {
    const container = containerRef.current;
    const grid = gridRef.current;
    const stage = stageRef.current;
    if (!container || !grid || !stage) return;

    const viewportH = window.innerHeight;
    const travel = container.offsetHeight - viewportH;
    const rect = container.getBoundingClientRect();
    const p = travel > 0 ? clamp01(-rect.top / travel) : 0;

    // Reduced motion: the same sequence, but with the travel, zoom and spread
    // cut to a fraction so the reveal is a gentle shift rather than a swoop.
    const motionScale = reduced ? 0.22 : 1;
    const zoomAmount = 1 + (zoom - 1) * motionScale;

    // Cap the fly distance to the viewport so tiles start just off-screen rather
    // than far outside it — this is what caused horizontal spill on mobile.
    const stageW = stage.clientWidth || window.innerWidth;
    const flyDistance = Math.min(stageW * 1.15, window.innerWidth * 1.1) * motionScale;

    // Grid zoom
    const zoomP = clamp01((p - FLY_END) / (ZOOM_END - FLY_END));
    const gridScale = 1 + (zoomAmount - 1) * easeInOutCubic(zoomP);
    grid.style.transform = `scale(${gridScale})`;

    // Clear phase
    const clearP = clamp01((p - ZOOM_END) / (1 - ZOOM_END));
    const clearEased = easeInOutCubic(clearP);
    const tileFade = 1 - clamp01((clearP - 0.45) / 0.55);

    for (let i = 0; i < activeItems.length; i++) {
      const el = tileRefs.current[i];
      if (!el) continue;

      const col = i % cols;
      const row = Math.floor(i / cols);
      const dir =
        direction === "alternate"
          ? col % 2 === 0
            ? -1
            : 1
          : direction === "top"
            ? -1
            : 1;

      // Staggered fly-in: earlier tiles lead, later ones follow.
      const order = row * cols + col;
      const start = (order / lastOrder) * (FLY_END - FLY_WINDOW) * stagger * 2;
      const flyP = clamp01((p - start) / FLY_WINDOW);
      const flyEased = easeOutCubic(flyP);

      const flyX = dir * (1 - flyEased) * flyDistance;
      const clearX = dir * spread * flyDistance * clearEased;

      // Centre rows drift vertically so the grid opens outward, not just sideways.
      const centre = (rows - 1) / 2;
      const rowOffset = rows > 1 ? (row - centre) / Math.max(1, centre) : 0;
      const clearY = rowOffset * 0.12 * viewportH * clearEased * motionScale;

      el.style.transform = `translate3d(${flyX + clearX}px, ${clearY}px, 0)`;
      el.style.opacity = String(flyP > 0 ? tileFade : 0);
    }

    // Headline holds through the fly-in and zoom, then hands over to the content.
    if (headlineRef.current) {
      const headlineFade = 1 - clamp01((p - ZOOM_END) / 0.12);
      headlineRef.current.style.opacity = String(headlineFade);
      headlineRef.current.style.transform = `scale(${1 + 0.04 * zoomP})`;
      headlineRef.current.style.pointerEvents = headlineFade < 0.1 ? "none" : "auto";
    }

    // Content fades in as the tiles clear.
    if (contentRef.current) {
      const contentP = clamp01((p - (ZOOM_END + 0.06)) / 0.24);
      const contentEased = easeOutCubic(contentP);
      contentRef.current.style.opacity = String(contentEased);
      contentRef.current.style.transform = `translate3d(0, ${(1 - contentEased) * 18}px, 0)`;
      contentRef.current.style.pointerEvents = contentEased < 0.5 ? "none" : "auto";
    }
  }, [activeItems.length, aspect, cols, direction, lastOrder, reduced, rows, spread, stagger, zoom]);

  useEffect(() => {
    if (!armed) return;

    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        apply();
      });
    };

    apply();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [armed, apply]);

  // ---------------------------------------------------------------- pre-arm
  // This branch only runs during SSR and the first paint, before `armed` is set
  // in the layout effect. It renders the same structure as the live sequence so
  // there is no flash and no layout shift — it is not a "reduced motion"
  // fallback any more.
  if (!armed) {
    return (
      <div className={cn("shell py-24 md:py-32", className)}>
        {headline && (
          <div className="mb-8 text-center text-[clamp(2rem,5vw,3.5rem)] leading-[1.05] font-semibold tracking-[-0.035em]">
            {headline}
          </div>
        )}
        {children}
      </div>
    );
  }

  // -------------------------------------------------------------- sequence
  return (
    <div
      ref={containerRef}
      className={cn("relative", className)}
      style={{ height: `calc(100svh + ${scrollLength * 100}svh)` }}
    >
      <div className="sticky top-0 h-svh overflow-hidden">
        {/* Stage. `overflow-hidden` + a width cap stop tiles from spilling past
            the viewport while they are still flying in. Tiles are sized so the
            settled grid fits the viewport height without clipping rows. */}
        <div ref={stageRef} className="absolute inset-0 grid place-items-center overflow-hidden px-5 sm:px-6">
          <div
            ref={gridRef}
            className="grid will-change-transform"
            style={{
              // Size the grid from BOTH constraints: the width cap and the
              // height budget. Using max-height alone lets the last row clip,
              // because each tile's aspect ratio keeps its width at 100% while
              // only its height is capped.
              width: `min(${gridWidth}px, 100%, (82svh - ${(rows - 1) * gap}px) * ${cols} * ${aspect} / ${rows})`,
              gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
              gap,
            }}
          >
            {activeItems.map((item, i) => (
              <div
                key={i}
                ref={(el) => {
                  tileRefs.current[i] = el;
                }}
                className="will-change-transform"
                style={{
                  aspectRatio: String(aspect),
                  borderRadius: tileRadius,
                  // Start offscreen; the first frame corrects this immediately.
                  transform: "translate3d(0,0,0)",
                  opacity: 0,
                }}
                aria-hidden="true"
              >
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* Headline, held over the tiles. The scrim keeps the text legible
            against tile labels at every viewport, especially on mobile.
            It is deliberately wider and denser than a plain text shadow:
            the tiles include near-white product screenshots, and thin white
            type over a white UI panel is unreadable however bold the shadow. */}
        {headline && (
          <div className="pointer-events-none absolute inset-0 grid place-items-center px-6">
            <div className="relative isolate max-w-4xl">
              <div
                aria-hidden="true"
                className="absolute -inset-x-24 -inset-y-16 -z-10 rounded-[4rem]"
                style={{
                  background:
                    "radial-gradient(ellipse at center, rgba(8,10,12,0.97) 0%, rgba(8,10,12,0.94) 34%, rgba(8,10,12,0.72) 58%, rgba(8,10,12,0) 82%)",
                }}
              />
              <div
                ref={headlineRef}
                className="text-center text-[clamp(1.75rem,6vw,4.5rem)] leading-[1.06] font-semibold tracking-[-0.04em]"
                style={{ textShadow: "0 2px 24px rgba(8,10,12,0.85)" }}
              >
                {headline}
              </div>
            </div>
          </div>
        )}

        {/* Revealed content */}
        <div
          ref={contentRef}
          className="absolute inset-0 grid place-items-center px-6"
          style={{ opacity: 0, willChange: "transform, opacity" }}
        >
          <div className="w-full max-w-3xl">{children}</div>
        </div>
      </div>
    </div>
  );
}

export default TileReveal;
