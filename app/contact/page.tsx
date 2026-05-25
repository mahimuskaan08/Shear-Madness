import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import ContactSection from "@/components/ContactPage";
import CustomCursor from "@/components/CustomCursor";
import { getSiteImages } from "@/lib/site-images";

export const metadata: Metadata = {
  title: "Contact | Shear Madness",
  description:
    "Find Shear Madness salon in East Orange, NJ. Address, hours, and directions.",
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
      <ContactSection bgImage={imgs.contact_background_image ?? undefined} />
    </main>
  );
}
