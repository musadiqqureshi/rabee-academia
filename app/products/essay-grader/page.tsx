"use client";

import { ClipboardCheck } from "lucide-react";
import ToolShell from "@/components/ai/ToolShell";
import AiToolClient, { type ToolField } from "@/components/ai/AiToolClient";

const fields: ToolField[] = [
  { name: "subject", label: "Subject", type: "text", placeholder: "Biology" },
  { name: "grade", label: "Class / level", type: "text", placeholder: "FSc Part 1" },
  { name: "totalMarks", label: "Total marks", type: "number", placeholder: "10" },
  { name: "question", label: "Question / prompt", type: "textarea", placeholder: "The question the student answered…" },
  { name: "scheme", label: "Marking scheme / rubric", type: "textarea", placeholder: "Optional — paste the marking scheme for accurate grading." },
  { name: "answer", label: "Student's answer", type: "textarea", placeholder: "Paste the student's answer here…", required: true },
];

export default function Page() {
  return (
    <ToolShell title="Rabee's AI Essay Grader" subtitle="Grade long answers with marks, breakdown and feedback." icon={<ClipboardCheck className="w-5 h-5" />} gradient="from-emerald-500 to-teal-600">
      <AiToolClient endpoint="/api/ai/essay-grader" fields={fields} submitLabel="Grade Answer" printTitle="Rabee's AI Essay Grader" />
    </ToolShell>
  );
}
