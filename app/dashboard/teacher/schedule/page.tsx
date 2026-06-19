import { CalendarDays } from "lucide-react";
import PlaceholderPanel from "@/components/dashboard/PlaceholderPanel";

export default function TeacherSchedule() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">My Schedule</h1>
      <PlaceholderPanel
        title="Teaching timetable"
        description="Your weekly teaching schedule, including subject names, batch types, and session times, will appear here once admin sets it up."
        icon={CalendarDays}
      />
    </div>
  );
}
