import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import EnforceTheme from "@/components/EnforceTheme";
import InstructorPortal from "./InstructorPortal";

export const metadata: Metadata = {
  title: "Become an Instructor — Apply & Get Certified | Rabee Academia",
  description:
    "Join Rabee Academia as an instructor. Submit your application, pay the PKR 1,000 assessment fee, pass our AI-screened subject test, and interview with our team.",
  alternates: { canonical: "/instructor" },
};

export default function InstructorPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <EnforceTheme mode="site" />
      <Navbar />
      <div className="pt-28 pb-20 container mx-auto px-4 md:px-6 max-w-3xl">
        <InstructorPortal />
      </div>
      <Footer />
    </div>
  );
}
