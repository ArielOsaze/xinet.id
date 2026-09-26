#!/usr/bin/env python3
"""
Builds the shipped LumaWall captures from the raw downloads in .shots/luma-fresh.

WHY THIS IS A SCRIPT AND NOT A ONE-OFF

The raw screenshots come from lumawall.xinet.id and carry three defects that must
all be fixed together, and re-fixed whenever the captures are refreshed:

  1. A pale-blue HOVER BOX on the minimize button (44x54px, RGB(190,230,253)).
     The cursor was left over the button when the shot was taken. Present on all
     four screens.

  2. A native SCROLLBAR down the right edge of `ui-library` (17px wide, track
     RGB(240,240,240)). Unstyled next to the app's dark theme, so it reads as a
     foreign element. Cropping it is safe because the app's own layout does not
     reach into it.

  3. DIFFERENT ASPECT RATIOS (1.89 to 2.69). Cards in the gallery sit in a grid
     and must be the same height; a shorter capture makes its card shorter and the
     window inside then looks squashed next to its neighbours.

The fix for (3) is to pad, not crop: the captures already end in the app's own
background (RGB 7,8,11 in the content area, RGB 10,12,16 in the sidebar), so
extending the bottom continues the app instead of adding a visible bar. Padding
from the LAST ROW rather than a flat fill keeps both shades, so no seam appears
where the sidebar meets the content area.

Cropping to a shared ratio was rejected: `Displays` would lose 40% of its width,
taking the sidebar and the window controls with it.

Order matters: crop the scrollbar FIRST, then pad, so the padding is computed
against the final width.
"""
from PIL import Image, ImageDraw
import numpy as np
from pathlib import Path

SRC = Path(r"C:\Users\ariel\dev\xinet-landing\.shots\luma-fresh")
PUB = Path(r"C:\Users\ariel\dev\xinet-landing\public\products")

# Shipped file name -> raw source. The hero is the Catalog screen.
JOBS = [
    ("ui-discover.png", "tile-lumawall-catalog.webp"),
    ("ui-discover.png", "lumawall.webp"),
    ("ui-library.png", "tile-lumawall-library.webp"),
    ("ui-displays.png", "tile-lumawall-displays.webp"),
    ("ui-performance.png", "tile-lumawall-performance.webp"),
]

# Target ratio: the widest capture (1580/836 = 1.8899). Every other capture is
# narrower, so this is the ratio that needs the least padding while still fitting
# all of them by width.
TARGET_AR = 1580 / 836

# The hover box, measured from the raw files: x1442..1485, y0..53.
HOVER = (1442, 0, 1486, 54)
# The dash inside it, measured from the raw file before any edit.
DASH = (19, 26, 7, 1)          # x, y (local to HOVER), w, h
GLYPH_RGB = (127, 134, 149)    # same as the untouched maximize glyph

# Scrollbar: `ui-library` only. The track is a bright vertical strip at the right.
SCROLLBAR_MIN_WIDTH = 10
SCROLLBAR_MIN_BRIGHT_ROWS = 200


def is_hover_blue(a):
    """Pale blue of the hover box: blue channel well above red."""
    return ((a[:, :, 2] > 235) & ((a[:, :, 2] - a[:, :, 0]) > 45)
            & (a[:, :, 1] > 210) & (a[:, :, 0] < 215))


def crop_scrollbar(im):
    """
    Trim a native scrollbar off the right edge, if one is present.

    Detected by looking for a run of columns at the right that are bright over
    most of their height, which is what a light scrollbar track looks like against
    this dark UI. Returns the image unchanged when there is nothing to trim.
    """
    a = np.array(im.convert("RGB")).astype(int)
    h, w = a.shape[:2]
    bright = (a.max(axis=2) > 100).sum(axis=0)   # bright pixels per column

    edge = w
    while edge > 0 and bright[edge - 1] > h * 0.5:
        edge -= 1
    width = w - edge

    if width < SCROLLBAR_MIN_WIDTH:
        return im, 0

    # Also drop the 1px separator that usually sits against the track.
    return im.crop((0, 0, edge - 1, h)), width + 1


def fix_hover_box(im):
    """Remove the pale-blue hover box, keeping the dash glyph."""
    a = np.array(im.convert("RGB")).astype(int)
    x0, y0, x1, y1 = HOVER
    sub = a[y0:y1, x0:x1]
    m = is_hover_blue(sub)
    if not m.any():
        return im

    # Fill per row from the title bar just to the LEFT of the box, so the bar's
    # own gradient survives instead of a flat patch.
    left = a[y0:y1, x0 - 6:x0 - 2].mean(axis=1)          # (54, 3)
    fill = np.repeat(left[:, None, :], x1 - x0, axis=1)  # (54, 44, 3)
    a[y0:y1, x0:x1] = np.where(m[:, :, None], fill, sub).astype(int)

    # Restore the dash at its measured size and in a neighbour's colour: on the
    # blue box the source dash is a blend, not a colour the app itself uses.
    dx, dy, dw, dh = DASH
    a[y0 + dy:y0 + dy + dh, x0 + dx:x0 + dx + dw] = GLYPH_RGB

    return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))


def pad_to_ratio(im, target_ar):
    """
    Extend the bottom so the image reaches `target_ar`.

    Repeats the last row rather than filling with one colour: the bottom band is
    not uniform (sidebar 10,12,16 beside content 7,8,11), so a flat fill would
    leave a seam down the sidebar's edge.
    """
    w, h = im.size
    need = int(round(w / target_ar))
    if need <= h:
        return im, 0
    a = np.array(im.convert("RGB"))
    pad = np.repeat(a[h - 1:h, :, :], need - h, axis=0)
    return Image.fromarray(np.concatenate([a, pad], axis=0)), need - h


def main():
    print(f"target ratio {TARGET_AR:.4f} (the widest capture)\n")
    for src_name, dst_name in JOBS:
        im = Image.open(SRC / src_name)

        im, trimmed = crop_scrollbar(im)
        im = fix_hover_box(im)
        im, padded = pad_to_ratio(im, TARGET_AR)

        im.convert("RGB").save(PUB / dst_name, "WEBP", lossless=True,
                               quality=100, method=6)
        notes = []
        if trimmed:
            notes.append(f"trimmed {trimmed}px scrollbar")
        if padded:
            notes.append(f"padded {padded}px")
        print(f"  {dst_name:34s} {im.size[0]}x{im.size[1]}  "
              f"AR={im.size[0]/im.size[1]:.4f}  {', '.join(notes) or 'no change'}")


if __name__ == "__main__":
    main()
