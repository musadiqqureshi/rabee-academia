import type { MetadataRoute } from "next";

const SITE_URL = "https://rabeeacademia.site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const routes: { path: string; priority: number; freq: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
    { path: "/", priority: 1.0, freq: "weekly" },
    { path: "/pricing", priority: 0.9, freq: "weekly" },
    { path: "/demo", priority: 0.8, freq: "weekly" },
    { path: "/faq", priority: 0.8, freq: "monthly" },
    { path: "/products", priority: 0.7, freq: "monthly" },
    { path: "/enroll", priority: 0.7, freq: "weekly" },
    { path: "/register", priority: 0.6, freq: "yearly" },
    { path: "/login", priority: 0.4, freq: "yearly" },
  ];

  return routes.map((r) => ({
    url: `${SITE_URL}${r.path}`,
    lastModified: now,
    changeFrequency: r.freq,
    priority: r.priority,
  }));
}
