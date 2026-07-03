import type { Metadata } from "next";
import { pageMeta } from "@/lib/og";

export const metadata: Metadata = pageMeta({
  title: "Rabee's AI Essay Grader — Free AI Tool | Rabee Academia",
  description: "Grade long answers against a marking scheme with marks, a clear breakdown and feedback in seconds.",
  path: "/products/essay-grader",
});

export default function ToolLayout({ children }: { children: React.ReactNode }) {
  return children;
}
