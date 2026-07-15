import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import ContactSection from "@/components/ContactPage";
import CustomCursor from "@/components/CustomCursor";
import { getSiteData, buildFooterHours } from "@/lib/site-data";

export const revalidate = 60;

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
  const data = await getSiteData();
  const contact = data.contact;
  const footerHours = buildFooterHours(data.hours);

  return (
    <main style={{ background: "#0B0B0B", minHeight: "100vh" }}>
      <CustomCursor />
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
        phone={contact?.phone || undefined}
        email={contact?.email || undefined}
        addressLine1={contact?.address_line_1 || undefined}
        cityStateZip={contact?.city_state_zip || undefined}
        hoursTueThu={footerHours.hoursTueThu}
        hoursFri={footerHours.hoursFri}
        hoursSat={footerHours.hoursSat}
        mapsUrl={contact?.google_maps_url || undefined}
      />
    </main>
  );
}
