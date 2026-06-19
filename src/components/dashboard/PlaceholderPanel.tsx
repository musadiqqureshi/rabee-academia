import type { LucideIcon } from "lucide-react";

interface PlaceholderPanelProps {
  title: string;
  description: string;
  icon: LucideIcon;
}

// Stage 1 scaffolding placeholder. Replaced by real data tables/forms in
// later stages.
export default function PlaceholderPanel({
  title,
  description,
  icon: Icon,
}: PlaceholderPanelProps) {
  return (
    <div className="bg-card border border-card-border rounded-xl p-8 flex flex-col items-center justify-center text-center min-h-[260px]">
      <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-muted-foreground mb-4">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="font-semibold mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm">{description}</p>
      <span className="mt-4 text-xs font-medium px-2.5 py-1 rounded-full bg-muted text-muted-foreground">
        Coming soon
      </span>
    </div>
  );
}
