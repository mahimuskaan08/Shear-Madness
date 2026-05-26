import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import ContactSection from "@/components/ContactPage";
import CustomCursor from "@/components/CustomCursor";
import { getSiteImages } from "@/lib/site-images";

export const metadata: Metadata = {
  title: "Contact Us | Shear Madness Hoboken",
  description:
    "Find Shear Madness Hoboken at 80 Park Ave #1, Hoboken, NJ 07030. Call (201) 222-2102 for hours, directions, and appointment info.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Contact Us | Shear Madness Hoboken",
    description:
      "Find Shear Madness Hoboken at 80 Park Ave #1, Hoboken, NJ 07030. Call (201) 222-2102 for hours, directions, and appointment info.",
    url: "/contact",
  },
};

export default async function ContactPage() {
  const imgs = await getSiteImages();

  return (
    <main style={{ background: "#0B0B0B", minHeight: "100vh" }}>
      <CustomCursor />
      {/* Force Navbar links/logo to white on dark background */}
      <style>{`
        .contact-page header { background: rgba(14,14,14,0.0) !important; }
        .contact-page header a,
        .contact-page header span { color: #F5F2ED !important; }
        .contact-page header button span { background: #F5F2ED !important; }
      `}</style>
      <div className="contact-page">
        <Navbar />
      </div>
      <ContactSection
        bgImage={imgs.contact_background_image ?? undefined}
        phone={imgs.site_phone || undefined}
        email={imgs.site_email || undefined}
        addressLine1={imgs.site_address_line_1 || undefined}
        cityStateZip={imgs.site_city_state_zip || undefined}
        hoursTueThu={imgs.hours_tue_thu || undefined}
        hoursFri={imgs.hours_fri || undefined}
        hoursSat={imgs.hours_sat || undefined}
        hoursSunMon={imgs.hours_sun_mon || undefined}
        mapsUrl={imgs.google_maps_url || undefined}
      />
    </main>
  );
}
