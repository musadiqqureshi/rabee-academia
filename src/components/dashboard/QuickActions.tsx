import Link from "next/link";
import type { LucideIcon } from "lucide-react";

export interface QuickAction { href: string; label: string; icon: LucideIcon; tone: string }

// Grid of colorful quick-action tiles.
export default function QuickActions({ items, title = "Quick actions" }: { items: QuickAction[]; title?: string }) {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-3">{title}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {items.map(({ href, label, icon: Icon, tone }) => (
          <Link key={href + label} href={href}
            className="group bg-card border border-card-border rounded-2xl p-4 flex flex-col items-center gap-2.5 hover:-translate-y-0.5 hover:shadow-md transition-all">
            <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${tone} text-white grid place-items-center shadow-sm group-hover:scale-105 transition-transform`}>
              <Icon className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-center leading-tight">{label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
