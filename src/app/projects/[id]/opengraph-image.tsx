import { ImageResponse } from "next/og";
import { readFileSync } from "fs";
import { join } from "path";
import { PRODUCTS, getProduct, getProjectDetail } from "@/lib/content";

/**
 * Per-product social share card: /projects/<id>/opengraph-image
 *
 * WHY PER PRODUCT
 *
 * This route used to fall back to the site-wide card, so all five product pages
 * shared one image. A link to LumaWall and a link to NexShop looked identical in
 * a timeline or a chat, which wastes the strongest SEO surface a product page
 * has: the preview. Each page now generates its own card carrying that product's
 * own name, tagline, accent hue and a real screenshot of the running product.
 *
 * The screenshot is the current file from /products, re-encoded to PNG here
 * because the card renderer takes PNG/JPEG, and the site ships WebP.
 */
export const runtime = "nodejs";

const SIZE = { width: 1200, height: 630 };

/**
 * Required by the parent segment.
 *
 * `dynamicParams = false` on /projects/[id] means only params named by
 * `generateStaticParams` are served at all. The page exports it; this route
 * handler must too, or every card request 404s even though the file exists.
 */
export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ id: p.id }));
}

function readPng(relPath: string): string {
  try {
    const buf = readFileSync(join(process.cwd(), "public", relPath.replace(/^\//, "")));
    return `data:image/png;base64,${buf.toString("base64")}`;
  } catch {
    return "";
  }
}

function wordmarkDataUrl(): string {
  try {
    const buf = readFileSync(join(process.cwd(), "public/brand/xinet-wordmark.png"));
    return `data:image/png;base64,${buf.toString("base64")}`;
  } catch {
    return "";
  }
}

function Dot({ color }: { color: string }) {
  return (
    <span
      style={{
        display: "flex",
        width: 9,
        height: 9,
        borderRadius: 999,
        background: color,
      }}
    />
  );
}

export default async function OpengraphImage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = getProduct(id);
  const detail = getProjectDetail(id);
  const wordmark = wordmarkDataUrl();

  if (!product) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#080A0C",
            color: "#F5F7F8",
            fontSize: 64,
            fontWeight: 700,
          }}
        >
          Xinet
        </div>
      ),
      SIZE
    );
  }

  const rgb = product.hue.split(" ").join(", ");
  const accent = `rgb(${rgb})`;
  const tagline = detail ? detail.tagline.en : product.description.en;
  // The site ships WebP; the card renderer wants PNG, so the thumbnail is
  // committed alongside as a PNG at exactly the size the card draws it.
  const shot = readPng(`/products/og/${product.id}.png`);

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
          padding: "50px 62px",
          position: "relative",
        }}
      >
        {/* Subtle grid, matching the site's .grid-bg */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)",
            backgroundSize: "52px 52px",
          }}
        />
        {/* Ambient bloom in the product's own hue */}
        <div
          style={{
            position: "absolute",
            top: -230,
            left: -130,
            width: 660,
            height: 660,
            borderRadius: "50%",
            display: "flex",
            background: `radial-gradient(circle, rgba(${rgb}, 0.20) 0%, rgba(${rgb}, 0) 70%)`,
          }}
        />

        {/* Top: brand on the left, the product's category on the right */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "relative",
          }}
        >
          {wordmark ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={wordmark} alt="" width={182} height={34} />
          ) : (
            <span style={{ display: "flex", color: "#F5F7F8", fontSize: 30, fontWeight: 700 }}>
              XINET
            </span>
          )}
          <span
            style={{
              display: "flex",
              color: accent,
              fontSize: 15,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              fontWeight: 600,
            }}
          >
            {product.category.en}
          </span>
        </div>

        {/* Middle: the product's name and tagline, beside its real UI */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 46,
            position: "relative",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", width: 548 }}>
            <div
              style={{
                display: "flex",
                color: "#F5F7F8",
                fontSize: 66,
                fontWeight: 700,
                letterSpacing: "-0.035em",
                lineHeight: 1.04,
              }}
            >
              {product.name}
            </div>
            <div
              style={{
                display: "flex",
                color: "#929AA3",
                fontSize: 21,
                lineHeight: 1.45,
                marginTop: 18,
              }}
            >
              {tagline}
            </div>
          </div>

          {shot ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                width: 470,
                borderRadius: 13,
                border: "1px solid rgba(255,255,255,0.13)",
                background: "#0B0E11",
              }}
            >
              {/* macOS-style title bar, matching the site's AppWindow frames */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  height: 30,
                  paddingLeft: 13,
                  background: "#15181C",
                  borderRadius: "12px 12px 0 0",
                }}
              >
                <Dot color="#FF5F57" />
                <Dot color="#FEBC2E" />
                <Dot color="#28C840" />
                <span
                  style={{
                    display: "flex",
                    marginLeft: 9,
                    color: "#6B7280",
                    fontSize: 12,
                  }}
                >
                  {product.shotTitle}
                </span>
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={shot} alt="" width={468} height={292} />
            </div>
          ) : null}
        </div>

        {/* Bottom: the canonical path, so the card states its own URL */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            color: "#7A838C",
            fontSize: 17,
            position: "relative",
          }}
        >
          <span style={{ display: "flex" }}>xinet.id</span>
          <span style={{ display: "flex", color: "rgba(255,255,255,0.2)" }}>·</span>
          <span style={{ display: "flex" }}>/projects/{product.id}</span>
        </div>
      </div>
    ),
    SIZE
  );
}
