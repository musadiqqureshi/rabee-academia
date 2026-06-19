import { Users } from "lucide-react";
import PlaceholderPanel from "@/components/dashboard/PlaceholderPanel";

export default function TeacherStudents() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">My Students</h1>
      <PlaceholderPanel
        title="Assigned students"
        description="Students assigned to you by admin will be listed here. You can view their subject, class type, and attendance — but not their fee details."
        icon={Users}
      />
    </div>
  );
}
