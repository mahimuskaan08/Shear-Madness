import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import ServicesSection from "@/components/ServicesSection";
import ArtistSection from "@/components/ArtistSection";
import ContactSection from "@/components/ContactPage";
import Footer from "@/components/Footer";
import CustomCursor from "@/components/CustomCursor";
import { getSiteImages } from "@/lib/site-images";

export default async function Home() {
  const imgs = await getSiteImages();

  return (
    <main className="min-h-screen">
      <CustomCursor />
      <Navbar />
      <HeroSection bgImage={imgs.hero_background_image ?? undefined} />
      <AboutSection
        bgImage={imgs.about_background_image ?? undefined}
        carouselImages={imgs.about_us_images.length > 0 ? imgs.about_us_images : undefined}
      />
      <ServicesSection />
      <ArtistSection
        artistBg={imgs.artist_background_image ?? undefined}
        oscarImage={imgs.oscar_artist_image ?? undefined}
        georgeImage={imgs.george_artist_image ?? undefined}
      />
      <ContactSection bgImage={imgs.contact_background_image ?? undefined} />
      <Footer />
    </main>
  );
}
