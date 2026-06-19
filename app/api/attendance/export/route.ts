import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/auth";

// CSV export of attendance the current user is allowed to see (RLS-enforced).
// Optional ?month=YYYY-MM filter (on marked_at).
export async function GET(req: NextRequest) {
  const profile = await getProfile();
  if (!profile) return new NextResponse("Unauthorized", { status: 401 });

  const supabase = await createClient();
  const month = req.nextUrl.searchParams.get("month"); // e.g. 2026-06

  let query = supabase
    .from("attendance")
    .select(`
      status, marked_at,
      profiles ( full_name, student_code ),
      schedules ( day_of_week, batches ( subjects ( name ) ) )
    `)
    .order("marked_at", { ascending: false });

  if (month && /^\d{4}-\d{2}$/.test(month)) {
    const [y, m] = month.split("-").map(Number);
    const start = new Date(Date.UTC(y, m - 1, 1)).toISOString();
    const end = new Date(Date.UTC(y, m, 1)).toISOString();
    query = query.gte("marked_at", start).lt("marked_at", end);
  }

  const { data, error } = await query;
  if (error) return new NextResponse(error.message, { status: 500 });

  const esc = (v: unknown) => {
    const s = String(v ?? "");
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };

  const header = ["Date", "Student", "Student ID", "Subject", "Day", "Status"];
  const rows = (data ?? []).map((r) => {
    const p = r.profiles as unknown as { full_name: string | null; student_code: string | null } | null;
    const sch = r.schedules as unknown as { day_of_week: string | null; batches: { subjects: { name: string } | null } | null } | null;
    const subject = sch?.batches?.subjects?.name ?? "";
    const date = r.marked_at ? new Date(r.marked_at).toISOString().slice(0, 10) : "";
    return [date, p?.full_name ?? "", p?.student_code ?? "", subject, sch?.day_of_week ?? "", r.status]
      .map(esc)
      .join(",");
  });

  const csv = [header.join(","), ...rows].join("\n");
  const filename = `attendance${month ? `-${month}` : ""}.csv`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
