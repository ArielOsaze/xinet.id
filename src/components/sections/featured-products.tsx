"use client";

import { useLang } from "@/components/providers/language-provider";
import { COPY, PRODUCTS, type Product } from "@/lib/content";
import { AppWindow } from "@/components/brand/app-window";
import { ProductCard } from "@/components/products/product-card";
import { Reveal } from "@/components/ui/reveal";
import { cn } from "@/lib/utils";

/**
 * FeaturedProducts — the centrepiece.
 *
 * Layout: large editorial cards that alternate sides on desktop and collapse to
 * a single stack on mobile. Each card shows a real capture of the running
 * product inside a macOS-style window frame, so the cards demonstrate the
 * products instead of illustrating them.
 */
export function FeaturedProducts() {
  const { t } = useLang();

  return (
    <section id="products" className="shell scroll-mt-24 py-24 md:py-32">
      <Reveal className="mb-14 md:mb-20">
        <p className="eyebrow mb-5">{t(COPY.products.eyebrow)}</p>
        <h2 className="text-ink max-w-2xl text-[clamp(1.75rem,3.4vw,2.75rem)] leading-[1.1] font-semibold">
          {t(COPY.products.heading)}
        </h2>
      </Reveal>

      <div className="flex flex-col gap-6 md:gap-8">
        {PRODUCTS.map((product, index) => (
          <ProductRow key={product.id} product={product} index={index} />
        ))}
      </div>
    </section>
  );
}

function ProductRow({ product, index }: { product: Product; index: number }) {
  const { t, lang } = useLang();
  const flip = index % 2 === 1;

  const ctaLabel = t(product.cta);
  const ariaLabel =
    lang === "id"
      ? `${ctaLabel} — buka di tab baru`
      : `${ctaLabel} — opens in a new tab`;

  return (
    <Reveal delay={index * 60}>
      <ProductCard href={product.url} accent={product.hue} ariaLabel={ariaLabel}>
        <div
          className={cn(
            "grid h-full grid-cols-1 lg:grid-cols-12",
            // Alternate the screenshot side so the grid reads editorially,
            // never like a template.
            flip && "lg:[&>*:first-child]:order-2"
          )}
        >
          {/* Real product capture, framed like a window */}
          <div
            className="border-line relative flex items-center justify-center border-b p-5 sm:p-7 lg:col-span-7 lg:min-h-[24rem] lg:border-r lg:border-b-0 lg:p-9"
            style={{ backgroundColor: "#0B0E11" }}
          >
            <div className="grid-bg pointer-events-none absolute inset-0 opacity-40" />
            <div
              className="pointer-events-none absolute -top-16 -right-10 h-56 w-56 rounded-full opacity-[0.14] blur-[70px]"
              style={{
                background: `radial-gradient(circle, rgb(${product.hue}) 0%, transparent 70%)`,
              }}
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
                <span className="text-ink group-hover/cta:decoration-line-strong inline-flex items-center gap-2 text-sm font-medium underline decoration-transparent underline-offset-4 transition-colors duration-300 group-hover:underline motion-reduce:transition-none">
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
      </ProductCard>
    </Reveal>
  );
}
