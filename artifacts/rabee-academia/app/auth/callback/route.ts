import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ROLE_HOME, type UserRole } from "@/lib/supabase/types";

// Exchanges the email-confirmation / OAuth code for a session, then routes the
// user to their role-specific dashboard.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next");

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      if (next) return NextResponse.redirect(`${origin}${next}`);
      const role = (data.user?.app_metadata?.role ??
        data.user?.user_metadata?.role) as UserRole | undefined;
      return NextResponse.redirect(
        `${origin}${role ? ROLE_HOME[role] : "/dashboard/student"}`,
      );
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
