import { ClipboardCheck } from "lucide-react";
import PlaceholderPanel from "@/components/dashboard/PlaceholderPanel";

export default function AdminAttendance() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Attendance</h1>
      <PlaceholderPanel
        title="Attendance overview"
        description="View attendance across all batches. Filter by subject, teacher, or date range. Export attendance reports as PDF or CSV."
        icon={ClipboardCheck}
      />
    </div>
  );
}
