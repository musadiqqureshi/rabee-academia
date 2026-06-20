import { requireRole } from "@/lib/auth";
import AITutorChat from "@/components/AITutorChat";

export const dynamic = "force-dynamic";

export default async function TeacherAITutor() {
  await requireRole("teacher");
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">AI Teaching Assistant</h1>
        <p className="text-sm text-muted-foreground mt-1">Draft explanations, examples and lesson ideas in seconds.</p>
      </div>
      <AITutorChat />
    </div>
  );
}
