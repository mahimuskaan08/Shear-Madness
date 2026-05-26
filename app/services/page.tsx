import type { Metadata } from "next";
import ServicesPageContent from "@/components/ServicesPageContent";
import { getSiteImages } from "@/lib/site-images";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Salon Services | Shear Madness Hoboken",
  description:
    "Browse our full menu of premium hair services — cuts, color, treatments, and more for men and women. Located at 80 Park Ave #1, Hoboken, NJ.",
  alternates: { canonical: "/services" },
  openGraph: {
    title: "Salon Services | Shear Madness Hoboken",
    description:
      "Browse our full menu of premium hair services — cuts, color, treatments, and more for men and women. Located at 80 Park Ave #1, Hoboken, NJ.",
    url: "/services",
  },
};

export default async function ServicesPage() {
  const imgs = await getSiteImages();
  return (
    <ServicesPageContent
      bgImage={imgs.services_page_background_image ?? undefined}
    />
  );
}
