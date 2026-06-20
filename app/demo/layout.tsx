import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Book a Free Demo Class",
  description:
    "Try a free live demo class at Rabee Academia before you enroll. Pick your subject and preferred time — no payment required.",
  alternates: { canonical: "/demo" },
};

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return children;
}
