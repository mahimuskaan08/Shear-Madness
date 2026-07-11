import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import GalleryPageContent from "@/components/GalleryPageContent";
import { getSiteData, buildFooterHours } from "@/lib/site-data";
import { getLocalGalleryImages } from "@/lib/local-gallery";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Gallery | Shear Madness Hoboken",
  description:
    "Explore our collection of salon transformations, haircut results, color work, and signature styling moments from Shear Madness Hoboken.",
  alternates: { canonical: "/gallery" },
  openGraph: {
    title: "Gallery | Shear Madness Hoboken",
    description:
      "Explore our collection of salon transformations, haircut results, color work, and signature styling moments from Shear Madness Hoboken.",
    url: "/gallery",
  },
};

export default async function GalleryPage() {
  const data = await getSiteData();
  const contact = data.contact;
  const footerHours = buildFooterHours(data.hours);

  // Local static files are the primary gallery source (display + full pairs).
  // Supabase images (uploaded via admin) are appended after.
  const localImages = getLocalGalleryImages();
  const supabaseIds = new Set(data.portfolioImages.map(img => img.url));
  // Avoid duplicating any local image that was also uploaded to Supabase
  const supabaseOnly = data.portfolioImages.filter(img => !supabaseIds.has(img.url) || img.url.startsWith("http"));
  const allPortfolioImages = [...localImages, ...supabaseOnly];

  return (
    <>
      <Navbar />
      <main>
        <GalleryPageContent
          portfolioImages={allPortfolioImages}
          testimonials={data.testimonials}
        />
      </main>
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
