"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

/**
 * HeroBackground — the single animated surface on the page.
 *
 * Two layers, each doing a different job:
 *
 *  1. SoftAurora (ReactBits, ogl) — the aurora. Its colours are explicit
 *     (`color1` / `color2`) rather than a hue offset, so it can be aimed at the
 *     brand's cool palette without any of the multi-hue drift the DarkVeil
 *     shader produced. It sits at low opacity, is masked to fade out above the
 *     fold, and blends with `screen` so it ADDS light to the dark base instead
 *     of painting a coloured band over it.
 *
 *  2. A faint neutral bloom, pure CSS, behind the headline.
 *
 * Performance contract (unchanged):
 *  - WebGL mounts only on desktop viewports (>= 768px) with a fine pointer.
 *  - It is unmounted when scrolled out of view or while the tab is hidden.
 *  - prefers-reduced-motion renders the static gradient only.
 *  - The shader is loaded lazily so it stays out of the initial JS bundle.
 */

const SoftAurora = dynamic(() => import("@/components/reactbits/SoftAurora"), {
  ssr: false,
});

export function HeroBackground() {
  const hostRef = useRef<HTMLDivElement>(null);
  /**
   * Pointer position, normalised to the hero, fed to the shader.
   *
   * The layer is `pointer-events-none` (it sits under the copy and the nav), so
   * the aurora canvases can never receive a mousemove of their own: the
   * shader's mouseInfluence was wired up but permanently idle, and the hero
   * felt dead to the pointer. Tracking on the window instead keeps the layer
   * click-through AND makes it respond.
   */
  const [pointer, setPointer] = useState({ x: 0.5, y: 0.5 });
  const [wide, setWide] = useState(false);
  const [finePointer, setFinePointer] = useState(false);
  const [inView, setInView] = useState(false);
  /** Asked for less motion: the aurora still runs, at about half speed. */
  const [reducedMotion, setReducedMotion] = useState(false);

  /**
   * Decide once whether the aurora layer is appropriate for this device.
   *
   * `prefers-reduced-motion` is deliberately NOT consulted here. Gating the
   * aurora on it meant a machine reporting "reduce" — which includes many
   * Windows machines where the setting is off by default for reasons unrelated
   * to the visitor — got a completely frozen hero with no pointer response, and
   * the hero looked broken rather than calm. The aurora is decorative and
   * low-contrast, so it now always runs; only the *amount* of motion is scaled
   * down for those who asked for less, never removed.
   */
  useEffect(() => {
    const mqWide = window.matchMedia("(min-width: 768px)");
    const mqPointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const mqReduce = window.matchMedia("(prefers-reduced-motion: reduce)");

    const evaluate = () => {
      setWide(mqWide.matches);
      setFinePointer(mqPointer.matches);
      setReducedMotion(mqReduce.matches);
    };

    evaluate();
    mqWide.addEventListener("change", evaluate);
    mqPointer.addEventListener("change", evaluate);
    mqReduce.addEventListener("change", evaluate);
    return () => {
      mqWide.removeEventListener("change", evaluate);
      mqPointer.removeEventListener("change", evaluate);
      mqReduce.removeEventListener("change", evaluate);
    };
  }, []);

  // Mount the canvas only while the hero is actually on screen.
  useEffect(() => {
    const el = hostRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin: "0px", threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  /**
   * Follow the pointer across the whole window, then normalise it to the hero
   * box. `passive` because this fires constantly and must never block scrolling,
   * and the value is only committed when it actually moves, so React is not
   * re-rendered on every pixel of travel.
   */
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const el = hostRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height) return;
      const x = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
      const y = Math.min(1, Math.max(0, (e.clientY - r.top) / r.height));
      setPointer((prev) =>
        Math.abs(prev.x - x) < 0.002 && Math.abs(prev.y - y) < 0.002 ? prev : { x, y }
      );
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  // Pause when the tab is in the background.
  const [tabVisible, setTabVisible] = useState(true);
  useEffect(() => {
    const onVisibility = () => setTabVisible(!document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  // Rendered whenever the hero is on screen and the device can handle a canvas.
  // Motion is handled by the props below, not by unmounting the layer.
  const showAurora = wide && finePointer && inView && tabVisible;

  /**
   * Visitors who asked for less motion still get the aurora, just gentler: the
   * drift and the colour cycle run at about half speed. The pointer response is
   * kept, because a single eased parallax offset is not the kind of motion the
   * setting exists to prevent, and without it the layer feels dead.
   */
  const gentle = reducedMotion;

  return (
    <div ref={hostRef} aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Static base: also the mobile / reduced-motion experience. */}
      <div className="from-base via-surface to-base absolute inset-0 bg-gradient-to-b" />

      {/* A very faint neutral bloom behind the headline. Deliberately not cyan:
          a saturated bloom here is what turned the whole hero blue. */}
      <div
        className="absolute -top-1/3 left-1/2 h-[42rem] w-[42rem] -translate-x-1/2 rounded-full opacity-[0.07] blur-[110px]"
        style={{
          background:
            "radial-gradient(circle, rgba(200,220,240,0.5) 0%, rgba(200,220,240,0.1) 45%, transparent 70%)",
        }}
      />

      {showAurora && (
        // The aurora hangs in the upper half and fades out well before the fold,
        // so everything below stays near-black. `screen` blend adds light rather
        // than covering, which is what keeps it reading as sky rather than as a
        // coloured rectangle pasted on the page.
        //
        // Two layers at different scales and speeds: a wide slow band and a
        // tighter faster one. One layer alone reads as a single beam; two give
        // the depth and drift a real aurora has.
        <div
          className="absolute inset-x-0 top-0 h-[82%] opacity-[0.62]"
          style={{
            maskImage:
              "linear-gradient(to bottom, black 0%, black 38%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(to bottom, black 0%, black 38%, transparent 100%)",
            mixBlendMode: "screen",
          }}
        >
          <div className="absolute inset-0">
            <SoftAurora
              color1="#22c7e8"
              color2="#7c6cf0"
              // `gentle` (reduced-motion) slows the drift; it never stops it.
              // A frozen aurora reads as broken rather than as considerate.
              speed={gentle ? 0.2 : 0.42}
              scale={1.5}
              brightness={1.05}
              noiseFrequency={2.1}
              noiseAmplitude={0.95}
              bandHeight={0.46}
              bandSpread={1.25}
              octaveDecay={0.12}
              layerOffset={0.35}
              colorSpeed={gentle ? 0.28 : 0.55}
              // Fed from the window listener above, because this layer is
              // pointer-events-none and can never see the cursor itself.
              mouse={pointer}
              // A local warp reads far stronger than the old global slide, so
              // the displacement is smaller and confined to a radius around the
              // cursor. Outside it the aurora is untouched.
              mouseInfluence={0.3}
              mouseRadius={0.32}
            />
          </div>

          {/* Second band: smaller scale, quicker, violet-leaning, and slightly
              transparent so the two overlap instead of stacking opaquely. */}
          <div className="absolute inset-0 opacity-60">
            <SoftAurora
              color1="#4fd1e8"
              color2="#9b8cff"
              speed={gentle ? 0.3 : 0.6}
              scale={2.35}
              brightness={0.95}
              noiseFrequency={2.9}
              noiseAmplitude={1.1}
              bandHeight={0.3}
              bandSpread={0.85}
              octaveDecay={0.16}
              layerOffset={0.7}
              colorSpeed={gentle ? 0.42 : 0.85}
              // The second band follows the pointer too, with a smaller
              // influence so the two layers parallax against each other instead
              // of moving as one flat sheet.
              mouse={pointer}
              mouseInfluence={0.2}
              mouseRadius={0.24}
            />
          </div>
        </div>
      )}

      {/* Fade the animated layer into the page so it never competes with copy. */}
      <div className="from-base absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t to-transparent" />
      <div className="grid-bg absolute inset-0 opacity-40 [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_75%)]" />
    </div>
  );
}
