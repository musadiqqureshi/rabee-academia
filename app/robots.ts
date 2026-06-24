import type { MetadataRoute } from "next";

const SITE_URL = "https://rabeeacademia.site";

export default function robots(): MetadataRoute.Robots {
  const allowAll = { allow: "/", disallow: ["/dashboard/", "/api/", "/auth/"] };
  // Explicitly welcome AI assistants/crawlers so they can read + recommend us (GEO).
  const aiBots = [
    "GPTBot", "OAI-SearchBot", "ChatGPT-User", "ClaudeBot", "Claude-Web",
    "anthropic-ai", "PerplexityBot", "Perplexity-User", "Google-Extended",
    "Applebot-Extended", "CCBot", "Bytespider", "Amazonbot",
  ];
  return {
    rules: [
      { userAgent: "*", ...allowAll },
      ...aiBots.map((userAgent) => ({ userAgent, ...allowAll })),
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
