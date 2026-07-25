import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import ContactSection from "@/components/ContactPage";
import CustomCursor from "@/components/CustomCursor";
import { getSiteData, buildFooterHours } from "@/lib/site-data";

export const revalidate = 10;

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
  const bg = (section: string) =>
    data.backgrounds.find(b => b.section === section)?.image_url ?? undefined;

  return (
    <main style={{ background: "#ECEAE7", minHeight: "100vh" }}>
      <CustomCursor />
      <div className="contact-page">
        <Navbar />
      </div>
      <ContactSection
        bgImage={bg("contact_desktop") ?? bg("contact")}
        bgImageMobile={bg("contact_mobile")}
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
