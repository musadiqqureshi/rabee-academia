import { Video } from "lucide-react";
import PlaceholderPanel from "@/components/dashboard/PlaceholderPanel";

export default function TeacherClasses() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Class Links</h1>
      <PlaceholderPanel
        title="Google Meet links"
        description="Manage and share Google Meet links for your classes. Students will see these links in their own dashboards."
        icon={Video}
      />
    </div>
  );
}
