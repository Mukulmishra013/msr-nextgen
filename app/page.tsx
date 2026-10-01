import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Services from '@/components/Services';
import BrandsWeManage from '@/components/BrandsWeManage';
import CaseStudy from '@/components/CaseStudy';
import AIAgentDemo from '@/components/AIAgentDemo';
import About from '@/components/About';
import FinalCTA from '@/components/FinalCTA';
import Footer from '@/components/Footer';
import StickyWhatsApp from '@/components/StickyWhatsApp';
import AIChatWidget from '@/components/AIChatWidget';
import ScrollRocket3D from '@/components/ScrollRocket3D';

export default function Home() {
  return (
    <div className="relative min-h-screen flex flex-col w-full overflow-x-hidden">
      {/* Navigation Header */}
      <Navbar />

      <main className="flex-1 w-full">
        {/* Section 1: Above-the-fold Hero */}
        <Hero />

        {/* Section 2: Flagship Services (Exactly 2 Cards) */}
        <Services />

        {/* Section 3: Brands We Manage (Social proof with verified Instagram links) */}
        <BrandsWeManage />

        {/* Section 4: Case Study / Proof (Amparo D2C with marked verification badges) */}
        <CaseStudy />

        {/* Section 5: AI WhatsApp Agent Interactive Simulation */}
        <AIAgentDemo />

        {/* Section 6: About the Founder & Operational Credibility */}
        <About />

        {/* Section 7: Final Conversion CTA & Backup Firestore Form */}
        <FinalCTA />
      </main>

      {/* Footer */}
      <Footer />

      {/* Floating 24/7 AI Chatbot Agent (Maya) */}
      <AIChatWidget />

      {/* Mobile-first Thumb-Zone Floating WhatsApp Action */}
      <StickyWhatsApp />

      {/* 3D Interactive Scroll Growth Rocket */}
      <ScrollRocket3D />
    </div>
  );
}
