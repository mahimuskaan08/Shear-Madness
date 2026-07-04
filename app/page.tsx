import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import ServicesSection from "@/components/ServicesSection";
import ArtistSection from "@/components/ArtistSection";
import ContactSection from "@/components/ContactPage";
import Footer from "@/components/Footer";
import CustomCursor from "@/components/CustomCursor";
import { getSiteData, buildFooterHours } from "@/lib/site-data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Shear Madness Hoboken | Hair Salon for Men & Women",
  description:
    "Shear Madness Hoboken is a premium hair salon for men and women in Hoboken, NJ, offering haircuts, styling, color, treatments, bridal services, and online appointment booking.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Shear Madness Hoboken | Hair Salon for Men & Women",
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
  const data = await getSiteData();
  const contact = data.contact;
  const footerHours = buildFooterHours(data.hours);
  const heroBg = data.backgrounds.find(b => b.section === "hero_desktop")?.image_url ?? undefined;

  return (
    <main className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <CustomCursor />
      <Navbar />
      <HeroSection bgImage={heroBg} />
      <AboutSection />
      <ServicesSection />
      <ArtistSection />
      <ContactSection />
      <Footer
        phone={contact?.phone || undefined}
        email={contact?.email || undefined}
        addressLine1={contact?.address_line_1 || undefined}
        cityStateZip={contact?.city_state_zip || undefined}
        hoursTueThu={footerHours.hoursTueThu}
        hoursFri={footerHours.hoursFri}
        hoursSat={footerHours.hoursSat}
        hoursSunMon={footerHours.hoursSunMon}
      />
    </main>
  );
}
