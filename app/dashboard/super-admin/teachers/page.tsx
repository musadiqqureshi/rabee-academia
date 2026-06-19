import { UserCog } from "lucide-react";
import PlaceholderPanel from "@/components/dashboard/PlaceholderPanel";

export default function SuperAdminTeachers() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Teachers</h1>
      <PlaceholderPanel
        title="Teacher management"
        description="Add new teachers, assign them subjects, set monthly budgets, and view which students are under each teacher."
        icon={UserCog}
      />
    </div>
  );
}
