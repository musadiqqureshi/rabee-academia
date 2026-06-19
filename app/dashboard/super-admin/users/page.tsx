import { Users } from "lucide-react";
import PlaceholderPanel from "@/components/dashboard/PlaceholderPanel";

export default function SuperAdminUsers() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">User Management</h1>
      <PlaceholderPanel
        title="All platform users"
        description="Create, view, and manage all users: students, teachers, admins, and super admins. Assign roles, reset passwords, and deactivate accounts."
        icon={Users}
      />
    </div>
  );
}
