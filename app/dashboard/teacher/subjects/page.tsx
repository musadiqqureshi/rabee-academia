import { BookOpen } from "lucide-react";
import PlaceholderPanel from "@/components/dashboard/PlaceholderPanel";

export default function TeacherSubjects() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">My Subjects</h1>
      <PlaceholderPanel
        title="Subjects you teach"
        description="Subjects assigned to you appear here with the level, batch type (regular/weekend), and number of enrolled students."
        icon={BookOpen}
      />
    </div>
  );
}
