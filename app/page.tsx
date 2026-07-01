import TopBanner from "@/components/TopBanner";
import Navbar from "@/components/Navbar";
import AnimatedBackground from "@/components/AnimatedBackground";
import EnforceTheme from "@/components/EnforceTheme";
import RabeeAIWidget from "@/components/RabeeAIWidget";
import WhatsAppCommunityPopup from "@/components/WhatsAppCommunityPopup";
import HeroSection from "@/components/HeroSection";
import StatsSection from "@/components/StatsSection";
import PartnersMarquee from "@/components/PartnersMarquee";
import AISection from "@/components/AISection";
import AIMasterySection from "@/components/AIMasterySection";
import SubjectsSection from "@/components/SubjectsSection";
import LeadershipSection from "@/components/LeadershipSection";
import CountriesSection from "@/components/CountriesSection";
import ReviewsMarquee from "@/components/ReviewsMarquee";
import HowItWorksSection from "@/components/HowItWorksSection";
import JoinInstructorSection from "@/components/JoinInstructorSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";

export default async function HomePage() {
  return (
    <div className="min-h-screen text-foreground overflow-x-hidden">
      <EnforceTheme mode="site" />
      {/* Animated aurora + particle background (fixed, behind everything) */}
      <AnimatedBackground />

      {/* Fixed header: banner + navbar stacked */}
      <div className="fixed top-0 inset-x-0 z-50 flex flex-col">
        <TopBanner />
        <Navbar />
      </div>

      <div className="relative">
        <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[700px] bg-primary/12 rounded-full blur-[140px]" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[400px] bg-accent/10 rounded-full blur-[120px]" />
          <div className="absolute top-1/4 right-0 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px]" />
        </div>

        <HeroSection />
        <StatsSection />
        <PartnersMarquee />
      </div>

      <AIMasterySection />
      <AISection />
      <SubjectsSection />
      <LeadershipSection />
      <CountriesSection />
      <ReviewsMarquee />
      <HowItWorksSection />
      <JoinInstructorSection />
      <CTASection />
      <Footer />
      <RabeeAIWidget />
      <WhatsAppCommunityPopup />
    </div>
  );
}
