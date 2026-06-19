import { FileText } from "lucide-react";
import PlaceholderPanel from "@/components/dashboard/PlaceholderPanel";

export default function TeacherMaterials() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Materials & Assignments</h1>
      <PlaceholderPanel
        title="Upload & manage content"
        description="Upload PDF notes, slides, and assignments for your students. Students will see new material in their Resources section."
        icon={FileText}
      />
    </div>
  );
}
