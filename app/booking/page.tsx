import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BookingPageContent from "@/components/BookingPageContent";
import { getSiteData, buildFooterHours } from "@/lib/site-data";

export const revalidate = 10;

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
  const bookingBg =
    data.backgrounds.find(b => b.section === "booking_desktop")?.image_url ??
    data.backgrounds.find(b => b.section === "booking")?.image_url ??
    undefined;
  const bookingBgTablet = data.backgrounds.find(b => b.section === "booking_tablet")?.image_url ?? undefined;
  const bookingBgMobile = data.backgrounds.find(b => b.section === "booking_mobile")?.image_url ?? undefined;

  return (
    <>
      <Navbar />
      <BookingPageContent
        storeHours={data.hours}
        bgImage={bookingBg}
        bgImageTablet={bookingBgTablet}
        bgImageMobile={bookingBgMobile}
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
    </>
  );
}
