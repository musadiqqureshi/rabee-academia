import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing & Courses",
  description:
    "Affordable monthly pricing for FSc Pre-Medical & Pre-Engineering, O/A Levels, BS and MS courses at Rabee Academia — regular and weekend live classes.",
  alternates: { canonical: "/pricing" },
  openGraph: {
    title: "Pricing & Courses | Rabee Academia",
    description: "Transparent per-subject monthly pricing — regular or weekend live classes, with a 20% first-course discount.",
    url: "/pricing",
    type: "website",
    siteName: "Rabee Academia",
    images: [{ url: "/opengraph.jpg", width: 1200, height: 630, alt: "Rabee Academia" }],
  },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
