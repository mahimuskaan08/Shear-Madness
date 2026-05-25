import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import GalleryPageContent from "@/components/GalleryPageContent";
import { getSiteImages } from "@/lib/site-images";

export const metadata = {
  title: "Gallery | Shear Madness Hoboken",
  description: "Explore our collection of salon transformations, styling moments, and signature beauty work.",
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
