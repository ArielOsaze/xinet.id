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
              <dl className="border-line grid grid-cols-1 border-t sm:grid-cols-3">
                  {detail.facts.map((f) => (
                    <AnimatedContent
                      key={f.label.en}
                      distance={18}
                      duration={0.6}
                      delay={0.08}
                      threshold={0.2}
                      className="border-line border-b sm:border-r sm:last:border-r-0"
                    >
                      <div className="flex items-baseline justify-between gap-4 px-1 py-4">
                        <dt className="text-ink-subtle text-[0.75rem] tracking-[0.1em] uppercase">
                          {t(f.label)}
                        </dt>
                        <dd className="text-ink text-[0.9375rem] font-medium">{t(f.value)}</dd>
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

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {detail.features.map((f, i) => (
              <Reveal key={f.title.en} delay={i * 60} className="h-full">
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
          would show the same image twice on one page. The section is skipped
          entirely rather than rendered empty. */}
      {detail.gallery.length > 0 && (
        <section className="border-line border-t py-20 md:py-28">
          <div className="shell">
            <div className="mb-12">
              <p className="eyebrow mb-5">{lang === "id" ? "Tampilannya" : "What it looks like"}</p>
              <ScrollFloat
                containerClassName="!my-0 max-w-2xl"
                textClassName="!text-[clamp(1.5rem,3vw,2.25rem)] !leading-[1.12] !font-semibold !text-ink !tracking-[-0.02em]"
                animationDuration={0.9}
                stagger={0.02}
              >
                {lang === "id"
                  ? "Tangkapan asli dari produk yang berjalan."
                  : "Real captures of the running product."}
              </ScrollFloat>
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
