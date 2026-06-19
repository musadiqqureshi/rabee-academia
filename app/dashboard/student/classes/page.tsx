import { Video } from "lucide-react";
import PlaceholderPanel from "@/components/dashboard/PlaceholderPanel";

export default function StudentClasses() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Class Links</h1>
      <PlaceholderPanel
        title="Your Google Meet links"
        description="Live class links for your enrolled subjects will appear here. You'll see the subject name, teacher, scheduled time, and a one-click join button."
        icon={Video}
      />
    </div>
  );
}
