import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing & Courses",
  description:
    "Affordable monthly pricing for FSc Pre-Medical & Pre-Engineering, O/A Levels, BS and MS courses at Rabee Academia — regular and weekend live classes.",
  alternates: { canonical: "/pricing" },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
