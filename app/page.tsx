import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import ServicesSection from "@/components/ServicesSection";
import ArtistSection from "@/components/ArtistSection";
import ContactSection from "@/components/ContactPage";
import Footer from "@/components/Footer";
import CustomCursor from "@/components/CustomCursor";
import { getSiteImages } from "@/lib/site-images";

export const metadata: Metadata = {
  title: "Shear Madness Hoboken | Premium Hair Salon for Men & Women",
  description:
    "Shear Madness Hoboken is a premium hair salon for men and women in Hoboken, NJ, offering haircuts, styling, color, treatments, bridal services, and online appointment booking.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Shear Madness Hoboken | Premium Hair Salon for Men & Women",
    description:
      "Shear Madness Hoboken is a premium hair salon for men and women in Hoboken, NJ, offering haircuts, styling, color, treatments, bridal services, and online appointment booking.",
    url: "/",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "HairSalon",
  name: "Shear Madness Hoboken",
  description:
    "Premium hair salon for men and women in Hoboken, NJ offering haircuts, color, treatments, and bridal services.",
  url: "https://shearmadnesshoboken.com",
  telephone: "(201) 222-2102",
  priceRange: "$$",
  address: {
    "@type": "PostalAddress",
    streetAddress: "80 Park Ave #1",
    addressLocality: "Hoboken",
    addressRegion: "NJ",
    postalCode: "07030",
    addressCountry: "US",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 40.744,
    longitude: -74.0324,
  },
  hasMap: "https://maps.google.com/?q=80+Park+Ave+%231+Hoboken+NJ+07030",
  image: "https://shearmadnesshoboken.com/og-image.jpg",
  sameAs: ["https://shearmadnesshoboken.com"],
};

export default async function Home() {
  const imgs = await getSiteImages();

  return (
    <main className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
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
