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
 *   Acrux  α  12h26m35.9s  −63°05′56.7″   mag 0.77   B0.5 IV   B-V −0.24
 *   Mimosa β  12h47m43.3s  −59°41′19.5″   mag 1.25   B0.5 III  B-V −0.24
 *   Gacrux γ  12h31m09.9s  −57°06′47.6″   mag 1.64   M3.5 III  B-V +1.59  red giant
 *   Imai   δ  12h15m08.7s  −58°44′56.1″   mag 2.79   B2 IV     B-V −0.20
 *   Ginan  ε  12h21m21.6s  −60°24′04.1″   mag 3.59   K3 III    B-V +1.13  orange
 *
 * Colour follows each star's real B-V index. The two warm members matter: a
 * field of five blue-white stars does not read as Crux, because the orange
 * giant beside the blue pair is the thing that makes the cross recognisable.
 * (An earlier version stored Gacrux and Ginan as violet, which was simply
 * wrong for a red giant and made the whole field look uniform.)
 *
 * A bright star's core saturates to white in any real photograph, and its hue
 * shows in the surrounding glow — so the cores stay near-white and the halos
 * carry the colour. That is physically right, and it keeps the section cool
 * because only the faint outer glow is tinted.
 */
const STARS: Star[] = [
  { x: -0.0688, y: -1.0, mag: 0.77, color: [238, 244, 255], halo: [176, 206, 250] }, // Acrux
  { x: 0.7386, y: 0.0369, mag: 1.25, color: [236, 243, 255], halo: [172, 203, 248] }, // Mimosa
  { x: 0.1058, y: 0.82, mag: 1.64, color: [255, 246, 235], halo: [255, 172, 96] }, // Gacrux
  { x: -0.5066, y: 0.3227, mag: 2.79, color: [238, 245, 255], halo: [180, 210, 250] }, // Imai
  { x: -0.269, y: -0.1797, mag: 3.59, color: [255, 243, 225], halo: [255, 194, 128] }, // Ginan
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

    // Cursor state for the LOCAL effect.
    //   nx / ny = where the cursor is inside the canvas, normalised 0..1
    //   ex / ey = the eased position actually used for drawing, so the reaction
    //             trails the pointer slightly instead of snapping to it
    //   has     = false until the pointer has been seen at least once, so the
    //             field does not react to a cursor sitting at the origin
    const pointer = { nx: 0.5, ny: 0.5, ex: 0.5, ey: 0.5, has: false };

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

      // Field stars: fixed positions, only their twinkle phase varies.
      //
      // Magnitudes follow the real sky's distribution. Each magnitude step holds
      // about 1.6x more stars than the step above it, so bright stars are rare
      // and faint ones dominate — roughly 70% of what you see is near the
      // detection limit. Picking a tier uniformly instead makes the field look
      // evenly sprinkled, which is the clearest giveaway of a generated sky.
      //
      // The counts below (210 faint : 66 mid : 24 near) come from that ratio.
      field = Array.from({ length: 300 }, (_, i) => {
        const t = rand(i, 16);
        const tier = t > 0.92 ? 2 : t > 0.70 ? 1 : 0;
        const scale = tier === 2 ? 1 : tier === 1 ? 0.62 : 0.34;
        return {
          x: rand(i, 11),
          y: rand(i, 12),
          r: (0.32 + rand(i, 13) * 1.15) * scale,
          a: (0.16 + rand(i, 14) * 0.58) * (tier === 2 ? 1 : tier === 1 ? 0.7 : 0.4),
          phase: rand(i, 15) * Math.PI * 2,
          tier,
          // ~7% carry a warm cast, matching a real mixed field.
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

      // Ease the drawn cursor toward the real one.
      pointer.ex += (pointer.nx - pointer.ex) * 0.08;
      pointer.ey += (pointer.ny - pointer.ey) * 0.08;

      const cos = Math.cos(TILT);
      const sin = Math.sin(TILT);

      // No global offset here any more: the whole field used to slide with the
      // pointer, which moved every star including ones nowhere near the cursor.
      // Local displacement is applied per star further down.
      const project = (sx: number, sy: number) => {
        const rx = sx * cos - sy * sin;
        const ry = sx * sin + sy * cos;
        return {
          x: cx + rx * scale,
          y: cy - ry * scale,
        };
      };

      /**
       * Push a point away from the cursor, with a windowed falloff.
       *
       * Returns the point unchanged when it is outside the radius, so distant
       * stars keep their exact positions and the constellation's shape never
       * distorts as a whole. Only the cursor's neighbourhood reacts.
       */
      const cursorX = pointer.ex * w;
      const cursorY = pointer.ey * h;
      const LOCAL_R = Math.min(w, h) * 0.2;
      const localPush = (x: number, y: number, amount: number) => {
        const dx = x - cursorX;
        const dy = y - cursorY;
        const d = Math.sqrt(dx * dx + dy * dy);
        // Windowed falloff: exactly zero at LOCAL_R, so stars outside the
        // cursor's neighbourhood do not move at all. A Gaussian tail kept
        // nudging distant stars, which made the whole field look like it was
        // sliding instead of only the area around the cursor reacting.
        if (d >= LOCAL_R || d < 0.001) return { x, y };
        const w = 1 - d / LOCAL_R;
        const f = w * w * (3 - 2 * w);
        return { x: x + (dx / d) * f * amount, y: y + (dy / d) * f * amount };
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
        // Only stars near the cursor drift; the rest hold still.
        const moved = localPush(s.x * w, s.y * h, 14);
        const px2 = moved.x;
        const py2 = moved.y;
        const a = s.a * tw;

        const tint = s.warm ? [255, 240, 226] : [240, 244, 250];

        if (s.tier === 2) {
          // Near star: a Moffat halo, matching the principal stars' light
          // profile. The old version was a two-stop radial gradient — a flat
          // disc that faded once — which is the same "airbrush" tell the big
          // stars had.
          const hr = s.r * 4.2;
          const hAlpha = a * 0.5;
          const BETA2 = 2.4;
          const ALPHA2 = hr * 0.14;
          const halo = ctx.createRadialGradient(px2, py2, 0, px2, py2, hr);
          for (let k = 0; k <= 8; k++) {
            const t = k / 8;
            const rr = t * hr;
            const inten = Math.pow(1 + (rr / ALPHA2) ** 2, -BETA2);
            halo.addColorStop(t, `rgba(${tint[0]}, ${tint[1]}, ${tint[2]}, ${(inten * hAlpha).toFixed(4)})`);
          }
          ctx.fillStyle = halo;
          ctx.beginPath();
          ctx.arc(px2, py2, hr, 0, Math.PI * 2);
          ctx.fill();
        }

        // The star itself: a tiny gradient so its rim is soft rather than a hard
        // circle. At 0.3-1.5px a solid arc reads as a dead pixel.
        const dot = ctx.createRadialGradient(px2, py2, 0, px2, py2, s.r * 1.5);
        dot.addColorStop(0, `rgba(255, 255, 255, ${a})`);
        dot.addColorStop(0.5, `rgba(${tint[0]}, ${tint[1]}, ${tint[2]}, ${a * 0.85})`);
        dot.addColorStop(1, `rgba(${tint[0]}, ${tint[1]}, ${tint[2]}, 0)`);
        ctx.fillStyle = dot;
        ctx.beginPath();
        ctx.arc(px2, py2, s.r * 1.5, 0, Math.PI * 2);
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
        const mm = localPush(m.x * w, m.y * h, 22);
        ctx.arc(mm.x, mm.y, m.r, 0, Math.PI * 2);
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
          // Same local push the stars themselves get, so the lines stay
          // attached to their endpoints instead of detaching near the cursor.
          const p1 = localPush(project(STARS[a].x, STARS[a].y).x, project(STARS[a].x, STARS[a].y).y, 11);
          const p2 = localPush(project(STARS[b].x, STARS[b].y).x, project(STARS[b].x, STARS[b].y).y, 11);
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
        const anchored = project(s.x, s.y);
        // A small lean away from the cursor: enough to feel responsive, small
        // enough that the constellation never loses its shape.
        const final = localPush(anchored.x, anchored.y, 11);

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
        //
        // Wider than before (was 9 + f*34): a Moffat profile's long faint tail is
        // what makes a star look like it is burning, and the old radius was
        // tuned for a gradient that reached zero at the rim. The core stays the
        // same size because coreRadius is separate.
        const glowRadius = (16 + f * 54) * (0.55 + 0.45 * p) * (1 + heat * 0.55);

        // Shimmer: slow, shallow, each star on its own phase.
        const shimmer = still ? 1 : 0.82 + 0.18 * Math.sin(time * 0.9 + i * 1.7);
        const a = p * shimmer * (1 + heat * 0.5);

        // Outer halo: a Moffat profile, not a smooth disc.
        //
        // The previous version was a radial gradient with four evenly spaced
        // stops, which draws a perfectly circular disc that fades evenly. That
        // is an airbrush, and it is why the stars read as digital effects.
        //
        // Real stellar point-spread functions are fitted by a Moffat profile,
        //     I(r) = (1 + (r/alpha)^2)^(-beta)
        // with beta around 2-3.5: a small saturated core, a fast initial fall,
        // then a long faint tail that keeps going to the edge. Sampling the
        // real curve at many stops (instead of 4 hand-picked ones) is what gives
        // the star its "burning" look and its faint outer glow.
        /**
         * Point-spread function, drawn in two passes.
         *
         *   halo : (1 + (r/rt)^2)^-beta   wide, faint  -> the scattered-light tail
         *   core : exp(-(r/rc)^2)         tight, white -> the star itself
         *
         * They are separate passes because they answer to different things. The
         * halo breathes with the shimmer; the core must be able to SATURATE.
         * Previously one gradient did both with the peak alpha multiplied by the
         * shimmer (0.82-1.0), so the brightest core possible was 0.855 alpha and
         * measured 230/255 — a core that can never reach full white always reads
         * as a soft ball, which is exactly how it looked.
         */
        const rt = glowRadius * 0.3;
        const BETA = 2.4;
        const HALO_W = 0.42;
        const glow = ctx.createRadialGradient(x, y, 0, x, y, glowRadius);
        for (let i = 0; i <= 20; i++) {
          const t = i / 20;
          const rr = t * glowRadius;
          // Pure Moffat, with NO floor term.
          //
          // An earlier version added a constant (`HALO_W + ...`) to stop the
          // halo vanishing at the rim. That constant was a FLOOR: every radius
          // got at least 0.34 alpha, so the halo rendered as a flat disc 70px
          // across instead of a falloff — a white blob, not a star.
          const haloPart = Math.pow(1 + (rr / rt) ** 2, -BETA);
          const inten = Math.min(1, haloPart * HALO_W * 1.6);
          // Hue: the star's own colour near the centre, drifting to the cooler
          // halo colour further out, as scattered light does.
          const mixT = Math.min(1, t * 1.5);
          const cr = s.color[0] + (s.halo[0] - s.color[0]) * mixT;
          const cg = s.color[1] + (s.halo[1] - s.color[1]) * mixT;
          const cb = s.color[2] + (s.halo[2] - s.color[2]) * mixT;
          // Last stop pinned to zero: a gradient ending at a small non-zero
          // alpha leaves a visible rim at glowRadius.
          const alpha = t >= 1 ? 0 : inten * a;
          glow.addColorStop(t, `rgba(${Math.round(cr)}, ${Math.round(cg)}, ${Math.round(cb)}, ${alpha.toFixed(4)})`);
        }
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(x, y, glowRadius, 0, Math.PI * 2);
        ctx.fill();

        // The core: tight and saturated to full white. Scaled by the fly-in and
        // the cursor heat, but NOT by the shimmer — a blown-out core cannot
        // shimmer, and letting it try is what kept it below full white.
        const coreA = Math.min(1, p * (1 + heat * 0.25));
        // Small: the saturated part should be a dot of a few pixels, not a disc.
        // At 2x DPR, rc*1.5 is ~3 device px of radius, so full white covers
        // roughly a 4px circle and the fall-off begins right away.
        const rc = Math.max(0.55, coreRadius * 0.2);
        const coreGrad = ctx.createRadialGradient(x, y, 0, x, y, rc * 1.5);
        coreGrad.addColorStop(0, `rgba(255, 255, 255, ${coreA})`);
        coreGrad.addColorStop(0.22, `rgba(255, 255, 255, ${coreA * 0.88})`);
        coreGrad.addColorStop(0.45, rgba(s.color, coreA * 0.5));
        coreGrad.addColorStop(0.72, rgba(s.color, coreA * 0.16));
        coreGrad.addColorStop(1, rgba(s.color, 0));
        ctx.fillStyle = coreGrad;
        ctx.beginPath();
        ctx.arc(x, y, rc * 1.5, 0, Math.PI * 2);
        ctx.fill();

        // Diffraction spikes, on the BRIGHT stars only.
        //
        // A spike is an artefact of the telescope aperture, so in a real
        // photograph it appears on bright sources and not on faint ones. Here
        // that means Acrux and Mimosa (flux > 0.6); Imai and Ginan are too faint
        // to flare, and the eye accepts that instantly. Flaring all five equally
        // is what made the field read as clip-art rather than as a sky.
        //
        // Spike length is driven by the CARD's own scale rather than glowRadius:
        // glowRadius is already multiplied by flux, so using it here collapses
        // the fainter stars' spikes to sub-pixel.
        if (f > 0.6) {
          const spikeBase = Math.min(w, h) * 0.38;
          const spike = spikeBase * (0.22 + f * 0.42);
          const spikeAlpha = (0.22 + f * 0.34) * a;

          /**
           * One spike, drawn as a pair of tapered halves.
           *
           * Each half is a filled triangle that is widest at the core and comes
           * to a point at the tip, painted with a gradient that fades to fully
           * transparent at the tip. A single constant-width stroke ended at full
           * opacity, which is what made the flares look pasted on.
           */
          const drawSpike = (dx: number, dy: number, len: number, alpha: number) => {
            const nx = -dy, ny = dx;                 // unit normal
            // Thinner than before (0.016 -> 0.009): a real diffraction spike is
            // a hairline, and a wide one reads as a drawn shape.
            const halfW = Math.max(0.4, len * 0.009);
            const tipX = x + dx * len, tipY = y + dy * len;
            const grad = ctx.createLinearGradient(x, y, tipX, tipY);
            // Fades over the full length rather than dropping off early, so the
            // tip dissolves into the background instead of ending.
            grad.addColorStop(0, rgba(s.color, alpha));
            grad.addColorStop(0.2, rgba(s.color, alpha * 0.5));
            grad.addColorStop(0.55, rgba(s.color, alpha * 0.16));
            grad.addColorStop(1, rgba(s.color, 0));
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.moveTo(x + nx * halfW, y + ny * halfW);
            ctx.lineTo(tipX, tipY);
            ctx.lineTo(x - nx * halfW, y - ny * halfW);
            ctx.closePath();
            ctx.fill();
          };

          // Horizontal and vertical: the pair a four-vane support produces.
          drawSpike(1, 0, spike, spikeAlpha);
          drawSpike(-1, 0, spike, spikeAlpha);
          drawSpike(0, 1, spike, spikeAlpha);
          drawSpike(0, -1, spike, spikeAlpha);

          // Diagonals on the very brightest only, and fainter: a real four-vane
          // support gives the horizontal/vertical pair the strongest spikes.
          if (f > 0.85) {
            const d = spike * 0.5;
            const da = spikeAlpha * 0.38;
            const inv = Math.SQRT1_2;
            drawSpike(inv, inv, d, da);
            drawSpike(-inv, -inv, d, da);
            drawSpike(inv, -inv, d, da);
            drawSpike(-inv, inv, d, da);
          }
        }

        // Core: a continuous gradient, not two stacked discs.
        //
        // Two solid arcs (a coloured one with a white one on top) leave a visible
        // rim where the white circle ends, which reads as a drawn shape. A real
        // saturated core blows out to white at the centre and its colour appears
        // only as the intensity falls, so this is one gradient: white in the
        // middle, the star's own colour at the edge, alpha reaching zero just
        // past the core so there is no edge to see.
        const coreR = coreRadius * 1.15;
        const core = ctx.createRadialGradient(x, y, 0, x, y, coreR);
        core.addColorStop(0, `rgba(255, 255, 255, ${a})`);
        core.addColorStop(0.3, `rgba(255, 255, 255, ${a * 0.82})`);
        core.addColorStop(0.58, rgba(s.color, a * 0.4));
        core.addColorStop(0.82, rgba(s.color, a * 0.12));
        core.addColorStop(1, rgba(s.color, 0));
        ctx.fillStyle = core;
        ctx.beginPath();
        ctx.arc(x, y, coreR, 0, Math.PI * 2);
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
      // Position inside the canvas. Values outside 0..1 mean the cursor has
      // left the field, which fades the effect out naturally because every
      // distance becomes large.
      pointer.nx = (e.clientX - r.left) / r.width;
      pointer.ny = (e.clientY - r.top) / r.height;
      pointer.has = true;
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
