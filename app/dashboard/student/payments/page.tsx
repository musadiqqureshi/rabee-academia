import Link from "next/link";
import { Wallet, ArrowRight } from "lucide-react";
import PlaceholderPanel from "@/components/dashboard/PlaceholderPanel";

export default function StudentPayments() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Payments</h1>
        <Link
          href="/pricing"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-primary to-accent text-white text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          Enroll in a subject <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
      <PlaceholderPanel
        title="Payment history"
        description="Your monthly fee payments, status (paid / pending / overdue), and payment receipts will appear here after enrollment is verified by admin."
        icon={Wallet}
      />
    </div>
  );
}
