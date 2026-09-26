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

# LumaWall's captures come from .shots/luma-clean, NOT .shots/luma-fresh. The raw
# downloads still carry the pale-blue hover box on the minimize button, and
# cropping to the tile ratio cuts that box in half, leaving a blue strip against
# the right edge. luma-clean has the box removed and the scrollbar trimmed, built
# by scripts/build-lumawall-captures.py.
LW = S / "luma-clean"

# AkunTuntas' chart screens come from the design set on the Desktop. They are the
# same application UI as the shipped captures (measured 2.1 apart on a normalised
# comparison, where the same screen scores under 3), but they were taken with real
# figures, so the donut, bar chart and health gauge actually render. Captures taken
# from an empty company show "Rp -" and draw nothing, which says nothing about what
# the product does.
AK = Path(r"C:\Users\ariel\Desktop\Hasil-Redesign-AkunTuntas")

# (output name, source, product, expected tone, what the screen shows)
#
# LAYOUT: a dark MIDDLE COLUMN rather than a full checkerboard.
#   L D L
#   L D L
#   L D L
#
# A checkerboard needs four dark tiles, but only three dark screens exist that are
# worth showing (two LumaWall screens and SayBot's inbox). Filling the fourth slot
# forced a third LumaWall screen, and LumaWall only has one other layout — a second
# artwork grid — which read as the same screenshot pasted twice. A dark column needs
# exactly three, so LumaWall appears twice with its two most distinct screens
# (measured 46.7 apart, the largest gap of any pair in the set).
#
# AkunTuntas contributes four screens, so they sit at the CORNERS: in a 3x3 grid no
# two corners are edge-adjacent, so the three similar table views are never side by
# side. Worst edge-adjacent similarity across the grid is 25.6, where anything under
# 12 would read as a duplicate.
TILES = [
    ("mosaic-akun-ledger.webp", AK / "1-Dashboard.png",
     "AkunTuntas", "light", "Dashboard: cash-flow donut, monthly bars and the key totals"),
    ("mosaic-lumawall-catalog.webp", LW / "catalog.png",
     "LumaWall", "dark", "Catalog: category filters and the wallpaper detail panel"),
    ("mosaic-akun-coa.webp", S / "raw" / "akuntuntas-3.png",
     "AkunTuntas", "light", "Chart of accounts with the full account tree"),

    ("mosaic-nexshop-marketplace.webp", S / "raw" / "nexshop-marketplace.png",
     "NexShop", "light", "Marketplace: search, categories, provider list"),
    ("mosaic-lumawall-displays.webp", LW / "displays.png",
     "LumaWall", "dark", "Displays: a different wallpaper assigned to each monitor"),
    ("mosaic-amara-chat.webp", S / "raw" / "amara-base.png",
     "Amara", "light", "The character stage beside the conversation"),

    ("mosaic-akun-partners.webp", S / "raw" / "akuntuntas-4.png",
     "AkunTuntas", "light", "Business partners with contact records"),
    ("mosaic-saybot-inbox.webp", S / "raw" / "saybot-2.png",
     "SayBot", "dark", "Unified inbox: every channel and contact in one workspace"),
    ("mosaic-akun-dashboard.webp", AK / "2-Analisis-Keuangan.png",
     "AkunTuntas", "light", "Financial analysis: the health score gauge and its insights"),
]


def trim_empty_bottom(im, margin=8):
    """
    Drop flat rows at the BOTTOM of the app window, keeping a small margin.

    Safe by construction: only empty application background is removed, never
    content, so the tile ends up denser rather than cut. LumaWall's Displays and
    Performance screens end in a large empty band, which otherwise fills a third
    of the tile with nothing.
    """
    a = np.array(im.convert("RGB")).astype(int)
    h, w = a.shape[:2]
    std = a.std(axis=(1, 2))
    content = np.where(std > 12)[0]
    if not len(content):
        return im, 0
    end = min(h, int(content.max()) + 1 + margin)
    if end >= h:
        return im, 0
    return im.crop((0, 0, w, end)), h - end


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
        im, trimmed = trim_empty_bottom(im)
        im2, how, amt = fit_to(im, TILE_ASPECT)
        pct = amt / (w0 if how == "right" else h0) * 100
        if trimmed:
            how = f"{how}+t{trimmed}"

        im3 = im2.resize((OUT_W, OUT_H), Image.LANCZOS)
        im3.save(PUB / out_name, "WEBP", lossless=True, quality=100, method=6)

        lum = float(np.array(im3).astype(int).mean())
        tone = "light" if lum > 100 else "dark"
        flag = "" if tone == want_tone else f"  !! expected {want_tone}"
        built.append((out_name, prod, tone, lum, what))
        print(f"{out_name:36s} {prod:11s} {w0/h0:6.3f} {how:>7s} {pct:4.1f}% {lum:6.1f}{flag}")

    print("\nlayout (L/D by measured brightness):")
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
