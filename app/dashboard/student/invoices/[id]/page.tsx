import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import InvoiceDocument from "@/components/InvoiceDocument";
import PrintButton from "@/components/PrintButton";
import type { Invoice } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

export default async function StudentInvoiceView({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profile = await requireRole("student");
  const supabase = await createClient();

  const { data: invoice } = await supabase
    .from("invoices")
    .select("*, subjects ( name )")
    .eq("id", id)
    .eq("student_id", profile.id)
    .single();
  if (!invoice) notFound();

  const subj = invoice.subjects as unknown as { name: string } | null;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between print:hidden">
        <Link href="/dashboard/student/invoices" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" /> Back to invoices
        </Link>
        <PrintButton />
      </div>
      <InvoiceDocument
        invoice={invoice as Invoice}
        studentName={profile.full_name ?? "Student"}
        studentCode={profile.student_code ?? "—"}
        subjectName={subj?.name}
      />
    </div>
  );
}
