import { CalendarDays } from "lucide-react";
import PlaceholderPanel from "@/components/dashboard/PlaceholderPanel";

export default function StudentSchedule() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Schedule</h1>
      <PlaceholderPanel
        title="Your weekly timetable"
        description="Your class schedule — days, times, and subject names — will be displayed here once admin creates your batch."
        icon={CalendarDays}
      />
    </div>
  );
}
