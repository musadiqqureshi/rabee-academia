"use client";

import { Printer } from "lucide-react";

export default function PrintButton({ label = "Print / Save PDF" }: { label?: string }) {
  return (
    <button
      onClick={() => window.print()}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 print:hidden"
    >
      <Printer className="w-4 h-4" /> {label}
    </button>
  );
}
