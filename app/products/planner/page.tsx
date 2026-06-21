"use client";

import { CalendarDays } from "lucide-react";
import ToolShell from "@/components/ai/ToolShell";
import AiToolClient, { type ToolField } from "@/components/ai/AiToolClient";

const fields: ToolField[] = [
  { name: "subjects", label: "Subjects", type: "text", placeholder: "Physics, Chemistry, Maths", required: true },
  { name: "examDate", label: "Exam date", type: "date", required: true },
  { name: "hours", label: "Study hours per day", type: "number", placeholder: "4" },
  { name: "weakAreas", label: "Weak areas to prioritise", type: "text", placeholder: "Organic chemistry, calculus" },
  { name: "grade", label: "Class / level", type: "text", placeholder: "A Level" },
];

export default function Page() {
  return (
    <ToolShell title="Rabee's AI Study Planner" subtitle="A day-by-day revision schedule built around your exam." icon={<CalendarDays className="w-5 h-5" />} gradient="from-orange-500 to-amber-600">
      <AiToolClient endpoint="/api/ai/planner" fields={fields} submitLabel="Build My Plan" printTitle="Rabee's AI Study Plan" />
    </ToolShell>
  );
}
