import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BookingPageContent from "@/components/BookingPageContent";
import { getSiteImages } from "@/lib/site-images";

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
  const imgs = await getSiteImages();

  return (
    <>
      <Navbar />
      <BookingPageContent bgImage={imgs.booking_background_image ?? undefined} />
      <Footer />
    </>
  );
}
