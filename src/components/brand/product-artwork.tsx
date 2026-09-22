import { cn } from "@/lib/utils";

/**
 * ProductArtwork — each product keeps its own visual identity inside the card,
 * while the frame, spacing and typography stay Xinet's.
 *
 * These are typographic/geometric treatments rather than screenshots: they read
 * as product surfaces, load instantly, scale crisply, and never look like a
 * stock mockup. Swap in real product imagery by replacing the body of each case.
 */

type Props = {
  product: string;
  /** RGB triplet from the product definition, e.g. "34 199 232". */
  hue: string;
  className?: string;
};

export function ProductArtwork({ product, hue, className }: Props) {
  const accent = `rgb(${hue})`;

  return (
    <div
      className={cn(
        "relative isolate h-full w-full overflow-hidden",
        className
      )}
      style={{ backgroundColor: "#0B0E11" }}
    >
      {/* Shared base: fine grid + a single soft bloom tinted per product. */}
      <div className="grid-bg absolute inset-0 opacity-50" />
      <div
        className="absolute -top-24 -right-16 h-72 w-72 rounded-full opacity-[0.2] blur-[70px] transition-transform duration-[900ms] ease-out group-hover:scale-110 motion-reduce:transition-none"
        style={{ background: `radial-gradient(circle, ${accent} 0%, transparent 70%)` }}
      />

      <div className="relative flex h-full w-full items-center justify-center p-6 sm:p-8">
        {product === "nexshop" && <NexShopArt hue={hue} />}
        {product === "saybot" && <SayBotArt hue={hue} />}
        {product === "akuntuntas" && <AkunTuntasArt hue={hue} />}
        {product === "akuai" && <AkuAiArt hue={hue} />}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* NexShop — commerce: product rows, price tags, a cart line            */
/* ------------------------------------------------------------------ */
function NexShopArt({ hue }: { hue: string }) {
  const accent = `rgb(${hue})`;
  const rows = [
    { label: "Diamond", price: "Rp 12.400", tone: 1 },
    { label: "Voucher", price: "Rp 25.000", tone: 0.6 },
    { label: "Game Pass", price: "Rp 49.000", tone: 0.32 },
  ];

  return (
    <div className="w-full max-w-[17rem] transition-transform duration-[900ms] ease-out group-hover:-translate-y-1 motion-reduce:transition-none motion-reduce:group-hover:translate-y-0">
      <div className="border-line bg-surface/80 rounded-xl border p-3.5 backdrop-blur-sm">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-ink-muted text-[0.625rem] font-semibold tracking-[0.16em] uppercase">
            Katalog
          </span>
          <span
            className="size-1.5 rounded-full"
            style={{ backgroundColor: accent }}
            aria-hidden="true"
          />
        </div>
        <ul className="space-y-2">
          {rows.map((row) => (
            <li
              key={row.label}
              className="border-line bg-elevated/70 flex items-center justify-between rounded-lg border px-3 py-2"
            >
              <span className="flex items-center gap-2.5">
                <span
                  className="block size-6 rounded-md"
                  style={{ backgroundColor: `rgba(${hue}, ${0.16 * row.tone + 0.06})` }}
                  aria-hidden="true"
                />
                <span className="text-ink text-[0.8125rem] font-medium">{row.label}</span>
              </span>
              <span className="text-ink-muted font-mono text-[0.6875rem]">{row.price}</span>
            </li>
          ))}
        </ul>
        <div className="border-line mt-3 flex items-center justify-between border-t pt-3">
          <span className="text-ink-subtle text-[0.6875rem]">Instan · 24/7</span>
          <span
            className="rounded-full px-2.5 py-1 text-[0.6875rem] font-semibold"
            style={{ backgroundColor: `rgba(${hue}, 0.16)`, color: accent }}
          >
            Checkout
          </span>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* SayBot — messaging: channel rails and an inbox thread                */
/* ------------------------------------------------------------------ */
function SayBotArt({ hue }: { hue: string }) {
  const accent = `rgb(${hue})`;
  const channels = ["WhatsApp", "Telegram", "Email", "Web Chat"];
  const bubbles = [
    { side: "in", w: "78%" },
    { side: "out", w: "62%" },
    { side: "in", w: "70%" },
  ];

  return (
    <div className="flex w-full max-w-[18rem] gap-2.5 transition-transform duration-[900ms] ease-out group-hover:-translate-y-1 motion-reduce:transition-none motion-reduce:group-hover:translate-y-0">
      {/* Channel rail */}
      <div className="border-line bg-surface/80 hidden w-24 shrink-0 rounded-xl border p-2.5 backdrop-blur-sm sm:block">
        <ul className="space-y-1.5">
          {channels.map((c, i) => (
            <li
              key={c}
              className="flex items-center gap-1.5 rounded-md px-1.5 py-1 text-[0.5625rem] leading-tight"
              style={i === 0 ? { backgroundColor: `rgba(${hue}, 0.14)` } : undefined}
            >
              <span
                className="block size-1.5 shrink-0 rounded-full"
                style={{ backgroundColor: i === 0 ? accent : "rgba(255,255,255,0.2)" }}
                aria-hidden="true"
              />
              <span className={i === 0 ? "text-ink font-medium" : "text-ink-subtle"}>{c}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Thread */}
      <div className="border-line bg-surface/80 flex-1 rounded-xl border p-3 backdrop-blur-sm">
        <div className="border-line mb-2.5 flex items-center gap-2 border-b pb-2.5">
          <span
            className="block size-5 rounded-full"
            style={{ backgroundColor: `rgba(${hue}, 0.24)` }}
            aria-hidden="true"
          />
          <span className="text-ink text-[0.6875rem] font-medium">Broadcast</span>
          <span
            className="ml-auto rounded-full px-1.5 py-0.5 text-[0.5625rem] font-semibold"
            style={{ backgroundColor: `rgba(${hue}, 0.16)`, color: accent }}
          >
            aktif
          </span>
        </div>
        <ul className="space-y-1.5">
          {bubbles.map((b, i) => (
            <li key={i} className={b.side === "out" ? "flex justify-end" : "flex justify-start"}>
              <span
                className="block h-4 rounded-full"
                style={{
                  width: b.w,
                  backgroundColor:
                    b.side === "out" ? `rgba(${hue}, 0.22)` : "rgba(255,255,255,0.07)",
                }}
                aria-hidden="true"
              />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* AkunTuntas — accounting: ledger rows and a balance figure            */
/* ------------------------------------------------------------------ */
function AkunTuntasArt({ hue }: { hue: string }) {
  const accent = `rgb(${hue})`;
  const bars = [0.42, 0.68, 0.54, 0.86, 0.72, 1];

  return (
    <div className="w-full max-w-[17rem] transition-transform duration-[900ms] ease-out group-hover:-translate-y-1 motion-reduce:transition-none motion-reduce:group-hover:translate-y-0">
      <div className="border-line bg-surface/80 rounded-xl border p-4 backdrop-blur-sm">
        <div className="mb-3 flex items-baseline justify-between">
          <span className="text-ink-muted text-[0.625rem] font-semibold tracking-[0.16em] uppercase">
            Buku Besar
          </span>
          <span className="text-ink-subtle text-[0.625rem]">Q1</span>
        </div>

        <div className="mb-4 flex items-end gap-1.5" aria-hidden="true">
          {bars.map((h, i) => (
            <span
              key={i}
              className="block w-full rounded-sm transition-[height] duration-700 ease-out"
              style={{
                height: `${h * 3.25}rem`,
                backgroundColor: i === bars.length - 1 ? accent : `rgba(${hue}, 0.2)`,
              }}
            />
          ))}
        </div>

        <ul className="space-y-1.5">
          {[
            { k: "Kas", v: "Rp 84.200.000" },
            { k: "Piutang", v: "Rp 12.750.000" },
          ].map((r) => (
            <li key={r.k} className="border-line flex items-center justify-between border-b pb-1.5 last:border-0 last:pb-0">
              <span className="text-ink-subtle text-[0.6875rem]">{r.k}</span>
              <span className="text-ink font-mono text-[0.6875rem]">{r.v}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* AkuAI — AI: prompt field and a response trace                        */
/* ------------------------------------------------------------------ */
function AkuAiArt({ hue }: { hue: string }) {
  const accent = `rgb(${hue})`;

  return (
    <div className="w-full max-w-[17rem] transition-transform duration-[900ms] ease-out group-hover:-translate-y-1 motion-reduce:transition-none motion-reduce:group-hover:translate-y-0">
      <div className="border-line bg-surface/80 rounded-xl border p-4 backdrop-blur-sm">
        <div className="border-line bg-elevated/70 mb-3 flex items-center gap-2 rounded-lg border px-3 py-2.5">
          <span
            className="block size-1.5 shrink-0 rounded-full"
            style={{ backgroundColor: accent }}
            aria-hidden="true"
          />
          <span className="text-ink-muted text-[0.6875rem]">Ringkas laporan bulan ini</span>
          <span className="ml-auto h-3 w-px animate-pulse bg-white/40" aria-hidden="true" />
        </div>

        <ul className="space-y-2">
          {[0.9, 0.72, 0.5].map((w, i) => (
            <li key={i} className="flex items-center gap-2">
              <span
                className="block size-3.5 shrink-0 rounded"
                style={{ backgroundColor: `rgba(${hue}, ${0.3 - i * 0.07})` }}
                aria-hidden="true"
              />
              <span
                className="block h-2 rounded-full bg-white/[0.08]"
                style={{ width: `${w * 100}%` }}
                aria-hidden="true"
              />
            </li>
          ))}
        </ul>

        <div className="border-line mt-3.5 flex items-center gap-1.5 border-t pt-3">
          {["Analisis", "Tulis", "Otomasi"].map((tag) => (
            <span
              key={tag}
              className="border-line text-ink-subtle rounded-full border px-2 py-0.5 text-[0.5625rem]"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
