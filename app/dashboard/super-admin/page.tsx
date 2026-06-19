import { Users, GraduationCap, BookOpen, Wallet, UserCog, User } from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export default async function SuperAdminOverview() {
  await requireRole("super_admin");
  const supabase = await createClient();

  const [
    { count: totalUsers },
    { count: studentCount },
    { count: teacherCount },
    { count: adminCount },
    { count: activeSubjects },
    { count: activeBatches },
    { data: revenueData },
  ] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "student"),
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "teacher"),
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "admin"),
    supabase.from("subjects").select("id", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("batches").select("id", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("payments").select("amount").eq("status", "paid"),
  ]);

  const totalRevenue = revenueData?.reduce((sum, p) => sum + (p.amount ?? 0), 0) ?? 0;

  const roleCards = [
    { label: "Total Users", value: totalUsers ?? 0, icon: Users, hint: "All roles" },
    { label: "Students", value: studentCount ?? 0, icon: User },
    { label: "Teachers", value: teacherCount ?? 0, icon: UserCog },
    { label: "Admins", value: adminCount ?? 0, icon: GraduationCap },
    { label: "Active Subjects", value: activeSubjects ?? 0, icon: BookOpen },
    { label: "Active Batches", value: activeBatches ?? 0, icon: GraduationCap },
    { label: "Total Revenue", value: `$${totalRevenue.toLocaleString()}`, icon: Wallet, hint: "Paid payments" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold">Platform Overview</h1>
      <p className="text-sm text-muted-foreground mt-1">Super admin dashboard — full platform visibility</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mt-6">
        {roleCards.map((card) => (
          <StatCard key={card.label} label={card.label} value={card.value} icon={card.icon} hint={card.hint} />
        ))}
      </div>
    </div>
  );
}
