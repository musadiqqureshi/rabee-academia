import type { Metadata } from "next";
import { pageMeta } from "@/lib/og";

export const metadata: Metadata = pageMeta({
  title: "Rabee's AI Paper Maker — Free AI Tool | Rabee Academia",
  description: "Generate professional exam papers with a complete answer key — print or save as PDF. Free once a day.",
  path: "/products/paper-maker",
});

export default function ToolLayout({ children }: { children: React.ReactNode }) {
  return children;
}
