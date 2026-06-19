import { Atom } from "lucide-react";
import { INVOICE_CATEGORY_LABEL, type Invoice, type InvoiceCategory, type InvoiceStatus } from "@/lib/supabase/types";

interface Props {
  invoice: Invoice;
  studentName: string;
  studentCode: string;
  subjectName?: string | null;
}

const statusStyle: Record<InvoiceStatus, string> = {
  draft: "bg-gray-100 text-gray-600",
  issued: "bg-blue-100 text-blue-700",
  paid: "bg-emerald-100 text-emerald-700",
  overdue: "bg-red-100 text-red-700",
  cancelled: "bg-gray-100 text-gray-500 line-through",
};

const fmt = (n: number) => "PKR " + n.toLocaleString("en-PK");

export default function InvoiceDocument({ invoice, studentName, studentCode, subjectName }: Props) {
  return (
    <div className="bg-white text-gray-900 rounded-2xl border border-gray-200 shadow-sm p-8 max-w-2xl mx-auto print:shadow-none print:border-0">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 border-b border-gray-200 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-blue-600 text-white grid place-items-center">
            <Atom className="w-6 h-6" />
          </div>
          <div>
            <p className="font-bold text-lg leading-tight">Rabee Academia</p>
            <p className="text-xs text-gray-500">Premier Online Academy · Pakistan</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xl font-extrabold tracking-tight">INVOICE</p>
          <p className="text-sm text-gray-500">{invoice.invoice_number}</p>
        </div>
      </div>

      {/* Meta */}
      <div className="grid grid-cols-2 gap-4 mt-5 text-sm">
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">Billed to</p>
          <p className="font-semibold">{studentName}</p>
          <p className="text-gray-500">Student ID: {studentCode}</p>
        </div>
        <div className="text-right">
          <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">Details</p>
          <p>Issued: {new Date(invoice.issued_at).toLocaleDateString()}</p>
          <p>Due: {invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : "—"}</p>
          <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyle[invoice.status]}`}>
            {invoice.status.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Line items */}
      <table className="w-full mt-6 text-sm">
        <thead>
          <tr className="border-y border-gray-200 text-left text-xs text-gray-500">
            <th className="py-2 font-medium">Description</th>
            <th className="py-2 font-medium text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-gray-100">
            <td className="py-3">
              <p className="font-medium">{INVOICE_CATEGORY_LABEL[invoice.category as InvoiceCategory]}</p>
              {subjectName && <p className="text-gray-500 text-xs">{subjectName}</p>}
              {invoice.description && <p className="text-gray-500 text-xs">{invoice.description}</p>}
            </td>
            <td className="py-3 text-right font-medium">{fmt(invoice.amount_pkr)}</td>
          </tr>
        </tbody>
      </table>

      <div className="flex justify-end mt-4">
        <div className="w-56 text-sm">
          <div className="flex justify-between py-1 text-gray-500"><span>Subtotal</span><span>{fmt(invoice.amount_pkr)}</span></div>
          <div className="flex justify-between py-2 border-t border-gray-200 font-bold text-base">
            <span>Total</span><span>{fmt(invoice.amount_pkr)}</span>
          </div>
        </div>
      </div>

      <p className="mt-8 text-xs text-gray-400 text-center border-t border-gray-100 pt-4">
        Thank you for studying with Rabee Academia. For payment queries, contact your academy administrator.
      </p>
    </div>
  );
}
