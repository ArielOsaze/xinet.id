"use client";

import { XinetLogo } from "@/components/brand/xinet-logo";
import { useLang } from "@/components/providers/language-provider";
import { COPY, FOOTER_COMPANY, FOOTER_PRODUCTS, SOCIALS } from "@/lib/content";
import { ScrollLink } from "@/components/ui/scroll-link";

/**
 * Footer — spacious and almost static. Links are grouped by role, and the
 * company signature closes the page.
 */
export function Footer() {
  const { t } = useLang();

  return (
    <footer className="border-line border-t">
      <div className="shell py-16 md:py-20">
        <div className="grid gap-12 md:grid-cols-12 md:gap-8">
          {/* Brand */}
          <div className="md:col-span-5">
            <XinetLogo variant="wordmark" height={24} alt="Xinet" />
            <p className="text-ink-muted mt-5 text-[0.9375rem]">{t(COPY.brand.tagline)}</p>
          </div>

          {/* Products */}
          <nav className="md:col-span-3" aria-labelledby="footer-products">
            <p id="footer-products" className="eyebrow mb-5">
              {t(COPY.footer.productsLabel)}
            </p>
            <ul className="space-y-3">
              {FOOTER_PRODUCTS.map((p) => (
                <li key={p.name}>
                  {p.url ? (
                    <a
                      href={p.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-ink-muted hover:text-ink text-[0.9375rem] transition-colors duration-200 motion-reduce:transition-none"
                    >
                      {p.name}
                    </a>
                  ) : (
                    <span className="text-ink-subtle text-[0.9375rem]">{p.name}</span>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          {/* Company */}
          <nav className="md:col-span-2" aria-labelledby="footer-company">
            <p id="footer-company" className="eyebrow mb-5">
              {t(COPY.footer.companyLabel)}
            </p>
            <ul className="space-y-3">
              {FOOTER_COMPANY.map((item) => (
                <li key={item.id}>
                  <ScrollLink
                    href={`#${item.id}`}
                    className="text-ink-muted hover:text-ink text-[0.9375rem] transition-colors duration-200 motion-reduce:transition-none"
                  >
                    {t(item.label)}
                  </ScrollLink>
                </li>
              ))}
            </ul>
          </nav>

          {/* Connect */}
          <nav className="md:col-span-2" aria-labelledby="footer-connect">
            <p id="footer-connect" className="eyebrow mb-5">
              {t(COPY.footer.connectLabel)}
            </p>
            <ul className="space-y-3">
              {SOCIALS.map((s) => (
                <li key={s.name}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-ink-muted hover:text-ink text-[0.9375rem] transition-colors duration-200 motion-reduce:transition-none"
                  >
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="border-line mt-16 flex flex-col gap-3 border-t pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-ink-subtle text-[0.8125rem]">{t(COPY.footer.rights)}</p>
          <p className="text-ink-subtle text-[0.8125rem]">{t(COPY.footer.madeIn)}</p>
        </div>
      </div>
    </footer>
  );
}
