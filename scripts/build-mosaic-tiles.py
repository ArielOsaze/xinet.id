#!/usr/bin/env python3
"""
Builds the nine mosaic tiles for the "Different products. One direction." sequence.

WHAT WAS WRONG

The old set had two problems the section could not hide:

  1. Four of the nine tiles were MARKETING pages (a pricing table, a closing CTA, a
     blog list, a reseller promo). The section is meant to show what the products
     do, so a price list or a "contact us" screen does not belong in it.

  2. Only three products appeared. NexShop, SayBot and AkunTuntas had three tiles
     each; LumaWall and Amara had none.

  3. The checkerboard was broken. Rows 1 and 2 alternated, but row 3 was three
     light tiles in a row (measured brightness 205, 186, 205), so the grid read as
     a mistake rather than a composed surface.

WHAT THIS DOES

Picks nine genuine FEATURE screens covering all five products, ordered so the
brightness alternates L/D/L, D/L/D, L/D/L, and renders them at one shared ratio.

ON THE RATIO

TileReveal draws tiles with `object-cover`, so a capture whose ratio differs from
the tile's is cropped by the browser. Cropping is the right outcome here — padding
a capture instead leaves a flat band that reads as a broken image, which is what an
earlier attempt produced.

The tile aspect is 1.75 rather than 16:10 because that is where the crops are
smallest. Most captures are 1.60 and the new LumaWall ones are 1.89-1.98, so:

  tile 1.60 -> LumaWall loses 15-30% of its width
  tile 1.75 -> every capture loses 7-12%, and none needs padding

At 1.75 the crops still leave each screen's sidebar, title bar and content grid
intact. Cropping LumaWall from the right at 1.60 was measured and rejected: it cut
through floating buttons on `Displays` and through the telemetry chart on
`Performance`, so both read as broken.

Output goes to public/products/mosaic-*.webp. The tile-*.webp names are NOT reused:
those are the product-page gallery captures, kept at their own ratios so the gallery
cards stay a uniform height. Overwriting them would break that page.
"""
from PIL import Image
import numpy as np
from pathlib import Path

X = Path(r"C:\Users\ariel\dev\xinet-landing")
S = X / ".shots"
PUB = X / "public" / "products"

TILE_ASPECT = 1.75
OUT_W = 1200
OUT_H = int(round(OUT_W / TILE_ASPECT))

# (output name, source, product, expected tone, what the screen shows)
# Ordered for the checkerboard: L D L / D L D / L D L
TILES = [
    ("mosaic-nexshop-marketplace.webp", S / "raw" / "nexshop-marketplace.png",
     "NexShop", "light", "Marketplace: search, categories, provider list"),
    ("mosaic-saybot-inbox.webp", S / "raw" / "saybot-2.png",
     "SayBot", "dark", "Unified inbox: every channel and contact in one workspace"),
    ("mosaic-akun-ledger.webp", S / "raw" / "akuntuntas-2.png",
     "AkunTuntas", "light", "General ledger with posted transactions"),

    ("mosaic-lumawall-catalog.webp", S / "luma-fresh" / "ui-discover.png",
     "LumaWall", "dark", "Catalog: category filters and the wallpaper detail panel"),
    ("mosaic-amara-chat.webp", S / "raw" / "amara-base.png",
     "Amara", "light", "The character stage beside the conversation"),
    ("mosaic-lumawall-library.webp", S / "luma-fresh" / "ui-library.png",
     "LumaWall", "dark", "Library: downloaded wallpapers ready to apply"),

    ("mosaic-akun-coa.webp", S / "raw" / "akuntuntas-3.png",
     "AkunTuntas", "light", "Chart of accounts with the full account tree"),
    ("mosaic-lumawall-performance.webp", S / "luma-fresh" / "ui-performance.png",
     "LumaWall", "dark", "Performance: frame-rate limit and live GPU telemetry"),
    ("mosaic-akun-partners.webp", S / "raw" / "akuntuntas-4.png",
     "AkunTuntas", "light", "Business partners with contact records"),
]


def fit_to(im, target):
    """
    Crop a capture to the tile ratio. Never pads.

    Wider than the tile: crop the RIGHT, which keeps the sidebar and title bar.
    Taller than the tile: crop the BOTTOM, which reads as a window showing the top
    of its content. A padded band instead reads as a broken image.
    """
    w, h = im.size
    ar = w / h
    if ar > target:
        nw = int(round(h * target))
        return im.crop((0, 0, nw, h)), "right", w - nw
    nh = int(round(w / target))
    return im.crop((0, 0, w, nh)), "bottom", h - nh


def main():
    print(f"tile aspect {TILE_ASPECT} -> {OUT_W}x{OUT_H}\n")
    print(f"{'output':36s} {'product':11s} {'src AR':>6s} {'crop':>7s} {'%':>5s} {'lum':>6s}")
    built = []
    for out_name, src, prod, want_tone, what in TILES:
        im = Image.open(src).convert("RGB")
        w0, h0 = im.size
        im2, how, amt = fit_to(im, TILE_ASPECT)
        pct = amt / (w0 if how == "right" else h0) * 100

        im3 = im2.resize((OUT_W, OUT_H), Image.LANCZOS)
        im3.save(PUB / out_name, "WEBP", lossless=True, quality=100, method=6)

        lum = float(np.array(im3).astype(int).mean())
        tone = "light" if lum > 100 else "dark"
        flag = "" if tone == want_tone else f"  !! expected {want_tone}"
        built.append((out_name, prod, tone, lum, what))
        print(f"{out_name:36s} {prod:11s} {w0/h0:6.3f} {how:>7s} {pct:4.1f}% {lum:6.1f}{flag}")

    print("\ncheckerboard (L/D by measured brightness):")
    for r in range(3):
        print("  " + "  ".join(
            f"{'L' if built[r*3+c][3] > 100 else 'D'}({built[r*3+c][3]:.0f})" for c in range(3)
        ))

    print("\nproduct coverage:")
    from collections import Counter
    cnt = Counter(p for _, p, _, _, _ in built)
    for p in ["NexShop", "SayBot", "AkunTuntas", "LumaWall", "Amara"]:
        print(f"  {p:11s} {cnt.get(p, 0)}")

    print("\nwhat each tile shows (for the alt text):")
    for out_name, prod, _, _, what in built:
        print(f"  {prod:11s} {what}")


if __name__ == "__main__":
    main()
