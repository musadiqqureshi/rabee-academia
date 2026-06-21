"use client";

import { ListChecks } from "lucide-react";
import ToolShell from "@/components/ai/ToolShell";
import QuizFromNotesClient from "@/components/ai/QuizFromNotesClient";

export default function Page() {
  return (
    <ToolShell title="Rabee's AI Quiz Maker" subtitle="Turn your notes into an instant self-test." icon={<ListChecks className="w-5 h-5" />} gradient="from-rose-500 to-red-600">
      <QuizFromNotesClient />
    </ToolShell>
  );
}
