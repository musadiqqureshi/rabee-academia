import { Wallet } from "lucide-react";
import PlaceholderPanel from "@/components/dashboard/PlaceholderPanel";

export default function SuperAdminPayments() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Payments & Revenue</h1>
      <PlaceholderPanel
        title="Financial overview"
        description="View all fee transactions — AssanPay payments and IBAN receipts. Approve pending receipts, track monthly revenue, and export financial reports."
        icon={Wallet}
      />
    </div>
  );
}
