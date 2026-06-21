"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, FileText } from "lucide-react";
import Navbar from "@/components/Navbar";
import EnforceTheme from "@/components/EnforceTheme";
import { createClient } from "@/lib/supabase/client";
import PaperMakerClient from "@/components/paper/PaperMakerClient";

export default function PaperMakerPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.replace(`/login?redirectedFrom=${encodeURIComponent("/products/paper-maker")}`);
        return;
      }
      setReady(true);
    });
  }, [router]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <EnforceTheme mode="site" />
      <div className="no-print"><Navbar /></div>

      <div className="pt-24 pb-16 container mx-auto px-4 md:px-6">
        <div className="no-print mb-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-fuchsia-600 to-indigo-600 text-white grid place-items-center"><FileText className="w-5 h-5" /></div>
          <div>
            <h1 className="text-2xl font-extrabold leading-tight">Rabee&apos;s AI Paper Maker</h1>
            <p className="text-sm text-muted-foreground">Generate an exam paper with answer key — free once a day.</p>
          </div>
        </div>

        {ready ? (
          <PaperMakerClient />
        ) : (
          <div className="min-h-[300px] grid place-items-center">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        )}
      </div>
    </div>
  );
}
