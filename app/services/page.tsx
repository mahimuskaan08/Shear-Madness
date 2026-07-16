import type { Metadata } from "next";
import Footer from "@/components/Footer";
import ServicesPageContent from "@/components/ServicesPageContent";
import { getSiteData, buildFooterHours } from "@/lib/site-data";

export const revalidate = 10;

export const metadata: Metadata = {
  title: "Salon Services | Shear Madness Hoboken",
  description:
    "Browse our full menu of premium hair services — cuts, color, treatments, and more for men and women. Located at 80 Park Ave #1, Hoboken, NJ.",
  alternates: { canonical: "/services" },
  openGraph: {
    title: "Salon Services | Shear Madness Hoboken",
    description:
      "Browse our full menu of premium hair services — cuts, color, treatments, and more for men and women. Located at 80 Park Ave #1, Hoboken, NJ.",
    url: "/services",
  },
};

export default async function ServicesPage() {
  const data = await getSiteData();
  const contact = data.contact;
  const footerHours = buildFooterHours(data.hours);
  const servicesBg =
    data.backgrounds.find(b => b.section === "services_desktop")?.image_url ??
    data.backgrounds.find(b => b.section === "services")?.image_url ??
    undefined;

  return (
    <>
      <ServicesPageContent services={data.services} bgImage={servicesBg} />
      <Footer
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
    </>
  );
}
