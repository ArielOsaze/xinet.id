"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * Constellation — Crux, the Southern Cross.
 *
 * Why this is hand-built rather than taken from ReactBits: ReactBits ships
 * generic particle and dot fields, none of which draw a *specific*
 * constellation. Crux is the right subject for Xinet for two reasons — its two
 * axes cross as an X, the Xinet mark, and it is the one constellation that is
 * unmistakable from Indonesia's latitude, where the company is based.
 *
 * The five stars sit at their real positions: J2000 equatorial coordinates
 * projected onto a local plane centred on the constellation, with the cos(dec)
 * foreshortening applied, so the shape is astronomically correct rather than
 * eyeballed. Size, brightness AND colour follow the real stars, so Acrux
 * dominates, Gacrux glows warm (it is a red giant), and Ginan is barely there —
 * exactly as in the sky.
 *
 * Motion follows the reference supplied (OpenAI's GPT-6 Astra hero):
 *   1. stars drift in from scattered offsets and settle into place,
 *   2. a slow shimmer runs through the field, each star on its own phase,
 *   3. dust motes and a static field of background stars fill the frame,
 *   4. the connecting lines fade in only after the stars have settled.
 *
 * Performance: 2D canvas, zero dependencies, devicePixelRatio capped at 2, the
 * loop paused whenever the element is off-screen or the tab is hidden, and a
 * single static frame under `prefers-reduced-motion`.
 */

type Star = {
  /** Normalised east-positive offset from the constellation centre. */
  x: number;
  /** Normalised north-positive offset from the constellation centre. */
  y: number;
  /** Apparent visual magnitude — drives size and brightness. */
  mag: number;
  /** Core colour, from the star's real B–V colour index. */
  color: [number, number, number];
  /** Halo colour, kept cooler than the core so the glow reads as scattered light. */
  halo: [number, number, number];
};

/**
 * The five principal stars of Crux, from J2000 RA/Dec (hours, degrees):
 *   Acrux  α  12h26m35.9s  −63°05′56.7″   mag 0.77   B0.5 IV  (blue-white)
 *   Mimosa β  12h47m43.3s  −59°41′19.5″   mag 1.25   B0.5 III (blue-white)
 *   Gacrux γ  12h31m09.9s  −57°06′47.6″   mag 1.64   M3.5 III (red giant)
 *   Imai   δ  12h15m08.7s  −58°44′56.1″   mag 2.79   B2 IV    (blue-white)
 *   Ginan  ε  12h21m21.6s  −60°24′04.1″   mag 3.59   K3 III   (orange)
 */
const STARS: Star[] = [
  { x: -0.0688, y: -1.0, mag: 0.77, color: [216, 234, 255], halo: [118, 186, 255] }, // Acrux
  { x: 0.7386, y: 0.0369, mag: 1.25, color: [210, 228, 255], halo: [114, 180, 255] }, // Mimosa
  { x: 0.1058, y: 0.82, mag: 1.64, color: [255, 214, 172], halo: [255, 150, 82] }, // Gacrux
  { x: -0.5066, y: 0.3227, mag: 2.79, color: [208, 224, 255], halo: [122, 176, 255] }, // Imai
  { x: -0.269, y: -0.1797, mag: 3.59, color: [238, 228, 250], halo: [170, 168, 255] }, // Ginan
];

/** The two axes of the cross: Acrux–Gacrux (long) and Mimosa–Imai (short). */
const AXES: [number, number][] = [
  [0, 2],
  [1, 3],
];

/** 45° of tilt, so the cross reads as an X rather than a plus. */
const TILT = Math.PI / 4;

/** Relative flux against the brightest member, from the magnitude scale. */
function flux(mag: number): number {
  return Math.pow(10, -0.4 * (mag - 0.77));
}

const rgba = (c: [number, number, number], a: number) =>
  `rgba(${c[0]}, ${c[1]}, ${c[2]}, ${a})`;

type Mote = {
  x: number;
  y: number;
  r: number;
  vx: number;
  vy: number;
  phase: number;
  speed: number;
  warm: boolean;
};

/** Static background stars: fixed positions, only the twinkle phase varies. */
type FieldStar = { x: number; y: number; r: number; a: number; phase: number };

export function Constellation({ className }: { className?: string }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const reduceMq = window.matchMedia("(prefers-reduced-motion: reduce)");

    let w = 0;
    let h = 0;
    let raf = 0;
    let onScreen = true;
    let tabVisible = true;
    const started = performance.now();

    // Pointer parallax: eased toward the target each frame.
    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };

    let motes: Mote[] = [];
    let field: FieldStar[] = [];

    /** Deterministic pseudo-random, so the sky is stable across resizes. */
    const rand = (i: number, salt: number) => {
      const v = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453;
      return v - Math.floor(v);
    };

    const seed = () => {
      motes = Array.from({ length: 52 }, (_, i) => {
        const r1 = rand(i, 1);
        const r2 = rand(i, 2);
        const r3 = rand(i, 3);
        return {
          x: r1,
          y: r2,
          r: 0.5 + r3 * 1.2,
          vx: (r2 - 0.5) * 0.03,
          vy: (r1 - 0.5) * 0.03,
          phase: r3 * Math.PI * 2,
          speed: 0.4 + r1 * 0.9,
          warm: r3 > 0.78,
        };
      });

      // Field stars: fixed positions, only their twinkle phase varies. 260 of
      // them across three brightness tiers, because a uniform field reads as
      // noise — a real sky is dominated by faint stars with a few brighter ones.
      field = Array.from({ length: 260 }, (_, i) => {
        const tier = rand(i, 16);
        const bright = tier > 0.94 ? 1 : tier > 0.72 ? 0.62 : 0.34;
        return {
          x: rand(i, 11),
          y: rand(i, 12),
          r: (0.3 + rand(i, 13) * 1.05) * bright,
          a: (0.14 + rand(i, 14) * 0.55) * (0.5 + bright * 0.75),
          phase: rand(i, 15) * Math.PI * 2,
        };
      });
    };

    const resize = () => {
      const rect = host.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = rect.width;
      h = rect.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
    const clamp01 = (t: number) => (t < 0 ? 0 : t > 1 ? 1 : t);

    const draw = (now: number) => {
      const time = (now - started) / 1000;
      const still = reduceMq.matches;

      ctx.clearRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h / 2;
      // Leaves ~12% margin, which is where the outer glows live.
      const scale = Math.min(w, h) * 0.38;

      pointer.x += (pointer.tx - pointer.x) * 0.05;
      pointer.y += (pointer.ty - pointer.y) * 0.05;

      const cos = Math.cos(TILT);
      const sin = Math.sin(TILT);

      const project = (sx: number, sy: number) => {
        const rx = sx * cos - sy * sin;
        const ry = sx * sin + sy * cos;
        return {
          x: cx + rx * scale + pointer.x,
          y: cy - ry * scale + pointer.y,
        };
      };

      // --- nebula wash ----------------------------------------------------
      // Two soft radial clouds in the brand palette, offset from centre so the
      // field has depth instead of reading as a flat black rectangle. Opacity is
      // deliberately low per layer but stacked, because a single stronger pass
      // reads as a coloured blob rather than as haze.
      const drift = still ? 0 : Math.sin(time * 0.12) * 6;
      const neb = ctx.createRadialGradient(
        cx - scale * 0.55 + drift,
        cy - scale * 0.4,
        0,
        cx - scale * 0.55 + drift,
        cy - scale * 0.4,
        scale * 1.7
      );
      neb.addColorStop(0, "rgba(34, 199, 232, 0.11)");
      neb.addColorStop(0.35, "rgba(34, 199, 232, 0.045)");
      neb.addColorStop(0.7, "rgba(34, 199, 232, 0.012)");
      neb.addColorStop(1, "rgba(34, 199, 232, 0)");
      ctx.fillStyle = neb;
      ctx.fillRect(0, 0, w, h);

      const neb2 = ctx.createRadialGradient(
        cx + scale * 0.65 - drift,
        cy + scale * 0.55,
        0,
        cx + scale * 0.65 - drift,
        cy + scale * 0.55,
        scale * 1.45
      );
      neb2.addColorStop(0, "rgba(126, 152, 255, 0.075)");
      neb2.addColorStop(0.5, "rgba(126, 152, 255, 0.022)");
      neb2.addColorStop(1, "rgba(126, 152, 255, 0)");
      ctx.fillStyle = neb2;
      ctx.fillRect(0, 0, w, h);

      // A third, tighter core glow sitting right behind the cross, so the stars
      // read as embedded in the haze rather than pasted on top of it.
      const coreGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, scale * 0.95);
      coreGlow.addColorStop(0, "rgba(34, 199, 232, 0.085)");
      coreGlow.addColorStop(0.55, "rgba(34, 199, 232, 0.025)");
      coreGlow.addColorStop(1, "rgba(34, 199, 232, 0)");
      ctx.fillStyle = coreGlow;
      ctx.fillRect(0, 0, w, h);

      // --- background field stars ----------------------------------------
      for (const s of field) {
        const tw = still ? 1 : 0.55 + 0.45 * Math.sin(time * 0.7 + s.phase);
        ctx.fillStyle = `rgba(226, 238, 248, ${s.a * tw})`;
        ctx.beginPath();
        ctx.arc(
          s.x * w + pointer.x * 0.35,
          s.y * h + pointer.y * 0.35,
          s.r,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }

      // --- drifting motes -------------------------------------------------
      for (const m of motes) {
        if (!still) {
          m.x += m.vx * 0.0018;
          m.y += m.vy * 0.0018;
          if (m.x < -0.05) m.x = 1.05;
          if (m.x > 1.05) m.x = -0.05;
          if (m.y < -0.05) m.y = 1.05;
          if (m.y > 1.05) m.y = -0.05;
        }
        const twinkle = still ? 0.55 : 0.5 + 0.5 * Math.sin(time * m.speed + m.phase);
        ctx.globalAlpha = 0.06 + twinkle * 0.18;
        ctx.fillStyle = m.warm ? "#ffe6c8" : "#cfe6ef";
        ctx.beginPath();
        ctx.arc(
          m.x * w + pointer.x * 0.6,
          m.y * h + pointer.y * 0.6,
          m.r,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // --- connecting lines ------------------------------------------------
      // A gradient along each axis: brightest at the two stars, fading through
      // the middle, so the cross reads as light travelling between them rather
      // than as a wireframe.
      const lineProgress = still ? 1 : easeOut(clamp01((time - 1.4) / 1.5));
      if (lineProgress > 0) {
        ctx.lineWidth = 1;
        ctx.globalAlpha = lineProgress * 0.9;
        for (const [a, b] of AXES) {
          const p1 = project(STARS[a].x, STARS[a].y);
          const p2 = project(STARS[b].x, STARS[b].y);
          const grad = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
          grad.addColorStop(0, rgba(STARS[a].halo, 0.5));
          grad.addColorStop(0.5, "rgba(34, 199, 232, 0.16)");
          grad.addColorStop(1, rgba(STARS[b].halo, 0.5));
          ctx.strokeStyle = grad;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
      }

      // --- the five stars --------------------------------------------------
      STARS.forEach((s, i) => {
        const final = project(s.x, s.y);

        // Staggered fly-in from a scattered starting point.
        const p = still ? 1 : easeOut(clamp01((time - i * 0.16) / 1.6));
        const fromX = cx + Math.cos(i * 2.4) * scale * 2.6;
        const fromY = cy + Math.sin(i * 2.4) * scale * 2.6;
        const x = fromX + (final.x - fromX) * p;
        const y = fromY + (final.y - fromY) * p;

        const f = flux(s.mag);
        const coreRadius = 1.1 + f * 2.6;
        const glowRadius = (9 + f * 34) * (0.55 + 0.45 * p);

        // Shimmer: slow, shallow, each star on its own phase.
        const shimmer = still ? 1 : 0.82 + 0.18 * Math.sin(time * 0.9 + i * 1.7);
        const a = p * shimmer;

        // Outer halo, in the star's own scattered-light colour.
        const glow = ctx.createRadialGradient(x, y, 0, x, y, glowRadius);
        glow.addColorStop(0, rgba(s.color, 0.5 * a));
        glow.addColorStop(0.28, rgba(s.halo, 0.2 * a));
        glow.addColorStop(0.6, rgba(s.halo, 0.06 * a));
        glow.addColorStop(1, rgba(s.halo, 0));
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(x, y, glowRadius, 0, Math.PI * 2);
        ctx.fill();

        // Diffraction spikes on the two brightest stars only — the four-point
        // flare a bright star shows in a photograph. Drawing it on all five
        // would read as sparkle clip-art rather than as a night sky.
        if (f > 0.55) {
          const spike = glowRadius * 1.45;
          ctx.strokeStyle = rgba(s.color, 0.3 * a * f);
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(x - spike, y);
          ctx.lineTo(x + spike, y);
          ctx.moveTo(x, y - spike);
          ctx.lineTo(x, y + spike);
          ctx.stroke();
        }

        // Core: a small saturated disc so the colour reads (a pure-white core
        // would hide Gacrux's warmth), with a tight white point inside it.
        ctx.fillStyle = rgba(s.color, 0.85 * a);
        ctx.beginPath();
        ctx.arc(x, y, coreRadius * 1.7, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = `rgba(255, 255, 255, ${a})`;
        ctx.beginPath();
        ctx.arc(x, y, coreRadius * 0.72, 0, Math.PI * 2);
        ctx.fill();
      });

      if (!still && onScreen && tabVisible) {
        raf = requestAnimationFrame(draw);
      }
    };

    const restart = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(draw);
    };

    resize();
    seed();
    restart();

    const ro = new ResizeObserver(() => {
      resize();
      if (reduceMq.matches) restart();
    });
    ro.observe(host);

    const io = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting;
        if (onScreen && tabVisible) restart();
        else cancelAnimationFrame(raf);
      },
      { threshold: 0 }
    );
    io.observe(host);

    const onVisibility = () => {
      tabVisible = !document.hidden;
      if (tabVisible && onScreen) restart();
      else cancelAnimationFrame(raf);
    };
    document.addEventListener("visibilitychange", onVisibility);

    // Parallax is driven from the window so it still tracks while the pointer
    // is over the hero copy, which sits above this layer.
    const onPointerMove = (e: PointerEvent) => {
      const r = host.getBoundingClientRect();
      if (!r.width || !r.height) return;
      const dx = (e.clientX - (r.left + r.width / 2)) / r.width;
      const dy = (e.clientY - (r.top + r.height / 2)) / r.height;
      pointer.tx = Math.max(-1, Math.min(1, dx)) * -12;
      pointer.ty = Math.max(-1, Math.min(1, dy)) * -12;
    };
    window.addEventListener("pointermove", onPointerMove, { passive: true });

    const onReduceChange = () => restart();
    reduceMq.addEventListener("change", onReduceChange);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pointermove", onPointerMove);
      reduceMq.removeEventListener("change", onReduceChange);
    };
  }, []);

  return (
    <div ref={hostRef} className={cn("relative", className)} aria-hidden="true">
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  );
}
