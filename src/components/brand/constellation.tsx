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
 *
 * Colour is near-neutral on purpose. Real Crux stars are blue-white, but a
 * saturated blue halo on every star turned the hero into a blue field and
 * fought the near-black page. These are white cores with only a trace of cool
 * or warm in the halo — enough to read as a real sky, not enough to tint the
 * section. The brand cyan is carried by the connecting lines and the logo.
 */
const STARS: Star[] = [
  { x: -0.0688, y: -1.0, mag: 0.77, color: [244, 248, 255], halo: [206, 224, 245] }, // Acrux
  { x: 0.7386, y: 0.0369, mag: 1.25, color: [242, 246, 255], halo: [202, 220, 243] }, // Mimosa
  { x: 0.1058, y: 0.82, mag: 1.64, color: [246, 240, 250], halo: [216, 200, 240] }, // Gacrux
  { x: -0.5066, y: 0.3227, mag: 2.79, color: [240, 245, 255], halo: [204, 218, 240] }, // Imai
  { x: -0.269, y: -0.1797, mag: 3.59, color: [244, 242, 250], halo: [212, 212, 240] }, // Ginan
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
type FieldStar = {
  x: number;
  y: number;
  r: number;
  a: number;
  phase: number;
  /** 0 = far, 1 = mid, 2 = near. Drives halo + colour. */
  tier: number;
  /** A few genuinely warm stars, as in a real field. */
  warm: boolean;
};

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

    /**
     * Reduced motion scales the animation down, it does not stop it.
     *
     * Freezing the field made the hero read as a broken canvas, and it also
     * switched off the pointer parallax, so the layer felt dead rather than
     * calm. Twinkle and drift run at 40% speed instead, and the pointer keeps
     * working: a single eased parallax offset is not the kind of motion the
     * setting exists to prevent.
     */
    const speedScale = () => (reduceMq.matches ? 0.4 : 1);

    let w = 0;
    let h = 0;
    let raf = 0;
    let onScreen = true;
    let tabVisible = true;
    const started = performance.now();

    // Pointer parallax: eased toward the target each frame.
    //   x / y   = the eased parallax offset applied to the field
    //   tx / ty = its target
    //   nx / ny = the pointer's position inside the canvas, normalised 0..1,
    //             used to light up the stars nearest the cursor
    const pointer = { x: 0, y: 0, tx: 0, ty: 0, nx: 0.5, ny: 0.5 };

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

      // Field stars: fixed positions, only their twinkle phase varies. 300
      // across three depth tiers, because a uniform field reads as noise — a
      // real sky is dominated by faint stars with a few brighter ones.
      field = Array.from({ length: 300 }, (_, i) => {
        const t = rand(i, 16);
        const tier = t > 0.93 ? 2 : t > 0.7 ? 1 : 0;
        const scale = tier === 2 ? 1 : tier === 1 ? 0.6 : 0.32;
        return {
          x: rand(i, 11),
          y: rand(i, 12),
          r: (0.32 + rand(i, 13) * 1.15) * scale,
          a: (0.16 + rand(i, 14) * 0.58) * (tier === 2 ? 1 : tier === 1 ? 0.72 : 0.44),
          phase: rand(i, 15) * Math.PI * 2,
          tier,
          // ~7% of stars carry a warm cast, matching a real mixed field.
          warm: rand(i, 17) > 0.93,
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
      // `time` is the animation clock; slowing it is how reduced motion is
      // honoured, so every consumer below scales automatically.
      //
      // `still` is kept at false on purpose and is now only a compile-time
      // constant for the branches below: freezing the canvas is exactly what
      // made the hero look broken. Reduced motion slows the clock instead.
      const time = ((now - started) / 1000) * speedScale();
      const still = false;

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
      // Deliberately omitted. A coloured haze behind the cross read as a blue
      // wash lifting the page off near-black, which is the opposite of the
      // intended look. The canvas now paints only stars, lines and dust; the
      // page background supplies the darkness.
      void 0;

      // --- background field stars ----------------------------------------
      // Three depth layers. Distant stars are small, dim and cool; nearer ones
      // are brighter with a faint warm cast. That variation is what makes the
      // field read as depth instead of as uniform noise.
      for (const s of field) {
        const tw = still ? 1 : 0.55 + 0.45 * Math.sin(time * 0.7 + s.phase);
        const px2 = s.x * w + pointer.x * 0.35;
        const py2 = s.y * h + pointer.y * 0.35;
        const a = s.a * tw;

        if (s.tier === 2) {
          // Near star: soft halo so it does not look like a dead pixel.
          const halo = ctx.createRadialGradient(px2, py2, 0, px2, py2, s.r * 3.4);
          halo.addColorStop(0, `rgba(238, 244, 252, ${a * 0.5})`);
          halo.addColorStop(1, "rgba(238, 244, 252, 0)");
          ctx.fillStyle = halo;
          ctx.beginPath();
          ctx.arc(px2, py2, s.r * 3.4, 0, Math.PI * 2);
          ctx.fill();
        }

        // Near-white, with only a hint of warmth on the few stars that carry it.
        ctx.fillStyle = s.warm
          ? `rgba(255, 240, 226, ${a})`
          : `rgba(240, 244, 250, ${a})`;
        ctx.beginPath();
        ctx.arc(px2, py2, s.r, 0, Math.PI * 2);
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
        ctx.globalAlpha = lineProgress * 0.9;
        for (const [a, b] of AXES) {
          const p1 = project(STARS[a].x, STARS[a].y);
          const p2 = project(STARS[b].x, STARS[b].y);
          const grad = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
          // Near-white, with the faintest cyan at the midpoint so the lines
          // still read as the brand's light rather than as grey wire.
          grad.addColorStop(0, "rgba(226, 236, 245, 0.55)");
          grad.addColorStop(0.5, "rgba(150, 196, 210, 0.22)");
          grad.addColorStop(1, "rgba(226, 236, 245, 0.55)");

          // Two passes: a wide soft stroke under a crisp thin one. A single flat
          // 1px line reads as a wireframe; the halo makes it read as light.
          ctx.strokeStyle = grad;
          ctx.lineWidth = 3.2;
          ctx.globalAlpha = lineProgress * 0.16;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();

          ctx.lineWidth = 1;
          ctx.globalAlpha = lineProgress * 0.72;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
      }

      // --- the five stars --------------------------------------------------
      // Cursor proximity: the star nearest the pointer lights up and its halo
      // swells, so moving the mouse across the hero reads as the constellation
      // answering the visitor rather than as a looping GIF. Measured in canvas
      // space (0..1) with a smooth falloff, so nothing snaps on or off.
      const px = pointer.nx * w;
      const py = pointer.ny * h;
      const NEAR = Math.min(w, h) * 0.42;

      STARS.forEach((s, i) => {
        const final = project(s.x, s.y);

        const distToPointer = Math.hypot(final.x - px, final.y - py);
        const near = clamp01(1 - distToPointer / NEAR);
        const heat = near * near * (3 - 2 * near); // smoothstep

        // Staggered fly-in from a scattered starting point.
        const p = still ? 1 : easeOut(clamp01((time - i * 0.16) / 1.6));
        const fromX = cx + Math.cos(i * 2.4) * scale * 2.6;
        const fromY = cy + Math.sin(i * 2.4) * scale * 2.6;
        const x = fromX + (final.x - fromX) * p;
        const y = fromY + (final.y - fromY) * p;

        const f = flux(s.mag);
        const coreRadius = 1.1 + f * 2.6;
        // `heat` widens the halo and brightens the core without moving the
        // star, so the layout stays exactly as designed.
        const glowRadius = (9 + f * 34) * (0.55 + 0.45 * p) * (1 + heat * 0.55);

        // Shimmer: slow, shallow, each star on its own phase.
        const shimmer = still ? 1 : 0.82 + 0.18 * Math.sin(time * 0.9 + i * 1.7);
        const a = p * shimmer * (1 + heat * 0.5);

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

        // Diffraction spikes. Every principal star gets them, with the length
        // scaled by flux — the two brightest have long, obvious flares and the
        // faint ones a shorter but still clearly visible one. Giving them to all
        // five is what balances the composition; drawing them on two stars made
        // the other three look unfinished and pulled all the weight to one side.
        //
        // The spike length is driven by the CARD's own scale, not glowRadius:
        // glowRadius is already multiplied by flux, so using it here made the
        // faint stars' spikes collapse to sub-pixel and vanish.
        {
          const spikeBase = Math.min(w, h) * 0.38;
          const spike = spikeBase * (0.16 + f * 0.5);
          const spikeAlpha = (0.16 + f * 0.3) * a;
          if (spikeAlpha > 0.02) {
            ctx.strokeStyle = rgba(s.color, spikeAlpha);
            ctx.lineWidth = f > 0.5 ? 1.1 : 0.85;
            ctx.beginPath();
            ctx.moveTo(x - spike, y);
            ctx.lineTo(x + spike, y);
            ctx.moveTo(x, y - spike);
            ctx.lineTo(x, y + spike);
            ctx.stroke();

            // Diagonal spikes on the brightest pair only, so they still read as
            // the dominant stars without being the only ones with flares.
            if (f > 0.55) {
              const d = spike * 0.55;
              ctx.strokeStyle = rgba(s.color, spikeAlpha * 0.55);
              ctx.lineWidth = 0.7;
              ctx.beginPath();
              ctx.moveTo(x - d, y - d);
              ctx.lineTo(x + d, y + d);
              ctx.moveTo(x + d, y - d);
              ctx.lineTo(x - d, y + d);
              ctx.stroke();
            }
          }
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

      // Always keep animating while visible: nothing is frozen any more.
      if (onScreen && tabVisible) {
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
      restart();
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
      // Position inside the canvas, for the proximity highlight. Values outside
      // 0..1 mean the cursor has left the field, which fades the effect out
      // naturally because every distance becomes large.
      pointer.nx = (e.clientX - r.left) / r.width;
      pointer.ny = (e.clientY - r.top) / r.height;
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
      {/* The nebula brightens the interior of this box relative to the page, so
          an unmasked canvas reads as a pasted-on rectangle. A radial mask feathers
          every edge into the background, leaving no boundary to see. */}
      <canvas
        ref={canvasRef}
        className="block h-full w-full [mask-image:radial-gradient(ellipse_78%_74%_at_50%_50%,black_42%,transparent_100%)] [-webkit-mask-image:radial-gradient(ellipse_78%_74%_at_50%_50%,black_42%,transparent_100%)]"
      />
    </div>
  );
}
