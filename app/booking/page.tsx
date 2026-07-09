import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BookingPageContent from "@/components/BookingPageContent";
import { getSiteData, buildFooterHours } from "@/lib/site-data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Book an Appointment | Shear Madness Hoboken",
  description:
    "Schedule your next salon visit at Shear Madness Hoboken. Choose your stylist, service, and preferred time — book online now.",
  alternates: { canonical: "/booking" },
  openGraph: {
    title: "Book an Appointment | Shear Madness Hoboken",
    description:
      "Schedule your next salon visit at Shear Madness Hoboken. Choose your stylist, service, and preferred time — book online now.",
    url: "/booking",
  },
};

export default async function BookingPage() {
  const data = await getSiteData();
  const contact = data.contact;
  const footerHours = buildFooterHours(data.hours);

  return (
    <>
      <Navbar />
      <BookingPageContent storeHours={data.hours} />
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
      />
    </>
  );
}
