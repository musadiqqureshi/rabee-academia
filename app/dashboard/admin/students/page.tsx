import { Users } from "lucide-react";
import PlaceholderPanel from "@/components/dashboard/PlaceholderPanel";

export default function AdminStudents() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Students</h1>
      <PlaceholderPanel
        title="All enrolled students"
        description="View and manage all active students — their subject, batch, assigned teacher, payment status, and attendance summary."
        icon={Users}
      />
    </div>
  );
}
