import { requireRole } from "@/lib/auth";
import ProfileCard from "@/components/dashboard/ProfileCard";

export const dynamic = "force-dynamic";

export default async function AdminProfile() {
  const profile = await requireRole("admin");
  return (
    <div className="space-y-6 max-w-3xl">
      <ProfileCard profile={profile} />
      <p className="text-sm text-muted-foreground">You have full administrator access. Manage students, teachers, payroll, invoices and more from the sidebar.</p>
    </div>
  );
}
