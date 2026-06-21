"use client";

import { StickyNote } from "lucide-react";
import ToolShell from "@/components/ai/ToolShell";
import AiToolClient, { type ToolField } from "@/components/ai/AiToolClient";

const fields: ToolField[] = [
  { name: "subject", label: "Subject", type: "text", placeholder: "Physics" },
  { name: "grade", label: "Class / level", type: "text", placeholder: "FSc Part 2" },
  { name: "topic", label: "Topic / chapter", type: "textarea", placeholder: "Enter a topic (e.g. Electromagnetic Induction) or paste the chapter content…", required: true },
];

export default function Page() {
  return (
    <ToolShell title="Rabee's AI Notes & Flashcards" subtitle="Crisp revision notes, formulas and flashcards." icon={<StickyNote className="w-5 h-5" />} gradient="from-fuchsia-600 to-purple-600">
      <AiToolClient endpoint="/api/ai/notes" fields={fields} submitLabel="Make Notes" printTitle="Rabee's AI Revision Notes" />
    </ToolShell>
  );
}
