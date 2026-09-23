"use client";

import Image from "next/image";
import { useLang } from "@/components/providers/language-provider";
import { Reveal } from "@/components/ui/reveal";
import { Cta, CtaArrow } from "@/components/ui/cta";
import { ScrollLink } from "@/components/ui/scroll-link";
import { AppWindow } from "@/components/brand/app-window";
import SpotlightCard from "@/components/reactbits/SpotlightCard";
import ScrollReveal from "@/components/reactbits/ScrollReveal";
import BorderGlow from "@/components/reactbits/BorderGlow";
import AnimatedContent from "@/components/reactbits/AnimatedContent";
import ScrollFloat from "@/components/reactbits/ScrollFloat";
import TiltedCard from "@/components/reactbits/TiltedCard";
import CountUp from "@/components/reactbits/CountUp";
import StarBorder from "@/components/reactbits/StarBorder";
import type { Product, ProjectDetail } from "@/lib/content";
import { cn } from "@/lib/utils";

/**
 * ProjectDetailView — the /projects/<id> page body.
 *
 * Structure follows how a visitor actually reads a product page:
 *   hero (what it is) -> the problem -> the vision -> what it does ->
 *   what it looks like running -> the facts -> next project.
 *
 * Motion is ReactBits, and it is graded: the hero carries a scroll-revealed
 * statement, the feature grid uses BorderGlow on the border (never over the
 * text), the gallery uses AppWindow frames so every capture is shown whole, and
 * the closing link is a plain CTA. Nothing animates for its own sake.
 */
