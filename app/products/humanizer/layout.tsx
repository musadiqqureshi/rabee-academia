import type { Metadata } from "next";
import { pageMeta } from "@/lib/og";

export const metadata: Metadata = pageMeta({
  title: "Rabee's AI Humanizer — Free AI Tool | Rabee Academia",
  description: "Rewrite AI-generated text to read naturally and human — free up to 2,000 words a day.",
  path: "/products/humanizer",
});

export default function ToolLayout({ children }: { children: React.ReactNode }) {
  return children;
}
