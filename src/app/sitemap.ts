import type { MetadataRoute } from "next";
import { PRODUCTS } from "@/lib/content";

/**
 * The landing page plus one page per shipped product.
 *
 * In-page sections are NOT listed as separate URLs — a sitemap full of
 * fragments is noise to a crawler. The real product pages, on the other hand,
 * are exactly what should be indexed.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    {
      url: "https://xinet.id",
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    ...PRODUCTS.map((p) => ({
      url: `https://xinet.id/projects/${p.id}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
