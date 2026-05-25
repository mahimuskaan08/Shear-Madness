import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import GalleryPageContent from "@/components/GalleryPageContent";
import { getSiteImages } from "@/lib/site-images";

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
      <Footer />
    </>
  );
}
