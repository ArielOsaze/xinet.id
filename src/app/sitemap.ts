import type { MetadataRoute } from "next";

/**
 * Only real, indexable pages belong here. The landing page is a single
 * document, so the in-page sections are exposed as a `WebPage` graph in the
 * JSON-LD (layout.tsx) rather than as separate sitemap URLs — a sitemap listing
 * fragments would be noise to a crawler.
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
  ];
}
