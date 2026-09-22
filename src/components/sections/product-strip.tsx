"use client";

import { LogoLoop, type LogoItem } from "@/components/reactbits/LogoLoop";
import { useLang } from "@/components/providers/language-provider";
import { COPY, PRODUCTS, STRIP } from "@/lib/content";

/**
 * ProductStrip — a moving strip of the products Xinet owns and develops.
 *
 * Explicitly labelled so it can never be mistaken for customer or partner
 * logos. Rendered as text nodes, so it costs no image requests.
 */
export function ProductStrip() {
  const { t } = useLang();

  const byName = new Map(PRODUCTS.map((p) => [p.name, p]));

  const items: LogoItem[] = STRIP.map((name) => {
    const product = byName.get(name);
    const hue = product?.hue ?? "245 247 248";

    return {
      node: (
        <span className="group inline-flex items-center gap-2.5 whitespace-nowrap">
          <span
            aria-hidden="true"
            className="block size-2 rounded-[3px] transition-transform duration-500 group-hover:scale-125 motion-reduce:transition-none"
            style={{ backgroundColor: `rgb(${hue})` }}
          />
          <span className="text-ink-muted group-hover:text-ink text-[0.9375rem] font-medium tracking-[-0.01em] transition-colors duration-300 motion-reduce:transition-none">
            {name}
          </span>
        </span>
      ),
      ariaLabel: name,
      title: name,
    };
  });

  return (
    <section className="border-line border-y py-14 md:py-16" aria-labelledby="strip-heading">
      <div className="shell">
        <p
          id="strip-heading"
          className="eyebrow mb-8 text-center md:text-left"
        >
          {t(COPY.strip.heading)}
        </p>
      </div>

      <div
        // Fade the strip into the page edges so it never looks cut off.
        className="relative"
        style={{
          maskImage:
            "linear-gradient(90deg, transparent, black 8%, black 92%, transparent)",
          WebkitMaskImage:
            "linear-gradient(90deg, transparent, black 8%, black 92%, transparent)",
        }}
      >
        <LogoLoop
          logos={items}
          speed={48}
          direction="left"
          logoHeight={22}
          gap={72}
          pauseOnHover
          fadeOut={false}
          ariaLabel={t(COPY.strip.aria)}
          className="[&_ul]:items-center"
        />
      </div>
    </section>
  );
}
