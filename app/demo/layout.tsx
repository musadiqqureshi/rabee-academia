import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Book a Free Demo Class",
  description:
    "Try a free live demo class at Rabee Academia before you enroll. Pick your subject and preferred time — no payment required.",
  alternates: { canonical: "/demo" },
  openGraph: {
    title: "Book a Free Demo Class | Rabee Academia",
    description: "Try a free live demo class before you enroll — pick your subject and time, no payment required.",
    url: "/demo",
    type: "website",
    siteName: "Rabee Academia",
    images: [{ url: "/opengraph.jpg", width: 1200, height: 630, alt: "Rabee Academia" }],
  },
};

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return children;
}
