import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import GalleryPageContent from "@/components/GalleryPageContent";

export const metadata = {
  title: "Gallery | Shear Madness Hoboken",
  description: "Explore our collection of salon transformations, styling moments, and signature beauty work.",
};

export default function GalleryPage() {
  return (
    <>
      <Navbar />
      <main>
        <GalleryPageContent />
      </main>
      <Footer />
    </>
  );
}
