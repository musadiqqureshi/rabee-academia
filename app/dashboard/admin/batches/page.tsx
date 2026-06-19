import { BookOpen } from "lucide-react";
import PlaceholderPanel from "@/components/dashboard/PlaceholderPanel";

export default function AdminBatches() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Batches</h1>
      <PlaceholderPanel
        title="Regular & weekend batches"
        description="Create and manage class batches. Assign a subject, teacher, batch type (regular/weekend), and Google Meet link. Students are then added to the batch."
        icon={BookOpen}
      />
    </div>
  );
}
