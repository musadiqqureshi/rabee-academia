"use client";

import { Wand2 } from "lucide-react";
import ToolShell from "@/components/ai/ToolShell";
import HumanizerClient from "@/components/ai/HumanizerClient";

export default function Page() {
  return (
    <ToolShell title="Rabee's AI Humanizer" subtitle="Rewrite AI text to read naturally — free up to 2,000 words/day." icon={<Wand2 className="w-5 h-5" />} gradient="from-violet-600 to-fuchsia-600" badge="guaranteed">
      <HumanizerClient />
    </ToolShell>
  );
}
