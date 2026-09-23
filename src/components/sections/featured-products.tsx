"use client";

import Link from "next/link";
import { useLang } from "@/components/providers/language-provider";
import { COPY, PRODUCTS, type Product } from "@/lib/content";
import { AppWindow } from "@/components/brand/app-window";
import { Reveal } from "@/components/ui/reveal";
import ScrollStack, { ScrollStackItem } from "@/components/reactbits/ScrollStack";
import GlareHover from "@/components/reactbits/GlareHover";
import { cn } from "@/lib/utils";

/**
 * FeaturedProducts — the centrepiece.
 *
 * Cards stack as you scroll: ReactBits ScrollStack pins each card while the next
 * slides over it, then releases. Each card shows a real capture of the running
 * product inside a macOS-style window frame, so the cards demonstrate the
 * products instead of illustrating them.
 *
 * ScrollStack runs its own Lenis instance on window scroll. It is disabled for
 * reduced-motion users, who get the same cards as a plain stacked list — no
 * pinning, no smooth-scroll hijack.
 */
export function FeaturedProducts() {
  const { t } = useLang();

  return (
    <section id="products" className="scroll-mt-24 py-24 md:py-32">
      <div className="shell mb-14 md:mb-20">
        <Reveal>
          <p className="eyebrow mb-5">{t(COPY.products.eyebrow)}</p>
          <h2 className="text-ink max-w-2xl text-[clamp(1.75rem,3.4vw,2.75rem)] leading-[1.1] font-semibold">
            {t(COPY.products.heading)}
          </h2>
        </Reveal>
      </div>

      <StackedProducts />
    </section>
  );
}

function StackedProducts() {
  const { t } = useLang();

  return (
    <ScrollStack
      useWindowScroll
      itemDistance={48}
      itemScale={0.028}
      itemStackDistance={26}
      stackPosition="14%"
      scaleEndPosition="6%"
      baseScale={0.9}
      // No blurAmount on purpose: it writes `filter: blur()` to every card on
      // every scroll frame, and a repaint of that blurred layer collides with
      // the hover glare overlay, which reads as jitter. Depth is already carried
      // by scale + offset, so the blur adds nothing but cost.
      blurAmount={0}
      className="[&_.scroll-stack-inner]:!px-0 [&_.scroll-stack-inner]:!pt-0 [&_.scroll-stack-inner]:!pb-[35vh]"
    >
      {PRODUCTS.map((product, index) => (
        <ScrollStackItem key={product.id} itemClassName="!my-0 !h-auto !rounded-2xl !bg-transparent !p-0 !shadow-none">
          <div className="shell">
            <ProductCardBody product={product} index={index} />
          </div>
        </ScrollStackItem>
      ))}
    </ScrollStack>
  );
}

function ProductCardBody({ product, index }: { product: Product; index: number }) {
  const { t, lang } = useLang();
  const flip = index % 2 === 1;

  const ctaLabel = t(product.cta);
  const ariaLabel =
    lang === "id"
      ? `${ctaLabel} · buka di tab baru`
      : `${ctaLabel} · opens in a new tab`;

  const inner = (
    <GlareHover
      // A single sweep of light across the card on hover. Restrained: low
      // opacity, no loop, and it resets on leave so the card never stays lit.
      // Size is left to the content — passing width/height made the wrapper
      // re-measure against the card on every hover frame.
      background="transparent"
      borderColor="transparent"
      borderRadius="1rem"
      glareColor="#ffffff"
      glareOpacity={0.045}
      glareAngle={-30}
      glareSize={220}
      transitionDuration={900}
      playOnce={false}
    >
      <div
        className={cn(
          "border-line grid h-full grid-cols-1 overflow-hidden rounded-2xl border bg-[#0B0E11] lg:grid-cols-12",
          flip && "lg:[&>*:first-child]:order-2"
        )}
      >
      {/* Real product capture, framed like a window */}
      <div className="border-line relative flex items-center justify-center border-b p-5 sm:p-7 lg:col-span-7 lg:min-h-[24rem] lg:border-r lg:border-b-0 lg:p-9">
        <div className="grid-bg pointer-events-none absolute inset-0 opacity-40" />
        <div
          className="pointer-events-none absolute -top-16 -right-10 h-56 w-56 rounded-full opacity-[0.14] blur-[70px]"
          style={{ background: `radial-gradient(circle, rgb(${product.hue}) 0%, transparent 70%)` }}
        />
        <AppWindow
          src={product.shot}
          alt={t(product.shotAlt)}
          title={product.shotTitle}
          className="relative w-full"
          // The window occupies 7 of 12 columns inside the shell, so it paints
          // around 40vw on a desktop. The old value claimed 640px, which made
          // Next serve a 640px file for a ~530px slot — fine at 1x, but a 2x
          // screen then upscales it and the UI text goes soft.
          sizes="(max-width: 1024px) 92vw, 44vw"
        />
      </div>

      {/* Copy panel */}
      <div className="flex flex-col justify-between p-7 sm:p-9 lg:col-span-5 lg:p-11">
        <div>
          <p
            className="mb-5 text-[0.6875rem] font-semibold tracking-[0.18em] uppercase"
            style={{ color: `rgb(${product.hue})` }}
          >
            {t(product.category)}
          </p>

          <h3 className="text-ink text-[clamp(1.5rem,2.6vw,2.125rem)] leading-tight font-semibold tracking-[-0.03em]">
            {product.name}
          </h3>

          <p className="text-ink-muted mt-4 max-w-md text-[0.9375rem] leading-relaxed">
            {t(product.description)}
          </p>
        </div>

        <div className="mt-9 flex flex-wrap items-center gap-3">
          {/* Primary action: the project page, where the full story lives. This
              is a real <Link> rather than the whole card being one, because the
              card also holds the "live site" anchor below — and an <a> inside an
              <a> is invalid HTML, which makes React throw a hydration error. */}
          <Link
            href={`/projects/${product.id}`}
            aria-label={ariaLabel}
            className="text-ink focus-visible:ring-accent inline-flex items-center gap-2 rounded-sm text-sm font-medium underline decoration-transparent underline-offset-4 transition-colors duration-300 group-hover:underline hover:decoration-current focus-visible:ring-2 focus-visible:outline-none motion-reduce:transition-none"
          >
            {lang === "id" ? `Lihat ${product.name}` : `View ${product.name}`}
            <span
              aria-hidden="true"
              className="inline-block transition-transform duration-300 ease-out group-hover:translate-x-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
            >
              →
            </span>
          </Link>

          {/* Secondary action: the live product, in a new tab. */}
          {product.url && (
            <a
              href={product.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-ink-subtle hover:text-ink-muted border-line hover:border-line-strong inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[0.75rem] transition-colors duration-300 motion-reduce:transition-none"
            >
              {t(COPY.products.liveSite)}
              <span aria-hidden="true">↗</span>
            </a>
          )}
        </div>
      </div>
      </div>
    </GlareHover>
  );

  // The card itself is a plain group container, not a link: it holds two
  // separate actions (project page + live site), so a single wrapping anchor
  // would both nest anchors and swallow the secondary link's click.
  return <div className="group relative rounded-2xl">{inner}</div>;
}
