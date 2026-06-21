import Link from "next/link";
import type { Metadata } from "next";
import { FileText, Sparkles, ArrowRight, Check } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import EnforceTheme from "@/components/EnforceTheme";

export const metadata: Metadata = {
  title: "Rabee's AI Products — AI Paper Maker",
  description: "Rabee's AI tools for students and teachers. Generate professional exam papers with answer keys — free once a day.",
};

export default function ProductsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <EnforceTheme mode="site" />
      <Navbar />

      <div className="pt-28 pb-20 container mx-auto px-4 md:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-medium text-foreground/80">Rabee&apos;s AI Products</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold mb-3">AI tools for teachers &amp; students</h1>
          <p className="text-muted-foreground text-sm md:text-base">Smart, time-saving tools powered by Rabee&apos;s AI. Free to try — one paper every day.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Paper Maker */}
          <div className="rounded-2xl border border-border bg-card overflow-hidden flex flex-col">
            <div className="h-28 bg-gradient-to-br from-fuchsia-600 via-purple-600 to-indigo-600 flex items-center justify-center">
              <div className="w-14 h-14 rounded-xl bg-white/15 backdrop-blur-sm grid place-items-center border border-white/20">
                <FileText className="w-7 h-7 text-white" />
              </div>
            </div>
            <div className="p-6 flex flex-col flex-1">
              <h2 className="font-bold text-lg mb-1">Rabee&apos;s AI Paper Maker</h2>
              <p className="text-sm text-muted-foreground mb-4">Generate clean, professionally formatted exam papers with a complete answer key. Print or save as PDF in seconds.</p>
              <ul className="space-y-1.5 mb-5 text-sm text-foreground/75">
                {["MCQ, short, long & numerical questions", "Perfect math rendering (KaTeX)", "Answer key included", "Print / Save as PDF", "English & Urdu"].map((f) => (
                  <li key={f} className="flex items-start gap-2"><Check className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" /> {f}</li>
                ))}
              </ul>
              <div className="mt-auto flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-600">Free · 1 paper / day</span>
                <Link href="/products/paper-maker" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-primary to-accent text-white text-sm font-bold hover:opacity-90">
                  Open <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>

          {/* Coming soon placeholder */}
          <div className="rounded-2xl border border-dashed border-border bg-card/40 p-6 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-xl bg-muted grid place-items-center mb-3"><Sparkles className="w-6 h-6 text-muted-foreground" /></div>
            <p className="font-semibold">More AI tools coming soon</p>
            <p className="text-sm text-muted-foreground mt-1">Lesson planners, worksheet makers and more.</p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
