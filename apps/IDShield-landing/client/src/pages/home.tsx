import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import PrivacyLevelsSection from "@/components/PrivacyLevelsSection";
import UseCasesSection from "@/components/UseCasesSection";
import ACESection from "@/components/ACESection";
import MarketplaceSection from "@/components/MarketplaceSection";
import AccessRequestsSection from "@/components/AccessRequestsSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";
import SkipToContent from "@/components/SkipToContent";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-bg dark">
      <SkipToContent />
      <Navigation />
      <main id="main-content" role="main">
        <HeroSection />
        <HowItWorksSection />
        <PrivacyLevelsSection />
        <UseCasesSection />
        <ACESection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
}
