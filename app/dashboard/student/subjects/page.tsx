import { BookOpen } from "lucide-react";
import PlaceholderPanel from "@/components/dashboard/PlaceholderPanel";

export default function StudentSubjects() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">My Subjects</h1>
      <PlaceholderPanel
        title="Your enrolled subjects"
        description="Once you enroll and your payment is verified, your subjects will appear here with teacher info, class schedule, and Google Meet links."
        icon={BookOpen}
      />
    </div>
  );
}
