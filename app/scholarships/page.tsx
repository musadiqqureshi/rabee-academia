import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import EnforceTheme from "@/components/EnforceTheme";
import ScholarshipPortal from "./ScholarshipPortal";

export const metadata: Metadata = {
  title: "Need-Based Scholarships — Financial Aid | Rabee Academia",
  description:
    "Can't afford the full fee? Apply for a Rabee Academia need-based scholarship. Deserving students get a monthly fee reduction so cost never blocks quality education.",
  alternates: { canonical: "/scholarships" },
  openGraph: {
    title: "Need-Based Scholarships | Rabee Academia",
    description: "Apply for financial aid — deserving students get a monthly fee reduction on their courses.",
    url: "/scholarships",
    type: "website",
    siteName: "Rabee Academia",
    images: [{ url: "/opengraph.jpg", width: 1200, height: 630, alt: "Rabee Academia" }],
  },
};

export default function ScholarshipsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <EnforceTheme mode="site" />
      <Navbar />
      <div className="pt-28 pb-20 container mx-auto px-4 md:px-6 max-w-3xl">
        <ScholarshipPortal />
      </div>
      <Footer />
    </div>
  );
}
