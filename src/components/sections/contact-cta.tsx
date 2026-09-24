"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useLang } from "@/components/providers/language-provider";
import { COPY } from "@/lib/content";
import { Cta, CtaArrow } from "@/components/ui/cta";
import { cn } from "@/lib/utils";

/**
 * ContactCta — the Contact section's primary button.
 *
 * WHY NOT A BARE `mailto:`
 *
 * A `mailto:` link only works when the visitor's machine has a default mail
 * application. On a machine that does not, Windows hands the request to the
 * browser's own handler, which opens an empty new tab — indistinguishable from a
 * broken button. That is what happened on the machine this was tested from: the
 * `mailto` URL association pointed at ChromeHTML and no mail app was set.
 *
 * So the button opens a menu with the routes that do not depend on local setup:
 * Gmail on the web, and a copy button. The plain `mailto` is still offered,
 * because on a configured machine it is the shortest path.
 *
 * WHY THE MENU IS RENDERED IN A PORTAL
 *
 * It used to be absolutely positioned inside this component, and the bottom of it
 * came out blurred. Raising its z-index did nothing, and could not have: the
 * section wraps its content in `Reveal`, which animates `transform`, and a
 * transform creates a stacking context. Everything inside it — including a
 * child with z-index 1100 — is painted inside that context, so it can never rise
 * above the section's `GradualBlur` (z-index 1000), whose `backdrop-filter`
 * blurs whatever is behind it regardless of z-order.
 *
 * A portal to `document.body` takes the menu out of that context entirely, which
 * is the correct answer for a popover rather than fighting the ancestor's
 * stacking rules. Position is taken from the trigger's viewport rect and fixed,
 * so it stays put relative to the button.
 */
const ADDRESS = "contactxinet@yahoo.com";
// Percent-encoded: `@` is legal raw in a query value, but encoding is the correct
// form and avoids any client that decodes the URL differently from parsing it.
const GMAIL = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(ADDRESS)}`;

export function ContactCta({ className }: { className?: string }) {
  const { t, lang } = useLang();
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<"idle" | "copied" | "manual">("idle");
  const [rect, setRect] = useState<{ top: number; left: number; width: number } | null>(null);
  const [mounted, setMounted] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  /** Anchor the menu under the trigger, in viewport coordinates. */
  const measure = useCallback(() => {
    const el = wrapRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setRect({ top: r.bottom + 8, left: r.left + r.width / 2, width: r.width });
  }, []);

  // Measure before paint so the menu never flashes at the wrong spot.
  useLayoutEffect(() => {
    if (open) measure();
  }, [open, measure]);

  // A fixed menu must follow the trigger, and close if the trigger scrolls away.
  useEffect(() => {
    if (!open) return;
    const onScroll = () => measure();
    const onResize = () => measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, [open, measure]);

  /**
   * Escape must close the menu wherever focus happens to be.
   *
   * A handler on the menu element never fires: opening the menu does not move
   * focus into it, so the keypress still lands on the trigger. Listening on the
   * document is what actually works.
   */
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (open) setState("idle");
  }, [open]);

  const copy = async () => {
    // The async Clipboard API needs a secure context and a permission some
    // browsers refuse. `execCommand` is deprecated but still works without a
    // prompt, so it is the fallback rather than silently doing nothing.
    const legacy = () => {
      try {
        const ta = document.createElement("textarea");
        ta.value = ADDRESS;
        ta.setAttribute("readonly", "");
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        const ok = document.execCommand("copy");
        document.body.removeChild(ta);
        return ok;
      } catch {
        return false;
      }
    };

    let ok = false;
    try {
      await navigator.clipboard.writeText(ADDRESS);
      ok = true;
    } catch {
      ok = legacy();
    }

    // Either way the visitor is told something happened. Doing nothing at all is
    // what makes a copy button feel broken.
    setState(ok ? "copied" : "manual");
    if (ok) window.setTimeout(() => setState("idle"), 2200);
  };

  const L = {
    gmail: lang === "id" ? "Buka di Gmail" : "Open in Gmail",
    copy: lang === "id" ? "Salin alamat" : "Copy address",
    copied: lang === "id" ? "Tersalin" : "Copied",
    manual: lang === "id" ? "Pilih lalu Ctrl+C" : "Select and press Ctrl+C",
    mail: lang === "id" ? "Buka aplikasi email" : "Open mail app",
  };

  const menu =
    mounted && open && rect
      ? createPortal(
          <>
            {/* Click-away layer. Not focusable, so it never traps the keyboard. */}
            <button
              type="button"
              aria-hidden="true"
              tabIndex={-1}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-[1990] cursor-default"
            />
            <div
              role="menu"
              style={{ top: rect.top, left: rect.left, minWidth: Math.max(rect.width, 272) }}
              className="border-line bg-elevated fixed z-[2000] -translate-x-1/2 overflow-hidden rounded-xl border p-1.5 text-left shadow-[0_24px_60px_-24px_rgba(0,0,0,0.9)]"
            >
              <a
                role="menuitem"
                href={GMAIL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                className="text-ink-muted hover:text-ink hover:bg-white/[0.05] block rounded-lg px-3 py-2.5 text-[0.8125rem] transition-colors duration-150"
              >
                {L.gmail}
              </a>
              <button
                role="menuitem"
                type="button"
                onClick={copy}
                className="text-ink-muted hover:text-ink hover:bg-white/[0.05] block w-full rounded-lg px-3 py-2.5 text-left text-[0.8125rem] transition-colors duration-150"
              >
                {state === "copied" ? L.copied : state === "manual" ? L.manual : L.copy}
              </button>
              <a
                role="menuitem"
                href={`mailto:${ADDRESS}`}
                onClick={() => setOpen(false)}
                className="text-ink-subtle hover:text-ink hover:bg-white/[0.05] block rounded-lg px-3 py-2.5 text-[0.8125rem] transition-colors duration-150"
              >
                {L.mail}
              </a>
              <p className="text-ink-subtle border-line mt-1 border-t px-3 pt-2.5 pb-1.5 font-mono text-[0.6875rem] break-all select-all">
                {ADDRESS}
              </p>
            </div>
          </>,
          document.body
        )
      : null;

  return (
    <div ref={wrapRef} className={cn("relative", className)}>
      <Cta
        variant="primary"
        onClick={() => setOpen((v) => !v)}
        ariaLabel={t(COPY.finalCta.primary)}
        ariaExpanded={open}
      >
        {t(COPY.finalCta.primary)}
        <CtaArrow />
      </Cta>
      {menu}
    </div>
  );
}
