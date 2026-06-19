import { Bell } from "lucide-react";
import PlaceholderPanel from "@/components/dashboard/PlaceholderPanel";

export default function StudentNotifications() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Notifications</h1>
      <PlaceholderPanel
        title="Your notifications"
        description="Class reminders, fee due alerts, new assignment notifications, and announcements from admin will appear here."
        icon={Bell}
      />
    </div>
  );
}
