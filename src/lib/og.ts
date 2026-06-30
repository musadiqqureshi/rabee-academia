import type { Metadata } from "next";

// Per-page metadata with a proper Open Graph block (social-share preview).
// metadataBase in the root layout resolves the relative image/url to absolute.
export function pageMeta({ title, description, path }: { title: string; description: string; path: string }): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: path,
      type: "website",
      siteName: "Rabee Academia",
      images: [{ url: "/opengraph.jpg", width: 1200, height: 630, alt: "Rabee Academia" }],
    },
  };
}
