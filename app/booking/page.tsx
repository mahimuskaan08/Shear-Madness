import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BookingPageContent from "@/components/BookingPageContent";

export const metadata = {
  title: "Book an Appointment | Shear Madness Hoboken",
  description: "Schedule your next salon visit at Shear Madness Hoboken. Choose your stylist, service, and preferred time online.",
};

export default function BookingPage() {
  return (
    <>
      <Navbar />
      <BookingPageContent />
      <Footer />
    </>
  );
}
