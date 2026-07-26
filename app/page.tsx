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

export const revalidate = 10;

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

export default async function Home() {
  const data = await getSiteData();
  const contact = data.contact;
  const footerHours = buildFooterHours(data.hours);
  const bg = (primary: string, fallback?: string) =>
    (data.backgrounds.find(b => b.section === primary)?.image_url
      ?? (fallback ? data.backgrounds.find(b => b.section === fallback)?.image_url : null)
      ?? undefined) as string | undefined;

  const heroBg       = bg("hero_desktop");
  const heroBgMobile = bg("hero_mobile");
  const aboutBg      = bg("about_desktop",   "about");
  const artistBg     = bg("artist_desktop",  "artist");
  const contactBg    = bg("contact_desktop", "contact");
  const contactBgMobile = bg("contact_mobile");
  const servicesBg       = bg("services_desktop", "services");
  const servicesBgMobile = bg("services_mobile");
  const oscar  = data.team.find(m => m.name.toLowerCase().includes("oscar"));
  const george = data.team.find(m => m.name.toLowerCase().includes("george"));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "HairSalon",
    name: "Shear Madness Hoboken",
    description:
      "Premium hair salon for men and women in Hoboken, NJ offering haircuts, color, treatments, and bridal services.",
    url: "https://shearmadnesshoboken.com",
    telephone: contact?.phone || "(201) 222-2102",
    priceRange: "$$",
    address: {
      "@type": "PostalAddress",
      streetAddress: contact?.address_line_1 || "80 Park Ave #1",
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
    hasMap: contact?.google_maps_url || "https://maps.google.com/?q=80+Park+Ave+%231+Hoboken+NJ+07030",
    image: "https://shearmadnesshoboken.com/og-image.jpg",
    sameAs: ["https://shearmadnesshoboken.com"],
  };

  return (
    <main className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <CustomCursor />
      <Navbar />
      <HeroSection bgImage={heroBg} bgImageMobile={heroBgMobile} />
      <AboutSection
        bgImage={aboutBg}
      />
      <ServicesSection bgImage={servicesBg} bgImageMobile={servicesBgMobile} />
      <ArtistSection
        artistBg={artistBg}
        oscarImage={oscar?.image_url ?? undefined}
        georgeImage={george?.image_url ?? undefined}
        oscarBio={oscar?.bio ?? undefined}
        georgeBio={george?.bio ?? undefined}
      />
      <ContactSection
        bgImage={contactBg}
        bgImageMobile={contactBgMobile}
        phone={contact?.phone || undefined}
        email={contact?.email || undefined}
        addressLine1={contact?.address_line_1 || undefined}
        cityStateZip={contact?.city_state_zip || undefined}
        hoursTueThu={footerHours.hoursTueThu}
        hoursFri={footerHours.hoursFri}
        hoursSat={footerHours.hoursSat}
        hoursSunMon={footerHours.hoursSunMon}
        mapsUrl={contact?.google_maps_url || undefined}
      />
      <Footer
        phone={contact?.phone || undefined}
        email={contact?.email || undefined}
        addressLine1={contact?.address_line_1 || undefined}
        cityStateZip={contact?.city_state_zip || undefined}
        hoursTueThu={footerHours.hoursTueThu}
        hoursFri={footerHours.hoursFri}
        hoursSat={footerHours.hoursSat}
        hoursSunMon={footerHours.hoursSunMon}
        social={data.social}
        mapsUrl={contact?.google_maps_url || undefined}
      />
    </main>
  );
}
