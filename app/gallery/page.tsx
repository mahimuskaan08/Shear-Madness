import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import GalleryPageContent from "@/components/GalleryPageContent";
import { getSiteImages } from "@/lib/site-images";

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
  const imgs = await getSiteImages();

  return (
    <>
      <Navbar />
      <main>
        <GalleryPageContent
          bgImage={imgs.gallery_background_image ?? undefined}
          cmsGalleryImages={imgs.gallery_images.length > 0 ? imgs.gallery_images : undefined}
        />
      </main>
      <Footer
        phone={imgs.site_phone || undefined}
        email={imgs.site_email || undefined}
        addressLine1={imgs.site_address_line_1 || undefined}
        cityStateZip={imgs.site_city_state_zip || undefined}
        hoursTueThu={imgs.hours_tue_thu || undefined}
        hoursFri={imgs.hours_fri || undefined}
        hoursSat={imgs.hours_sat || undefined}
        hoursSunMon={imgs.hours_sun_mon || undefined}
      />
    </>
  );
}
