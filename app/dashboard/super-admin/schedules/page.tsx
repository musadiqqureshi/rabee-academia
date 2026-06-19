import { CalendarDays } from "lucide-react";
import PlaceholderPanel from "@/components/dashboard/PlaceholderPanel";

export default function SuperAdminSchedules() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Schedules</h1>
      <PlaceholderPanel
        title="Platform-wide schedules"
        description="View and override all batch schedules across the platform. Set holidays, reschedule sessions, and send updated timetables to affected students."
        icon={CalendarDays}
      />
    </div>
  );
}
