import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    {
      url: "https://xinet.id",
      lastModified: now,
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
