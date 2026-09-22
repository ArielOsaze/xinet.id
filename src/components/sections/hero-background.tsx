"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

/**
 * HeroBackground — the single animated surface on the page.
 *
 * Performance contract:
 *  - WebGL is only mounted on desktop viewports (>= 768px) with a fine pointer,
 *    so mobile never pays for it.
 *  - It is unmounted entirely when scrolled out of view, and while the tab is
 *    hidden, so an offscreen canvas never burns GPU time.
 *  - prefers-reduced-motion renders a static gradient instead.
 *  - The shader is loaded lazily so it stays out of the initial JS bundle.
 */

const DarkVeil = dynamic(() => import("@/components/reactbits/DarkVeil"), {
  ssr: false,
});

export function HeroBackground() {
  const hostRef = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);
  const [inView, setInView] = useState(false);

  // Decide once whether the animated layer is appropriate for this device.
  useEffect(() => {
    const mqReduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mqWide = window.matchMedia("(min-width: 768px)");
    const mqPointer = window.matchMedia("(hover: hover) and (pointer: fine)");

    const evaluate = () => {
      setEnabled(!mqReduce.matches && mqWide.matches && mqPointer.matches);
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

  const showCanvas = enabled && inView && tabVisible;

  return (
    <div ref={hostRef} aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Static base: also the mobile / reduced-motion experience. */}
      <div className="from-base via-surface to-base absolute inset-0 bg-gradient-to-b" />

      {/* Restrained cyan bloom behind the headline — pure CSS, cheap, static. */}
      <div
        className="absolute -top-1/3 left-1/2 h-[42rem] w-[42rem] -translate-x-1/2 rounded-full opacity-[0.16] blur-[110px]"
        style={{
          background:
            "radial-gradient(circle, rgba(34,199,232,0.55) 0%, rgba(34,199,232,0.12) 45%, transparent 70%)",
        }}
      />

      {showCanvas && (
        // The shader is a full-bleed veil, so it must not be clipped to a
        // rounded container. `inset-0` + explicit w/h avoids the visible vertical
        // seam the parent-sized canvas produced.
        //
        // Colour: the shader's own `hueShift` ADDS to each pixel's hue rather
        // than setting it, so a warm source pixel plus a shift lands somewhere
        // unpredictable — the field ends up multi-hued and the warm/green
        // patches read as a foreign aurora.
        //
        // CSS `hue-rotate` was not enough: measured on the rendered canvas it
        // still left ~10k green pixels (hue ~140), because the shader's output
        // spans a wide hue range and a single rotation cannot collapse it.
        //
        // `mix-blend-mode: color` is the reliable fix: it takes LIGHTNESS from
        // the shader (so the structure and motion survive) and HUE+SATURATION
        // from the element behind it. The layer below is painted with the brand
        // cyan, so every pixel of the veil is forced into the cyan-blue band no
        // matter what the shader emits.
        <div className="hero-veil absolute inset-0 overflow-hidden">
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(140deg, rgba(34,199,232,0.30) 0%, rgba(96,165,250,0.20) 45%, rgba(167,139,250,0.14) 100%)",
            }}
          />
          <div
            className="absolute inset-0 opacity-[0.5]"
            style={{ mixBlendMode: "color" }}
          >
            <DarkVeil
              hueShift={0}
              noiseIntensity={0}
              scanlineIntensity={0}
              speed={0.22}
              scanlineFrequency={0}
              warpAmount={0.35}
              resolutionScale={0.6}
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
