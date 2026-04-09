import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import ServicesSection from "@/components/ServicesSection";
import ArtistSection from "@/components/ArtistSection";
import ContactSection from "@/components/ContactPage";
import Footer from "@/components/Footer";
import CustomCursor from "@/components/CustomCursor";

export default function Home() {
  return (
    <main className="min-h-screen">
      <CustomCursor />
      <Navbar />
      <HeroSection />
      <AboutSection />
      <ServicesSection />
      <ArtistSection />
      <ContactSection />
      <Footer />
    </main>
  );
}
