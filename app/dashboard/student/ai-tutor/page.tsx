import { requireRole } from "@/lib/auth";
import AITutorChat from "@/components/AITutorChat";

export const dynamic = "force-dynamic";

export default async function StudentAITutor() {
  await requireRole("student");
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Rabee's AI</h1>
        <p className="text-sm text-muted-foreground mt-1">Get instant help with concepts, homework and exam prep.</p>
      </div>
      <AITutorChat />
    </div>
  );
}
