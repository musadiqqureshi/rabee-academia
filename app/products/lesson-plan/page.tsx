"use client";

import { BookOpen } from "lucide-react";
import ToolShell from "@/components/ai/ToolShell";
import AiToolClient, { type ToolField } from "@/components/ai/AiToolClient";

const fields: ToolField[] = [
  { name: "subject", label: "Subject", type: "text", placeholder: "Chemistry", required: true },
  { name: "topic", label: "Topic", type: "text", placeholder: "Chemical bonding", required: true },
  { name: "grade", label: "Class / level", type: "text", placeholder: "O Level" },
  { name: "duration", label: "Lesson duration", type: "text", placeholder: "40 minutes" },
  { name: "board", label: "Examination board", type: "select", options: ["", "FBISE", "Cambridge (O/A Level)", "Other"], defaultValue: "" },
  { name: "notes", label: "Extra notes", type: "textarea", placeholder: "Optional — class size, focus, prior lesson…" },
];

export default function Page() {
  return (
    <ToolShell title="Rabee's AI Lesson Planner" subtitle="Classroom-ready lesson plans aligned to your board." icon={<BookOpen className="w-5 h-5" />} gradient="from-indigo-600 to-blue-600">
      <AiToolClient endpoint="/api/ai/lesson-plan" fields={fields} submitLabel="Create Lesson Plan" printTitle="Rabee's AI Lesson Plan" />
    </ToolShell>
  );
}
