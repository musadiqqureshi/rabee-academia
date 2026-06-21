import { GraduationCap } from "lucide-react";

// Promo shown on every AI tool. Edit the text here to change it everywhere.
export const ENROL_PERK_TEXT =
  "Enrol in any course and unlock Rabee's AI Pro — free access to all AI tools.";

export default function EnrolPerk() {
  return (
    <div className="no-print flex items-start gap-2 rounded-lg border border-emerald-500/25 bg-emerald-500/10 px-3 py-2 text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
      <GraduationCap className="w-4 h-4 shrink-0 mt-0.5" />
      <span>{ENROL_PERK_TEXT}</span>
    </div>
  );
}
