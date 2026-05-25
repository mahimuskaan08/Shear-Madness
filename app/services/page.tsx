import type { Metadata } from "next";
import ServicesPageContent from "@/components/ServicesPageContent";

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

export default function ServicesPage() {
  return <ServicesPageContent />;
}
