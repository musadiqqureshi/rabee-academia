import { redirect } from "next/navigation";
import { getProfile } from "@/lib/auth";
import { ROLE_HOME } from "@/lib/supabase/types";

// Entry point for /dashboard — routes each user to their role-specific home.
export default async function DashboardIndex() {
  const profile = await getProfile();
  if (!profile) redirect("/login");
  redirect(ROLE_HOME[profile.role]);
}
