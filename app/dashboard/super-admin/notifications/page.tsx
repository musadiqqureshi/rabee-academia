import { Bell } from "lucide-react";
import PlaceholderPanel from "@/components/dashboard/PlaceholderPanel";

export default function SuperAdminNotifications() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Notifications</h1>
      <PlaceholderPanel
        title="Send announcements"
        description="Broadcast announcements to all students, a specific batch, or individual users. Notifications appear in the recipient's dashboard."
        icon={Bell}
      />
    </div>
  );
}
