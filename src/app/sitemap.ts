import type { MetadataRoute } from "next";
import { PRODUCTS, getProjectDetail } from "@/lib/content";

/**
 * The landing page plus one entry per shipped product.
 *
 * In-page sections are NOT listed as separate URLs — a sitemap full of
 * fragments is noise to a crawler. The real product pages, on the other hand,
 * are exactly what should be indexed.
 *
 * Each product entry carries the same per-product OG image the page itself
 * declares, so a crawler that reads only the sitemap still associates the right
 * thumbnail with the right URL. `images` is part of the sitemap spec and is what
 * Google uses to pick a preview for a page it has not rendered yet.
 */
const SITE_URL = "https://xinet.id";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
      images: [`${SITE_URL}/opengraph-image`],
    },
    ...PRODUCTS.filter((p) => getProjectDetail(p.id)).map((p) => ({
      url: `${SITE_URL}/projects/${p.id}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
      // The product's own generated card, plus the real screenshot the page
      // shows. Both are absolute URLs, as the spec requires.
      images: [
        `${SITE_URL}/projects/${p.id}/opengraph-image`,
        `${SITE_URL}${p.shot}`,
      ],
    })),
  ];
}
