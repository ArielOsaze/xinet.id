"use client";

import { useLang } from "@/components/providers/language-provider";
import { COPY } from "@/lib/content";
import { Reveal } from "@/components/ui/reveal";
import Stepper, { Step } from "@/components/reactbits/Stepper";

/**
 * HowItWorks — a "How It Works" block in the ReactBits Pro sense, built from the
 * free Stepper component.
 *
 * Stepper is the one place on the page where the visitor drives the motion
 * instead of scrolling. That is why it is placed after the editorial sections:
 * by then the page has calmed down, and a deliberate interaction reads as a
 * change of pace rather than more noise.
 *
 * The four steps describe how Xinet actually works, in order: find the problem,
 * build the smallest real version, put it in front of users, then keep it
 * running. No step claims something the company does not do.
 */
const STEPS: { n: string; title: { id: string; en: string }; body: { id: string; en: string } }[] = [
  {
    n: "01",
    title: { id: "Temukan masalahnya", en: "Find the problem" },
    body: {
      id: "Kami mulai dari masalah nyata yang orang sudah hadapi setiap hari — bukan dari teknologi yang sedang ramai.",
      en: "We start from a real problem people already face every day — not from whatever technology is trending.",
    },
  },
  {
    n: "02",
    title: { id: "Bangun versi terkecil yang nyata", en: "Build the smallest real version" },
    body: {
      id: "Satu fitur inti yang benar-benar berfungsi, bukan sepuluh fitur setengah jadi. Kalau tidak berguna, lebih cepat ketahuan.",
      en: "One core feature that genuinely works, not ten half-finished ones. If it is not useful, we find out sooner.",
    },
  },
  {
    n: "03",
    title: { id: "Taruh di depan pengguna", en: "Put it in front of users" },
    body: {
      id: "Dirilis dan dipakai orang sungguhan. Masukan dari pemakaian nyata menentukan apa yang dibangun berikutnya.",
      en: "Shipped and used by real people. Feedback from actual use decides what gets built next.",
    },
  },
  {
    n: "04",
    title: { id: "Jalankan dan rawat", en: "Run and maintain it" },
    body: {
      id: "Produk yang sudah jalan terus dirawat — diperbaiki, dipercepat, dan dikembangkan. Rilis bukan garis akhir.",
      en: "A shipped product keeps getting maintained — fixed, made faster, extended. Launch is not the finish line.",
    },
  },
];

export function HowItWorks() {
  const { t } = useLang();

  return (
    <section className="border-line border-t py-24 md:py-32">
      <div className="shell">
        <div className="grid gap-14 lg:grid-cols-12 lg:gap-16">
          <Reveal className="lg:col-span-5">
            <p className="eyebrow mb-5">{t(COPY.how.eyebrow)}</p>
            <h2 className="text-ink text-[clamp(1.75rem,3.4vw,2.75rem)] leading-[1.1] font-semibold">
              {t(COPY.how.heading)}
            </h2>
          </Reveal>

          <Reveal delay={80} className="lg:col-span-7">
            <Stepper
              initialStep={1}
              backButtonText={t(COPY.how.back)}
              nextButtonText={t(COPY.how.next)}
              stepCircleContainerClassName="!border-[var(--x-line)] !bg-[#0B0E11] !max-w-none"
              contentClassName="!min-h-[13rem]"
              backButtonProps={{
                className:
                  "!border !border-[var(--x-line)] !text-[var(--x-ink-muted)] hover:!text-[var(--x-ink)] hover:!border-[var(--x-line-strong)] !text-sm !font-medium !px-4 !py-2 !rounded-full transition-colors",
              }}
              nextButtonProps={{
                className:
                  "!bg-[var(--x-ink)] !text-[#080A0C] hover:!bg-white !text-sm !font-medium !px-4 !py-2 !rounded-full transition-colors",
              }}
            >
              {STEPS.map((step) => (
                <Step key={step.n}>
                  <div className="flex flex-col gap-4">
                    <span className="text-ink-subtle font-mono text-[0.6875rem] tracking-[0.1em]">
                      {step.n}
                    </span>
                    <h3 className="text-ink text-[clamp(1.25rem,2.2vw,1.625rem)] leading-tight font-semibold tracking-[-0.025em]">
                      {t(step.title)}
                    </h3>
                    <p className="text-ink-muted max-w-lg text-[0.9375rem] leading-relaxed">
                      {t(step.body)}
                    </p>
                  </div>
                </Step>
              ))}
            </Stepper>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
