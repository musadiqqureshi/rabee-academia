import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SEED_SECRET = process.env.SEED_SECRET ?? "rabee-seed-2024";

const TEST_USERS = [
  {
    email: "superadmin@rabee.test",
    password: "TestPass123!",
    full_name: "Rabee Super Admin",
    role: "super_admin",
  },
  {
    email: "admin@rabee.test",
    password: "TestPass123!",
    full_name: "Rabee Admin",
    role: "admin",
  },
  {
    email: "teacher@rabee.test",
    password: "TestPass123!",
    full_name: "Dr. Sarah Teacher",
    role: "teacher",
  },
  {
    email: "student1@rabee.test",
    password: "TestPass123!",
    full_name: "Ahmed Student",
    role: "student",
  },
  {
    email: "student2@rabee.test",
    password: "TestPass123!",
    full_name: "Ayesha Student",
    role: "student",
  },
];

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (token !== SEED_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json(
      {
        error:
          "SUPABASE_SERVICE_ROLE_KEY is not set. Add it to .env.local and Vercel dashboard.",
      },
      { status: 500 }
    );
  }

  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const results: { email: string; status: string; error?: string }[] = [];

  for (const user of TEST_USERS) {
    try {
      // Create auth user (email_confirm: true skips verification email)
      const { data: authData, error: authError } =
        await admin.auth.admin.createUser({
          email: user.email,
          password: user.password,
          email_confirm: true,
          user_metadata: { full_name: user.full_name },
        });

      if (authError) {
        // User may already exist
        results.push({ email: user.email, status: "skipped", error: authError.message });
        continue;
      }

      const userId = authData.user.id;

      // Upsert profile with role
      const { error: profileError } = await admin
        .from("profiles")
        .upsert({
          id: userId,
          email: user.email,
          full_name: user.full_name,
          role: user.role,
        });

      if (profileError) {
        results.push({ email: user.email, status: "auth_ok_profile_failed", error: profileError.message });
      } else {
        results.push({ email: user.email, status: "created" });
      }
    } catch (err) {
      results.push({ email: user.email, status: "error", error: String(err) });
    }
  }

  return NextResponse.json({
    results,
    credentials: TEST_USERS.map((u) => ({
      email: u.email,
      password: u.password,
      role: u.role,
    })),
  });
}
