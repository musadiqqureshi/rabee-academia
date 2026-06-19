import { Video } from "lucide-react";
import PlaceholderPanel from "@/components/dashboard/PlaceholderPanel";

export default function AdminClasses() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Class Links</h1>
      <PlaceholderPanel
        title="Google Meet management"
        description="Create and distribute Google Meet links for each batch. Students see their links in their dashboard; teachers see theirs in the teacher dashboard."
        icon={Video}
      />
    </div>
  );
}
