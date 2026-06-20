import { Settings, Server, Globe, Clock } from "lucide-react";
import { requireRole } from "@/lib/auth";

export default async function SuperAdminSettings() {
  await requireRole("admin");

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const maskedUrl = supabaseUrl
    ? supabaseUrl.replace(/https:\/\/([a-z0-9]+)\./, "https://***.")
    : "Not configured";

  const cards = [
    {
      icon: Server,
      label: "Supabase Project",
      value: maskedUrl,
      description: "Database and authentication provider",
    },
    {
      icon: Globe,
      label: "App Name",
      value: "Rabee Academia",
      description: "Platform display name",
    },
    {
      icon: Clock,
      label: "Timezone",
      value: "UTC",
      description: "Server timezone for scheduling",
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold">Platform Settings</h1>
      <p className="text-sm text-muted-foreground mt-1">System configuration and platform info</p>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {cards.map(({ icon: Icon, label, value, description }) => (
          <div key={label} className="bg-card border border-card-border rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-lg bg-primary/15 flex items-center justify-center text-primary">
                <Icon className="w-4 h-4" />
              </div>
              <p className="text-sm font-medium">{label}</p>
            </div>
            <p className="text-base font-semibold font-mono break-all">{value}</p>
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-muted/20 border border-border rounded-xl p-5">
        <div className="flex items-center gap-2 mb-2">
          <Settings className="w-4 h-4 text-muted-foreground" />
          <p className="text-sm font-medium text-muted-foreground">Configuration</p>
        </div>
        <p className="text-sm text-muted-foreground">
          Advanced settings such as payment gateway keys, email templates, and feature flags are managed via environment variables and Supabase dashboard. Editable settings UI is coming soon.
        </p>
      </div>
    </div>
  );
}
