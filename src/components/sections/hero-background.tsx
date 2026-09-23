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
  const [wide, setWide] = useState(false);
  const [finePointer, setFinePointer] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [inView, setInView] = useState(false);

  /**
   * Decide once whether the aurora layer is appropriate for this device.
   *
   * Reduced motion used to switch the aurora off entirely. That is the wrong
   * trade: the visitor asked for less movement, not for a different page, and
   * on a machine with "reduce motion" enabled the hero simply looked like the
   * aurora was broken. It is now rendered in a still form instead — speed 0 and
   * no mouse interaction — so the hero looks the same everywhere and only the
   * motion is removed.
   */
  useEffect(() => {
    const mqReduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mqWide = window.matchMedia("(min-width: 768px)");
    const mqPointer = window.matchMedia("(hover: hover) and (pointer: fine)");

    const evaluate = () => {
      setReduced(mqReduce.matches);
      setWide(mqWide.matches);
      setFinePointer(mqPointer.matches);
    };

    evaluate();
    mqReduce.addEventListener("change", evaluate);
    mqWide.addEventListener("change", evaluate);
    mqPointer.addEventListener("change", evaluate);
    return () => {
      mqReduce.removeEventListener("change", evaluate);
      mqWide.removeEventListener("change", evaluate);
      mqPointer.removeEventListener("change", evaluate);
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
          className="absolute inset-x-0 top-0 h-[82%] opacity-[0.42]"
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
              // A still aurora when the visitor asked for reduced motion: same
              // shape and colour, no drift, no mouse response.
              speed={reduced ? 0 : 0.3}
              scale={1.5}
              brightness={0.68}
              noiseFrequency={2.1}
              noiseAmplitude={0.95}
              bandHeight={0.46}
              bandSpread={1.25}
              octaveDecay={0.12}
              layerOffset={0.35}
              colorSpeed={reduced ? 0 : 0.55}
              enableMouseInteraction={!reduced}
              mouseInfluence={0.16}
            />
          </div>

          {/* Second band: smaller scale, quicker, violet-leaning, and slightly
              transparent so the two overlap instead of stacking opaquely. */}
          <div className="absolute inset-0 opacity-60">
            <SoftAurora
              color1="#4fd1e8"
              color2="#9b8cff"
              speed={reduced ? 0 : 0.46}
              scale={2.35}
              brightness={0.6}
              noiseFrequency={2.9}
              noiseAmplitude={1.1}
              bandHeight={0.3}
              bandSpread={0.85}
              octaveDecay={0.16}
              layerOffset={0.7}
              colorSpeed={reduced ? 0 : 0.85}
              enableMouseInteraction={false}
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
