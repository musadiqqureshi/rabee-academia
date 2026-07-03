import type { Metadata } from "next";
import { pageMeta } from "@/lib/og";

export const metadata: Metadata = pageMeta({
  title: "Rabee AI Pro — Free AI Tool | Rabee Academia",
  description: "Unlimited access to all of Rabee's AI study and teaching tools with Rabee AI Pro.",
  path: "/products/pro",
});

export default function ToolLayout({ children }: { children: React.ReactNode }) {
  return children;
}
