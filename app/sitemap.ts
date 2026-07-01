import type { MetadataRoute } from "next";
import { QURAN_COURSES } from "@/lib/quranContent";
import { courses } from "@/lib/courses";

const SITE_URL = "https://rabeeacademia.site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const routes: { path: string; priority: number; freq: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
    ...QURAN_COURSES.map((c) => ({ path: `/quran-learning/${c.slug}`, priority: 0.8, freq: "monthly" as const })),
    ...courses.filter((c) => !c.slug.startsWith("quran-")).map((c) => ({ path: `/courses/${c.slug}`, priority: 0.7, freq: "monthly" as const })),
    { path: "/", priority: 1.0, freq: "weekly" },
    { path: "/pricing", priority: 0.9, freq: "weekly" },
    { path: "/demo", priority: 0.8, freq: "weekly" },
    { path: "/faq", priority: 0.8, freq: "monthly" },
    { path: "/products", priority: 0.7, freq: "monthly" },
    ...["paper-maker", "essay-grader", "lesson-plan", "notes", "planner", "quiz", "humanizer", "pro"]
      .map((t) => ({ path: `/products/${t}`, priority: 0.6, freq: "monthly" as const })),
    { path: "/ai-career-stack", priority: 0.85, freq: "weekly" },
    { path: "/quran-learning", priority: 0.9, freq: "weekly" },
    { path: "/instructor", priority: 0.6, freq: "monthly" },
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
