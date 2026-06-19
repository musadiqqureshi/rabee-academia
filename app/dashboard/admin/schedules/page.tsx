import { CalendarDays } from "lucide-react";
import PlaceholderPanel from "@/components/dashboard/PlaceholderPanel";

export default function AdminSchedules() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Schedules</h1>
      <PlaceholderPanel
        title="Class timetables"
        description="Set weekly schedules for each batch. Regular batches run Mon–Fri; weekend batches run Sat & Sun. Students and teachers are notified automatically."
        icon={CalendarDays}
      />
    </div>
  );
}
