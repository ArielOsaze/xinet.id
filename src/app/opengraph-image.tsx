import { ImageResponse } from "next/og";
import { readFileSync } from "fs";
import { join } from "path";

/**
 * Social share card. Generated at build time so the link preview always matches
 * the current brand — no stale PNG to remember to re-export.
 *
 * The wordmark is inlined as a data URL because the edge runtime used by
 * ImageResponse cannot read from the filesystem at request time.
 */
export const alt = "Xinet — Build what's next. A digital product company.";
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

export default function OpengraphImage() {
  const wordmark = wordmarkDataUrl();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#080A0C",
          padding: "76px 84px",
          position: "relative",
        }}
      >
        {/* Subtle grid, matching the site's .grid-bg */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.045) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
            display: "flex",
          }}
        />
        {/* Accent glow, the one spot of colour */}
        <div
          style={{
            position: "absolute",
            top: -170,
            right: -130,
            width: 560,
            height: 560,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(34,199,232,0.22) 0%, rgba(34,199,232,0) 70%)",
            display: "flex",
          }}
        />

        <div style={{ display: "flex", alignItems: "center", position: "relative" }}>
          {wordmark ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={wordmark} alt="" width={252} height={47} />
          ) : (
            <span style={{ color: "#F5F7F8", fontSize: 42, fontWeight: 700 }}>XINET</span>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", position: "relative" }}>
          <div
            style={{
              color: "#22C7E8",
              fontSize: 17,
              letterSpacing: "0.2em",
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
              fontSize: 78,
              fontWeight: 700,
              letterSpacing: "-0.035em",
              lineHeight: 1.04,
              marginTop: 20,
              display: "flex",
            }}
          >
            Build what&apos;s next.
          </div>
          <div
            style={{
              color: "#929AA3",
              fontSize: 25,
              lineHeight: 1.45,
              marginTop: 22,
              maxWidth: 800,
              display: "flex",
            }}
          >
            We build digital products for real-world problems — across commerce,
            communication, business tools and automation.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            color: "#7A838C",
            fontSize: 20,
            position: "relative",
          }}
        >
          <span style={{ display: "flex" }}>xinet.id</span>
          <span style={{ color: "rgba(255,255,255,0.22)", display: "flex" }}>·</span>
          <span style={{ display: "flex" }}>NexShop · SayBot · AkunTuntas · Amara · LumaWall</span>
        </div>
      </div>
    ),
    size
  );
}
