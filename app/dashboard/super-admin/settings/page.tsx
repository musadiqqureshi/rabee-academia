import { Settings } from "lucide-react";
import PlaceholderPanel from "@/components/dashboard/PlaceholderPanel";

export default function SuperAdminSettings() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Platform Settings</h1>
      <PlaceholderPanel
        title="System configuration"
        description="Configure AssanPay API keys, IBAN bank details shown on the enrollment page, email notification templates, and other platform-wide settings."
        icon={Settings}
      />
    </div>
  );
}
