import React from "react";
import TopBanner from "../components/TopBanner";
import Navbar from "../components/Navbar";
import HeroSection from "../components/HeroSection";
import StatsSection from "../components/StatsSection";
import PartnersMarquee from "../components/PartnersMarquee";
import AISection from "../components/AISection";
import ProgramsSection from "../components/ProgramsSection";
import SubjectsSection from "../components/SubjectsSection";
import PricingSection from "../components/PricingSection";
import LeadershipSection from "../components/LeadershipSection";
import CountriesSection from "../components/CountriesSection";
import ReviewsMarquee from "../components/ReviewsMarquee";
import HowItWorksSection from "../components/HowItWorksSection";
import CTASection from "../components/CTASection";
import Footer from "../components/Footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <TopBanner />
      <Navbar />
      <HeroSection />
      <StatsSection />
      <PartnersMarquee />
      <AISection />
      <ProgramsSection />
      <SubjectsSection />
      <PricingSection />
      <LeadershipSection />
      <CountriesSection />
      <ReviewsMarquee />
      <HowItWorksSection />
      <CTASection />
      <Footer />
    </div>
  );
}
