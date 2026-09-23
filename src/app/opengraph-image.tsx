import { ImageResponse } from "next/og";
import { readFileSync } from "fs";
import { join } from "path";

/**
 * Social share card. Generated at build time so the link preview always matches
 * the current brand — no stale PNG to remember to re-export.
 *
 * The design mirrors the live hero: the dark base, the cyan accent, and the
 * same Crux cross the page carries. The constellation is drawn as inline SVG at
 * its real relative geometry (the same normalised J2000 offsets the hero canvas
 * uses), tilted 45° so the two axes form the X — so the card is recognisably the
 * same mark, not an unrelated graphic.
 *
 * The wordmark is inlined as a data URL because ImageResponse cannot read from
 * the filesystem at render time.
 */
export const alt = "Xinet · Build what's next. A digital product company.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
// Node runtime: the wordmark is read from disk and inlined as a data URL.
export const runtime = "nodejs";

function wordmarkDataUrl(): string {
  try {
    const buf = readFileSync(join(process.cwd(), "public/brand/xinet-wordmark.png"));
    return `data:image/png;base64,${buf.toString("base64")}`;
  } catch {
    return "";
  }
}

/**
 * Crux at its real relative geometry: normalised J2000 offsets from the
 * constellation centre, radius scaled by apparent magnitude, colour from each
 * star's B–V index (Gacrux rendered violet to stay inside the brand palette).
 */
const CRUX: { x: number; y: number; r: number; c: string }[] = [
  { x: -0.0688, y: -1.0, r: 7.4, c: "#d8eaff" }, // Acrux  mag 0.77
  { x: 0.7386, y: 0.0369, r: 5.6, c: "#d2e4ff" }, // Mimosa mag 1.25
  { x: 0.1058, y: 0.82, r: 4.8, c: "#e2d6ff" }, // Gacrux mag 1.64
  { x: -0.5066, y: 0.3227, r: 3.4, c: "#d0e0ff" }, // Imai   mag 2.79
  { x: -0.269, y: -0.1797, r: 2.6, c: "#eee4fa" }, // Ginan  mag 3.59
];

const AXES: [number, number][] = [
  [0, 2],
  [1, 3],
];

function CruxSvg() {
  const S = 158;
  const TILT = Math.PI / 4;
  const cos = Math.cos(TILT);
  const sin = Math.sin(TILT);

  const pts = CRUX.map((s) => {
    const rx = s.x * cos - s.y * sin;
    const ry = s.x * sin + s.y * cos;
    return { x: 200 + rx * S, y: 200 - ry * S, r: s.r, c: s.c };
  });

  return (
    <svg width="400" height="400" viewBox="0 0 400 400" style={{ display: "flex" }}>
      {AXES.map(([a, b], i) => (
        <line
          key={i}
          x1={pts[a].x}
          y1={pts[a].y}
          x2={pts[b].x}
          y2={pts[b].y}
          stroke="#22c7e8"
          strokeWidth="1.2"
          strokeOpacity="0.45"
        />
      ))}
      {pts.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r={p.r * 2.6} fill={p.c} fillOpacity="0.15" />
          <circle cx={p.x} cy={p.y} r={p.r * 1.5} fill={p.c} fillOpacity="0.38" />
          <circle cx={p.x} cy={p.y} r={p.r} fill={p.c} />
        </g>
      ))}
    </svg>
  );
}

export default function OpengraphImage() {
  const wordmark = wordmarkDataUrl();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          justifyContent: "space-between",
          background: "#080A0C",
          padding: "66px 76px",
          position: "relative",
        }}
      >
        {/* Subtle grid, matching the site's .grid-bg */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
            backgroundSize: "54px 54px",
            display: "flex",
          }}
        />
        {/* Ambient cyan bloom, matching the hero's own glow */}
        <div
          style={{
            position: "absolute",
            top: -180,
            right: -110,
            width: 600,
            height: 600,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(34,199,232,0.17) 0%, rgba(34,199,232,0) 68%)",
            display: "flex",
          }}
        />

        {/* Left: brand, headline, product line */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            position: "relative",
            width: 690,
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            {wordmark ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={wordmark} alt="" width={236} height={44} />
            ) : (
              <span style={{ color: "#F5F7F8", fontSize: 40, fontWeight: 700 }}>XINET</span>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                color: "#22C7E8",
                fontSize: 15,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                fontWeight: 600,
                display: "flex",
              }}
            >
              Digital Product Company
            </div>
            <div
              style={{
                color: "#F5F7F8",
                fontSize: 74,
                fontWeight: 700,
                letterSpacing: "-0.038em",
                lineHeight: 1.03,
                marginTop: 18,
                display: "flex",
              }}
            >
              Build what&apos;s next.
            </div>
            <div
              style={{
                color: "#929AA3",
                fontSize: 22,
                lineHeight: 1.45,
                marginTop: 20,
                maxWidth: 600,
                display: "flex",
              }}
            >
              We build digital products for real-world problems: commerce,
              communication, business tools and automation.
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              color: "#7A838C",
              fontSize: 18,
              position: "relative",
            }}
          >
            <span style={{ display: "flex" }}>xinet.id</span>
            <span style={{ color: "rgba(255,255,255,0.2)", display: "flex" }}>·</span>
            <span style={{ display: "flex" }}>
              NexShop · SayBot · AkunTuntas · Amara · LumaWall
            </span>
          </div>
        </div>

        {/* Right: the Crux cross — the same mark the hero carries */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            width: 330,
          }}
        >
          <div
            style={{
              position: "absolute",
              width: 400,
              height: 400,
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(34,199,232,0.15) 0%, rgba(34,199,232,0.035) 45%, rgba(34,199,232,0) 72%)",
              display: "flex",
            }}
          />
          <CruxSvg />
        </div>
      </div>
    ),
    size
  );
}
