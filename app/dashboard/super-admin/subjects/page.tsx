import { BookOpen } from "lucide-react";
import PlaceholderPanel from "@/components/dashboard/PlaceholderPanel";

export default function SuperAdminSubjects() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Subjects</h1>
      <PlaceholderPanel
        title="Subject catalogue"
        description="Manage the full list of offered subjects — add new ones, update pricing (regular/weekend), and enable or disable them from the enrollment flow."
        icon={BookOpen}
      />
    </div>
  );
}