export function ProjectDetailView({
  product,
  detail,
  nextProduct,
  nextDetail,
}: {
  product: Product;
  detail: ProjectDetail;
  nextProduct: Product | null;
  nextDetail: ProjectDetail | null;
}) {
  const { t, lang } = useLang();
  const accent = `rgb(${product.hue})`;

  return (
    <div className="pb-24 md:pb-32">
      {/* ---------- Hero ---------- */}
      <section className="relative overflow-hidden pt-[calc(var(--x-nav-h)+4rem)] pb-16 md:pb-24">
        {/* A single soft accent bloom in the product's own hue. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-40 left-1/2 h-[38rem] w-[38rem] -translate-x-1/2 rounded-full opacity-[0.13] blur-[120px]"
          style={{ background: `radial-gradient(circle, ${accent} 0%, transparent 70%)` }}
        />

        <div className="shell relative">
          {/* Breadcrumb — plain text, no # in the URL thanks to ScrollLink. */}
          <div className="mb-9 flex items-center gap-2.5 text-[0.8125rem]">
            <ScrollLink
              href="#top"
              className="text-ink-subtle hover:text-ink-muted transition-colors duration-200 motion-reduce:transition-none"
            >
              Xinet
            </ScrollLink>
            <span aria-hidden="true" className="text-ink-subtle">
              /
            </span>
            <ScrollLink
              href="#products"
              className="text-ink-subtle hover:text-ink-muted transition-colors duration-200 motion-reduce:transition-none"
            >
              {lang === "id" ? "Produk" : "Products"}
            </ScrollLink>
            <span aria-hidden="true" className="text-ink-subtle">
              /
            </span>
            <span className="text-ink">{product.name}</span>
          </div>

          <div className="grid gap-12 lg:grid-cols-12 lg:gap-10">
            <div className="lg:col-span-7 lg:self-center">
              <p
                className="mb-5 text-[0.6875rem] font-semibold tracking-[0.18em] uppercase"
                style={{ color: accent }}
              >
                {t(product.category)}
              </p>

              <h1 className="text-ink text-[clamp(2.25rem,5.4vw,4rem)] leading-[1.04] font-semibold tracking-[-0.035em]">
                {product.name}
              </h1>

              <p className="text-ink mt-6 max-w-2xl text-[clamp(1.0625rem,1.5vw,1.3125rem)] leading-relaxed">
                {t(detail.tagline)}
              </p>

              <div className="mt-9 flex flex-wrap items-center gap-3">
                {product.url ? (
                  <StarBorder
                    as="div"
                    bare
                    color="#22c7e8"
                    speed="5s"
                    thickness={1}
                    className="!rounded-full !p-0"
                  >
                    <Cta href={product.url} external variant="primary">
                      {t(product.cta)}
                      <CtaArrow />
                    </Cta>
                  </StarBorder>
                ) : (
                  <span className="border-line text-ink-subtle inline-flex items-center rounded-full border px-4 py-2 text-sm">
                    {t(detail.status)}
                  </span>
                )}
              </div>
            </div>

            {/* The product itself, tilted on a spring so the hero is not a bare
                block of text. TiltedCard tracks the pointer and settles back,
                which reads as the product being held rather than pasted in. */}
            <div className="lg:col-span-5">
              <AnimatedContent distance={40} duration={0.9} delay={0.15} threshold={0.05}>
                <TiltedCard
                  imageSrc={product.shot}
                  altText={t(product.shotAlt)}
                  captionText={product.name}
                  containerHeight="clamp(15rem, 26vw, 22rem)"
                  containerWidth="100%"
                  imageHeight="100%"
                  imageWidth="100%"
                  // Every capture is 1600x1000. Locking the card to that ratio
                  // lets object-contain fill it exactly: no crop (which cut the
                  // first letter off NexShop's headline) and no letterbox bars.
                  aspectRatio={1.6}
                  rotateAmplitude={9}
                  scaleOnHover={1.04}
                  showMobileWarning={false}
                  showTooltip={false}
                  displayOverlayContent
                  overlayContent={
                    <div className="pointer-events-none flex h-full w-full items-end justify-start p-4">
                      <span className="border-line bg-base/80 text-ink rounded-full border px-3 py-1 text-[0.75rem] font-medium backdrop-blur-sm">
                        {product.shotTitle}
                      </span>
                    </div>
                  }
                />
              </AnimatedContent>
            </div>

          </div>

          {/* Facts run as a full-width strip under the hero. Putting them in the
              same grid row as the text and the capture overflowed the 12-column
              grid (7 + 5 + 5), so they get their own row. */}
          {detail.facts && (
            <div className="mt-14">
              {/* Label above value, not label-left / value-right.
                  Stretching the two apart across three equal columns left a wide
                  dead gap in the middle of every cell, which made the strip read
                  as a stretched wireframe rather than as a set of facts. The
                  cells also cascade in (staggered delay) instead of all landing
                  at once, and each value brightens on hover. */}
              <dl className="border-line grid grid-cols-1 border-t sm:grid-cols-3">
                {detail.facts.map((f, i) => (
                  <AnimatedContent
                    key={f.label.en}
                    distance={18}
                    duration={0.6}
                    delay={i * 0.12}
                    threshold={0.2}
                    className={cn(
                      "border-line group relative border-b sm:border-r sm:last:border-r-0",
                      i > 0 && "sm:pl-6"
                    )}
                  >
                    {/* An accent line that draws itself across the cell on hover.
                        scaleX from 0, so it grows from the left instead of
                        fading in, which reads as the strip answering the
                        pointer. */}
                    <span
                      aria-hidden
                      className="pointer-events-none absolute inset-x-0 top-0 h-px origin-left scale-x-0 bg-[#22c7e8] transition-transform duration-500 ease-out group-hover:scale-x-100"
                    />
                    <div className="py-5 sm:pr-6">
                      <dt className="text-ink-subtle text-[0.6875rem] tracking-[0.14em] uppercase">
                        {t(f.label)}
                      </dt>
                      <dd className="text-ink mt-2 text-[1.0625rem] font-medium tracking-[-0.01em] transition-colors duration-300 group-hover:text-white">
                        {t(f.value)}
                      </dd>
                    </div>
                  </AnimatedContent>
                ))}
              </dl>
            </div>
          )}
        </div>
      </section>

      {/* ---------- The problem ---------- */}
      <section className="border-line border-t py-20 md:py-28">
        <div className="shell grid gap-10 lg:grid-cols-12 lg:gap-16">
          <Reveal className="lg:col-span-4">
            <p className="eyebrow">{lang === "id" ? "Masalahnya" : "The problem"}</p>
          </Reveal>
          <div className="lg:col-span-8">
            <AnimatedContent distance={28} duration={0.85} delay={0.1} threshold={0.15}>
              <p className="text-ink max-w-3xl text-[clamp(1.125rem,2.1vw,1.5rem)] leading-[1.55] tracking-[-0.015em]">
                {t(detail.problem)}
              </p>
            </AnimatedContent>
          </div>
        </div>
      </section>

      {/* ---------- The vision ---------- */}
      <section className="border-line border-t py-20 md:py-28">
        <div className="shell">
          <p className="eyebrow mb-10">{lang === "id" ? "Visi" : "The vision"}</p>
          <ScrollReveal
            baseOpacity={0.14}
            enableBlur
            blurStrength={5}
            containerClassName="!my-0"
            textClassName="!text-[clamp(1.5rem,3.4vw,2.625rem)] !leading-[1.28] !font-semibold !text-ink !tracking-[-0.03em]"
          >
            {t(detail.vision)}
          </ScrollReveal>
        </div>
      </section>

      {/* ---------- What it does ---------- */}
      <section className="border-line border-t py-20 md:py-28">
        <div className="shell">
          <div className="mb-12">
            <p className="eyebrow mb-5">{lang === "id" ? "Yang sudah jalan" : "What it does today"}</p>
            <ScrollFloat
              containerClassName="!my-0 max-w-2xl"
              textClassName="!text-[clamp(1.5rem,3vw,2.25rem)] !leading-[1.12] !font-semibold !text-ink !tracking-[-0.02em]"
              animationDuration={0.9}
              stagger={0.02}
            >
              {lang === "id"
                ? "Fitur yang benar-benar ada, bukan rencana."
                : "Features that actually exist, not plans."}
            </ScrollFloat>
          </div>

          {/* An odd number of features leaves the last cell of a 2-column grid
              empty, which reads as a card that failed to load rather than as
              whitespace. The final card spans both columns in that case, so the
              grid always closes cleanly. */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {detail.features.map((f, i) => (
              <Reveal
                key={f.title.en}
                delay={i * 60}
                className={
                  detail.features.length % 2 === 1 && i === detail.features.length - 1
                    ? "h-full sm:col-span-2"
                    : "h-full"
                }
              >
                <BorderGlow
                  colors={["#22c7e8", "#7dd3fc", "#a5f3fc"]}
                  backgroundColor="#0B0E11"
                  borderRadius={14}
                  glowRadius={32}
                  glowIntensity={1.1}
                  coneSpread={28}
                  edgeSensitivity={34}
                  fillOpacity={0.4}
                  className="!h-full !border !border-[var(--x-line)] !p-7 md:!p-8"
                >
                  <span className="text-ink-subtle font-mono text-[0.6875rem] tracking-[0.1em]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="text-ink mt-4 text-[1.0625rem] font-medium tracking-[-0.015em]">
                    {t(f.title)}
                  </h3>
                  <p className="text-ink-muted mt-2.5 text-[0.9375rem] leading-relaxed">
                    {t(f.body)}
                  </p>
                </BorderGlow>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Gallery ----------
          Products with a single distinct capture (Amara, LumaWall) have no
          gallery: their hero already shows that one screen, so repeating it here
          would show the same image twice on one page. */}
      {/* Only when there are captures to show.
          
          This section used to render for every product, with the label swapped
          for an invented line when there was no gallery. That produced two
          sparse sections back to back on Amara and LumaWall — one line each,
          ~300px apart — and the invented line was factually wrong for LumaWall,
          whose headline feature is multi-monitor while the line claimed the
          whole product fit on one screen. A gallery section should hold
          captures; without captures there is nothing to put here. */}
      {detail.gallery.length > 0 && (
        <section className="border-line border-t py-20 md:py-28">
          <div className="shell">
            <div className="mb-12">
              <ScrollReveal
                as="p"
                baseOpacity={0.2}
                enableBlur
                blurStrength={3}
                containerClassName="!my-0"
                textClassName="!text-[clamp(1.25rem,2.4vw,1.75rem)] !leading-[1.3] !font-semibold !text-ink !tracking-[-0.02em]"
              >
                {lang === "id"
                  ? "Tangkapan asli dari produk yang berjalan."
                  : "Real captures of the running product."}
              </ScrollReveal>
            </div>

            <div className={cn("grid gap-6", detail.gallery.length > 1 && "lg:grid-cols-2")}>
              {detail.gallery.map((g, i) => (
                <Reveal key={g.src} delay={i * 70}>
                  <SpotlightCard
                    spotlightColor="rgba(34, 199, 232, 0.10)"
                    className="!rounded-2xl !border !border-[var(--x-line)] !bg-[#0B0E11] !p-5 md:!p-7"
                  >
                    <AppWindow
                      src={g.src}
                      alt={t(g.caption)}
                      title={product.shotTitle}
                      className="relative w-full"
                      // Half the shell on desktop, full width on mobile. Saying
                      // "560px" for a 92vw slot made Next request a 3840px
                      // variant, which is both slow and wasteful.
                      sizes="(max-width: 1024px) 92vw, 44vw"
                      // 95, not the default 75 — Next re-encodes at the
                      // requested quality, and 75 visibly softens UI text.
                      quality={95}
                    />
                    <p className="text-ink-muted mt-4 text-[0.8125rem] leading-relaxed">
                      {t(g.caption)}
                    </p>
                  </SpotlightCard>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ---------- Closing statement ----------
          Every product page ends on this animated line, so all five pages carry
          the same amount of motion.

          Two things were making this eat more room than it needed:
           - the section used the content sections' padding (py-20 md:py-28), so a
             single line sat in a full section's worth of space and read as an
             empty section. It now uses py-14 md:py-20;
           - a max-w-3xl cap forced the line to break. Measured: the text needs
             ~819px at this size and the shell is 1248px, so the cap was the only
             reason it wrapped. It is gone, and the statement now runs on one
             line wherever the viewport allows. */}
      <section className="border-line border-t py-14 md:py-20">
        <div className="shell">
          <ScrollReveal
            baseOpacity={0.18}
            enableBlur
            blurStrength={4}
            containerClassName="!my-0"
            textClassName="!text-[clamp(1.375rem,2.8vw,2.125rem)] !leading-[1.3] !font-semibold !text-ink !tracking-[-0.03em]"
          >
            {t(detail.closing)}
          </ScrollReveal>
        </div>
      </section>

      {/* ---------- Next project ---------- */}
      {nextProduct && nextDetail && (
        <section className="border-line border-t py-20 md:py-24">
          <div className="shell">
            <ScrollLink
              href={`/projects/${nextProduct.id}`}
              className="group block"
              ariaLabel={`${lang === "id" ? "Proyek berikutnya" : "Next project"}: ${nextProduct.name}`}
            >
              <p className="eyebrow mb-6">
                {lang === "id" ? "Proyek berikutnya" : "Next project"}
              </p>
              <div className="flex flex-wrap items-baseline gap-x-5 gap-y-2">
                <span className="text-ink text-[clamp(1.75rem,4.2vw,3rem)] leading-tight font-semibold tracking-[-0.03em] transition-opacity duration-300 group-hover:opacity-70 motion-reduce:transition-none">
                  {nextProduct.name}
                </span>
                <span
                  aria-hidden="true"
                  className="text-ink-subtle inline-block transition-transform duration-300 ease-out group-hover:translate-x-1 motion-reduce:transition-none"
                >
                  →
                </span>
              </div>
              <p className="text-ink-muted mt-3 max-w-xl text-[0.9375rem] leading-relaxed">
                {t(nextDetail.tagline)}
              </p>
            </ScrollLink>
          </div>
        </section>
      )}
    </div>
  );
}
