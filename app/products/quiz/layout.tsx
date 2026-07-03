import type { Metadata } from "next";
import { pageMeta } from "@/lib/og";

export const metadata: Metadata = pageMeta({
  title: "Rabee's AI Quiz Maker — Free AI Tool | Rabee Academia",
  description: "Paste your notes and get an instant self-test with scoring and explanations.",
  path: "/products/quiz",
});

export default function ToolLayout({ children }: { children: React.ReactNode }) {
  return children;
}
