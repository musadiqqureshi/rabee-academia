import { UserCheck } from "lucide-react";
import PlaceholderPanel from "@/components/dashboard/PlaceholderPanel";

export default function AdminEnrollments() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Enrollment Approvals</h1>
      <PlaceholderPanel
        title="Pending enrollments"
        description="Students who have submitted an enrollment form and paid (or uploaded IBAN receipt) appear here. Review, verify, and approve to activate their account."
        icon={UserCheck}
      />
    </div>
  );
}
