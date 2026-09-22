"use client";

import { useLang } from "@/components/providers/language-provider";
import { COPY, PRODUCTS, type Product } from "@/lib/content";
import { AppWindow } from "@/components/brand/app-window";
import { Reveal } from "@/components/ui/reveal";
import ScrollStack, { ScrollStackItem } from "@/components/reactbits/ScrollStack";
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
      blurAmount={1.2}
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
      ? `${ctaLabel} — buka di tab baru`
      : `${ctaLabel} — opens in a new tab`;

  const inner = (
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
          sizes="(max-width: 1024px) 92vw, 640px"
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

        <div className="mt-9 flex items-center gap-3">
          {product.url ? (
            <span className="text-ink inline-flex items-center gap-2 text-sm font-medium underline decoration-transparent underline-offset-4 transition-colors duration-300 group-hover:underline motion-reduce:transition-none">
              {ctaLabel}
              <span
                aria-hidden="true"
                className="inline-block transition-transform duration-300 ease-out group-hover:translate-x-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
              >
                →
              </span>
            </span>
          ) : (
            <span className="text-ink-subtle inline-flex items-center gap-2 text-sm font-medium">
              <span className="border-line-strong rounded-full border px-2.5 py-0.5 text-[0.6875rem] tracking-[0.08em] uppercase">
                {t(COPY.products.soon)}
              </span>
              {ctaLabel}
            </span>
          )}
        </div>
      </div>
    </div>
  );

  // Products with a live destination are fully clickable; the rest are static.
  if (!product.url) return inner;

  return (
    <a
      href={product.url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={ariaLabel}
      className="focus-visible:ring-accent group block rounded-2xl focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080A0C] focus-visible:outline-none"
    >
      {inner}
    </a>
  );
}
