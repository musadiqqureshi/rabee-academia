import { FileText } from "lucide-react";
import PlaceholderPanel from "@/components/dashboard/PlaceholderPanel";

export default function StudentResources() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Study Resources</h1>
      <PlaceholderPanel
        title="Notes & materials"
        description="AI-generated study notes, past papers, assignments, and files uploaded by your teacher will be available here."
        icon={FileText}
      />
    </div>
  );
}
