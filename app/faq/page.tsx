import type { Metadata } from "next";
import Link from "next/link";
import { HelpCircle, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import EnforceTheme from "@/components/EnforceTheme";
import { FAQ_ITEMS } from "@/lib/faq";

const SITE_URL = "https://rabeeacademia.site";

export const metadata: Metadata = {
  title: "FAQ — Courses, Fees, Demo & Enrollment | Rabee Academia",
  description:
    "Answers about Rabee Academia: one-on-one online classes for FSc, O/A Levels, BS & MS, fees and the 20% first-course discount, the free AI Mastery Course, free demo classes, payments and certificates.",
  alternates: { canonical: "/faq" },
  openGraph: {
    title: "FAQ — Rabee Academia",
    description: "Answers about courses, fees, the free AI Mastery Course, demos, payments and certificates.",
    url: "/faq",
    type: "website",
    siteName: "Rabee Academia",
    images: [{ url: "/opengraph.jpg", width: 1200, height: 630, alt: "Rabee Academia" }],
  },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ_ITEMS.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export default function FaqPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <EnforceTheme mode="site" />
      <Navbar />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      <div className="pt-28 pb-20 container mx-auto px-4 md:px-6 max-w-3xl">
        <div className="text-center mb-10">
          <div className="w-12 h-12 rounded-xl bg-primary/15 text-primary grid place-items-center mx-auto mb-3">
            <HelpCircle className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-extrabold">Frequently Asked Questions</h1>
          <p className="text-sm text-muted-foreground mt-2">Everything about courses, fees, demos, enrollment and certificates at Rabee Academia.</p>
        </div>

        <div className="space-y-3">
          {FAQ_ITEMS.map((f) => (
            <details key={f.q} className="group rounded-2xl border border-border bg-card p-5 open:shadow-md transition-shadow">
              <summary className="flex items-center justify-between gap-3 cursor-pointer list-none font-semibold">
                {f.q}
                <ArrowRight className="w-4 h-4 text-muted-foreground group-open:rotate-90 transition-transform shrink-0" />
              </summary>
              <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{f.a}</p>
            </details>
          ))}
        </div>

        <div className="mt-10 text-center">
          <p className="text-sm text-muted-foreground mb-3">Still have a question?</p>
          <Link href="/demo" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-accent text-white text-sm font-bold hover:opacity-90">
            Book a Free Demo Class <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
}
