"use client";

import { type ReactNode, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, ArrowLeft, ShieldCheck } from "lucide-react";
import Navbar from "@/components/Navbar";
import EnforceTheme from "@/components/EnforceTheme";
import { createClient } from "@/lib/supabase/client";

// Auth-gated shell shared by every Rabee's AI tool page.
export default function ToolShell({
  title, subtitle, icon, gradient = "from-fuchsia-600 to-indigo-600", badge = "beta", children,
}: {
  title: string; subtitle: string; icon: ReactNode; gradient?: string; badge?: "beta" | "guaranteed"; children: ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.replace(`/login?redirectedFrom=${encodeURIComponent(pathname)}`); return; }
      setReady(true);
    });
  }, [router, pathname]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <EnforceTheme mode="site" />
      <div className="no-print"><Navbar /></div>

      <div className="pt-24 pb-16 container mx-auto px-4 md:px-6">
        <div className="no-print mb-6">
          <Link href="/products" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"><ArrowLeft className="w-4 h-4" /> All AI tools</Link>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} text-white grid place-items-center`}>{icon}</div>
            <div>
              <h1 className="text-2xl font-extrabold leading-tight flex items-center gap-2">
                {title}
                {badge === "guaranteed" ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 text-[10px] font-bold uppercase tracking-wide border border-emerald-500/30"><ShieldCheck className="w-3 h-3" /> 100% Guaranteed</span>
                ) : (
                  <span className="px-1.5 py-0.5 rounded-full bg-amber-400/20 text-amber-600 text-[10px] font-bold uppercase tracking-wide border border-amber-400/30">Beta</span>
                )}
              </h1>
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            </div>
          </div>
        </div>

        {ready ? children : (
          <div className="min-h-[300px] grid place-items-center"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
        )}
      </div>
    </div>
  );
}
