import type { Metadata } from "next";
import { pageMeta } from "@/lib/og";

export const metadata: Metadata = pageMeta({
  title: "Rabee's AI Lesson Planner — Free AI Tool | Rabee Academia",
  description: "Create classroom-ready lesson plans with objectives, activities, timing and homework in seconds.",
  path: "/products/lesson-plan",
});

export default function ToolLayout({ children }: { children: React.ReactNode }) {
  return children;
}
