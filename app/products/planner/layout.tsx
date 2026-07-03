import type { Metadata } from "next";
import { pageMeta } from "@/lib/og";

export const metadata: Metadata = pageMeta({
  title: "Rabee's AI Study Planner — Free AI Tool | Rabee Academia",
  description: "Build a day-by-day, exam-ready revision schedule tailored around your weak areas.",
  path: "/products/planner",
});

export default function ToolLayout({ children }: { children: React.ReactNode }) {
  return children;
}
