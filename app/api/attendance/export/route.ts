import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/auth";

// CSV export of attendance the current user is allowed to see (RLS-enforced).
// Batch/date based. Optional ?month=YYYY-MM filter on session_date.
export async function GET(req: NextRequest) {
  const profile = await getProfile();
  if (!profile) return new NextResponse("Unauthorized", { status: 401 });

  const supabase = await createClient();
  const month = req.nextUrl.searchParams.get("month"); // e.g. 2026-06

  let query = supabase
    .from("attendance")
    .select(`
      session_date, status,
      profiles:student_id ( full_name, student_code ),
      batches:batch_id ( class_type, subjects:subject_id ( name ) )
    `)
    .order("session_date", { ascending: false });

  if (month && /^\d{4}-\d{2}$/.test(month)) {
    const [y, m] = month.split("-").map(Number);
    const start = `${month}-01`;
    const end = new Date(Date.UTC(y, m, 1)).toISOString().slice(0, 10);
    query = query.gte("session_date", start).lt("session_date", end);
  }

  const { data, error } = await query;
  if (error) return new NextResponse(error.message, { status: 500 });

  const esc = (v: unknown) => {
    const s = String(v ?? "");
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };

  const header = ["Date", "Student", "Student ID", "Subject", "Class", "Status"];
  const rows = (data ?? []).map((r) => {
    const p = r.profiles as unknown as { full_name: string | null; student_code: string | null } | null;
    const b = r.batches as unknown as { class_type: string | null; subjects: { name: string } | null } | null;
    return [r.session_date ?? "", p?.full_name ?? "", p?.student_code ?? "", b?.subjects?.name ?? "", b?.class_type ?? "", r.status]
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
