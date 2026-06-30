import type { LucideIcon } from "lucide-react";

// A bold, colorful stat card (gradient background + white text).
export default function GradientStatCard({
  label, value, icon: Icon, tone, hint,
}: { label: string; value: string | number; icon: LucideIcon; tone: string; hint?: string }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${tone} p-5 text-white shadow-lg`}>
      <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-white/10" />
      <div className="relative flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-white/85">{label}</p>
          <p className="text-2xl font-extrabold mt-1.5">{value}</p>
          {hint && <p className="text-[11px] text-white/80 mt-1">{hint}</p>}
        </div>
        <div className="w-10 h-10 rounded-xl bg-white/20 grid place-items-center shrink-0"><Icon className="w-5 h-5" /></div>
      </div>
    </div>
  );
}
