import { ClipboardCheck } from "lucide-react";
import PlaceholderPanel from "@/components/dashboard/PlaceholderPanel";

export default function TeacherAttendance() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Attendance</h1>
      <PlaceholderPanel
        title="Mark & view attendance"
        description="Mark students present or absent for each session. View historical attendance and generate per-student summaries."
        icon={ClipboardCheck}
      />
    </div>
  );
}
