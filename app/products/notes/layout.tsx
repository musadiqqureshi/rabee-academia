import type { Metadata } from "next";
import { pageMeta } from "@/lib/og";

export const metadata: Metadata = pageMeta({
  title: "Rabee's AI Notes & Flashcards — Free AI Tool | Rabee Academia",
  description: "Turn any chapter into crisp study notes, key formulas and revision flashcards instantly.",
  path: "/products/notes",
});

export default function ToolLayout({ children }: { children: React.ReactNode }) {
  return children;
}
