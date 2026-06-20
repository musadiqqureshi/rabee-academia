import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  hint?: string;
}

export default function StatCard({ label, value, icon: Icon, hint }: StatCardProps) {
  return (
    <div className="group relative bg-card border border-card-border rounded-2xl p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_30px_-8px_rgba(37,99,235,0.35)] hover:border-primary/40 overflow-hidden">
      {/* glow on hover */}
      <div className="pointer-events-none absolute -inset-px rounded-2xl bg-gradient-to-br from-primary/0 via-primary/0 to-accent/0 group-hover:from-primary/5 group-hover:to-accent/10 transition-colors" />
      <div className="relative flex items-center justify-between mb-3">
        <span className="text-sm text-muted-foreground">{label}</span>
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform">
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <p className="relative text-2xl font-bold">{value}</p>
      {hint && <p className="relative text-xs text-muted-foreground mt-1">{hint}</p>}
    </div>
  );
}
