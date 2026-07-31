import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import SocialProofBar from "@/components/landing/SocialProofBar";
import FeaturesGrid from "@/components/landing/FeaturesGrid";
import ArchitectureSection from "@/components/landing/ArchitectureSection";
import FinalCTASection from "@/components/landing/FinalCTASection";
import Footer from "@/components/landing/Footer";

export default function LandingPage() {
  return (
    <main className="bg-slate-900 font-sans antialiased">
      <Navbar />
      <HeroSection />
      <SocialProofBar />
      <FeaturesGrid />
      <ArchitectureSection />
      <FinalCTASection />
      <Footer />
    </main>
  );
}