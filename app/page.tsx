import TopBanner from "@/components/TopBanner";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import StatsSection from "@/components/StatsSection";
import PartnersMarquee from "@/components/PartnersMarquee";
import AISection from "@/components/AISection";
import ProgramsSection from "@/components/ProgramsSection";
import SubjectsSection from "@/components/SubjectsSection";
import LeadershipSection from "@/components/LeadershipSection";
import CountriesSection from "@/components/CountriesSection";
import ReviewsMarquee from "@/components/ReviewsMarquee";
import HowItWorksSection from "@/components/HowItWorksSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <TopBanner />
      <Navbar />

      <div className="relative">
        <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[700px] bg-primary/12 rounded-full blur-[140px]" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[400px] bg-accent/10 rounded-full blur-[120px]" />
          <div className="absolute top-1/4 right-0 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px]" />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(135deg, rgba(99,102,241,0.06) 0%, rgba(6,182,212,0.04) 50%, rgba(99,102,241,0.06) 100%)",
            }}
          />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/20 to-transparent" />
        </div>

        <HeroSection />
        <StatsSection />
        <PartnersMarquee />
      </div>

      <AISection />
      <ProgramsSection />
      <SubjectsSection />
      <LeadershipSection />
      <CountriesSection />
      <ReviewsMarquee />
      <HowItWorksSection />
      <CTASection />
      <Footer />
    </div>
  );
}
