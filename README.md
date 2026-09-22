# Xinet — xinet.id

Company site for **Xinet**, a digital product company that builds and operates
independent digital products under one ecosystem.

> Build what's next.

## Stack

- **Next.js 16** (App Router, Turbopack) + **React 19** + **TypeScript**
- **Tailwind CSS v4** with a token layer in `src/app/globals.css`
- **React Bits** components for motion, vendored into `src/components/reactbits`
- **Plus Jakarta Sans** via `next/font` (self-hosted, no layout shift)

No CMS, no database, no runtime API. Every route is statically prerendered.

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm start        # serve the production build
```

> On this machine npm blocks lifecycle scripts via a global `allow-scripts`
> setting. If `npm install` fails with `EALLOWSCRIPTS`, pass a clean userconfig:
> `npm install --userconfig=.npmrc-clean`

## Project structure

```
src/
  app/
    layout.tsx        metadata, fonts, skip link, language provider
    page.tsx          section order
    globals.css       design tokens, utilities, motion safety
    icon.png          favicon (generated from the brand mark)
    sitemap.ts        /sitemap.xml
    robots.ts         /robots.txt
  components/
    brand/            XinetLogo, BuiltByXinet, product artwork
    layout/           Navbar, Footer
    products/         ProductCard
    providers/        LanguageProvider (ID/EN)
    reactbits/        vendored React Bits motion components
    sections/         one file per page section
    ui/               Cta, Reveal, LanguageToggle
  lib/
    content.ts        all copy + product data (bilingual)
    utils.ts          cn()
```

## Editing content

All user-facing copy and product data live in **`src/lib/content.ts`**. Each
string is a `{ id, en }` pair, so adding a language means extending that file
rather than hunting through components.

To add a product, append to the `PRODUCTS` array:

```ts
{
  id: "newproduct",
  name: "NewProduct",
  category: { id: "Kategori", en: "Category" },
  description: { id: "…", en: "…" },
  cta: { id: "Buka NewProduct", en: "Visit NewProduct" },
  url: "https://example.com",   // null renders an honest "Coming soon" state
  hue: "34 199 232",            // RGB triplet used for the card accent
}
```

Also add a matching case in `src/components/brand/product-artwork.tsx` if the
product needs its own artwork treatment.

## Brand assets

`public/brand/` holds the logo artwork:

| File | Use |
| --- | --- |
| `xinet-mark.png` | X mark only |
| `xinet-wordmark.png` | X mark + INET |
| `xinet-lockup-tagline.png` | full lockup including the tagline |
| `xinet-logo-source.png` | original supplied artwork (kept for reference) |

**To swap in a new logo**, replace those three files (same names and roughly the
same aspect ratios). Nothing else references logo artwork: every placement goes
through `src/components/brand/xinet-logo.tsx`, which owns the file map and
derives width from height so no layout shifts.

The favicon (`src/app/icon.png`, `src/app/apple-icon.png`) is generated from the
mark composited on the brand background — regenerate it if the mark changes.

## Motion

React Bits supplies the motion system; it is deliberately not the identity of
the site. The hierarchy calms down as the visitor scrolls:

| Area | Motion |
| --- | --- |
| Hero | logo blur-to-sharp entrance (CSS keyframes, ~1.8s), DarkVeil WebGL veil |
| Ecosystem | `TileReveal` scroll sequence (fly-in → zoom → clear) |
| Products | `SpotlightCard` pointer spotlight + 2.5° tilt |
| Editorial | word-by-word `ScrollReveal`, simple `Reveal` entrances |
| Footer | effectively static |

Performance and accessibility rules baked in:

- **`prefers-reduced-motion`** — the hero logo lands on its final frame, the
  tile sequence is skipped entirely (content renders plainly, no extra scroll),
  and a global CSS rule neutralises remaining transitions.
- **WebGL is conditional** — `DarkVeil` mounts only at ≥768px with a fine
  pointer, unmounts when scrolled out of view or when the tab is hidden, and is
  lazily imported so it stays out of the initial bundle. Mobile never pays for it.
- **Tilt is disabled** on touch devices.
- Only `transform` / `opacity` / `filter` animate, and the tile sequence writes
  to the DOM inside a single rAF callback so React never re-renders while
  scrolling.

Two upstream React Bits components were hardened:

- `ScrollReveal` — the stock version dims every word to `baseOpacity` as its
  initial state (so copy stays unreadable if the animation never fires) and its
  cleanup calls `ScrollTrigger.getAll().kill()`, tearing down unrelated scroll
  animations. The vendored version renders legible text on the server, arms the
  dimmed state client-side before paint, and owns only its own observer.
- `PixelTransition` — the stock version reads `window` during render, which
  breaks prerendering. Capability detection moved into an effect.

`TileReveal` is a native implementation: React Bits Pro ships it under a paid
licence, so the documented behaviour was reproduced here without the dependency.

## Deployment (Vercel)

The repo is Vercel-ready: `vercel.json` sets the framework, security headers and
long-lived caching for `/brand/*`, and every route prerenders statically.

```bash
git push origin main          # connect the repo in Vercel, or:
npx vercel --prod
```

Set the production domain to **xinet.id**. `metadataBase`, the canonical URL,
`sitemap.xml` and `robots.txt` all assume that host — update `SITE_URL` in
`src/app/layout.tsx` if it changes.

### Before going live

- [ ] Replace `public/brand/*` with the final logo artwork.
- [ ] Confirm the social links in `SOCIALS` (`src/lib/content.ts`) point at the
      real Xinet accounts — they are currently placeholders.
- [ ] Confirm `hello@xinet.id` in `src/components/sections/final-cta.tsx` is the
      address that should receive contact mail.
- [ ] AkunTuntas and AkuAI have `url: null` (rendered as "Coming soon"); set
      their live URLs when they exist.

## Notes

- The product artwork in `src/components/brand/product-artwork.tsx` is
  typographic/geometric rather than screenshots — it reads as a product surface,
  ships no image bytes, and scales crisply. Swap in real imagery by replacing
  each case.
- There is no fabricated social proof anywhere on the site: no testimonials, no
  customer logos, no invented statistics. The product strip is explicitly
  labelled as Xinet-owned projects.
