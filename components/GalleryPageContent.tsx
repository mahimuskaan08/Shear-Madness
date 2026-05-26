"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback, useRef } from "react";
import type { CmsGalleryImage } from "@/lib/site-images";
import Image from "next/image";

/* ─────────────────────────────────────────────
   Types
───────────────────────────────────────────── */
const TABS = ["Men", "Women", "Hair & Makeup", "Videos"] as const;
type Tab = (typeof TABS)[number];
type ActiveTab = "All" | Tab;
type ImageCategory = "Men" | "Women" | "Hair & Makeup";

type GalleryItem = {
  id: number;
  previewImage: string; // shown in the card front layer
  backImage: string;    // decorative offset layer behind
  fullImage: string;    // opened in lightbox on click
  alt: string;
  category: ImageCategory;
};

type VideoItem = {
  id: string;      // YouTube video ID
  title: string;
};

/* ─────────────────────────────────────────────
   Data — swap image paths for real assets when ready
───────────────────────────────────────────── */
const GALLERY_ITEMS: GalleryItem[] = [
  // Men
  { id: 1,  previewImage: "/gallery/m1-preview.jpeg",  backImage: "/gallery/m2-preview.jpg",   fullImage: "/gallery/m1-full.jpeg",  alt: "Men Style 1",  category: "Men" },
  { id: 2,  previewImage: "/gallery/m2-preview.jpg",   backImage: "/gallery/m3-preview.jpeg",  fullImage: "/gallery/m2-full.jpg",   alt: "Men Style 2",  category: "Men" },
  { id: 3,  previewImage: "/gallery/m3-preview.jpeg",  backImage: "/gallery/m4-preview.jpg",   fullImage: "/gallery/m3-full.jpeg",  alt: "Men Style 3",  category: "Men" },
  { id: 4,  previewImage: "/gallery/m4-preview.jpg",   backImage: "/gallery/m5-preview.jpeg",  fullImage: "/gallery/m4-full.jpg",   alt: "Men Style 4",  category: "Men" },
  { id: 5,  previewImage: "/gallery/m5-preview.jpeg",  backImage: "/gallery/m6-preview.jpeg",  fullImage: "/gallery/m5-full.jpeg",  alt: "Men Style 5",  category: "Men" },
  { id: 6,  previewImage: "/gallery/m6-preview.jpeg",  backImage: "/gallery/m7-preview.jpeg",  fullImage: "/gallery/m6-full.jpeg",  alt: "Men Style 6",  category: "Men" },
  { id: 31, previewImage: "/gallery/m7-preview.jpeg",  backImage: "/gallery/m8-preview.jpeg",  fullImage: "/gallery/m7-full.jpeg",  alt: "Men Style 7",  category: "Men" },
  { id: 32, previewImage: "/gallery/m8-preview.jpeg",  backImage: "/gallery/m9-preview.jpeg",  fullImage: "/gallery/m8-full.jpeg",  alt: "Men Style 8",  category: "Men" },
  { id: 33, previewImage: "/gallery/m9-preview.jpeg",  backImage: "/gallery/m10-preview.jpeg", fullImage: "/gallery/m9-full.jpeg",  alt: "Men Style 9",  category: "Men" },
  { id: 34, previewImage: "/gallery/m10-preview.jpeg", backImage: "/gallery/m11-preview.jpeg", fullImage: "/gallery/m10-full.jpeg", alt: "Men Style 10", category: "Men" },
  { id: 35, previewImage: "/gallery/m11-preview.jpeg", backImage: "/gallery/m12-preview.jpeg", fullImage: "/gallery/m11-full.jpeg", alt: "Men Style 11", category: "Men" },
  { id: 36, previewImage: "/gallery/m12-preview.jpeg", backImage: "/gallery/m13-preview.jpeg", fullImage: "/gallery/m12-full.jpeg", alt: "Men Style 12", category: "Men" },
  { id: 37, previewImage: "/gallery/m13-preview.jpeg", backImage: "/gallery/m14-preview.jpeg", fullImage: "/gallery/m13-full.jpeg", alt: "Men Style 13", category: "Men" },
  { id: 38, previewImage: "/gallery/m14-preview.jpeg", backImage: "/gallery/m15-preview.jpeg", fullImage: "/gallery/m14-full.jpeg", alt: "Men Style 14", category: "Men" },
  { id: 39, previewImage: "/gallery/m15-preview.jpeg", backImage: "/gallery/m16-preview.jpeg", fullImage: "/gallery/m15-full.jpeg", alt: "Men Style 15", category: "Men" },
  { id: 40, previewImage: "/gallery/m16-preview.jpeg", backImage: "/gallery/m17-preview.jpeg", fullImage: "/gallery/m16-full.jpeg", alt: "Men Style 16", category: "Men" },
  { id: 41, previewImage: "/gallery/m17-preview.jpeg", backImage: "/gallery/m18-preview.jpg",  fullImage: "/gallery/m17-full.jpeg", alt: "Men Style 17", category: "Men" },
  { id: 42, previewImage: "/gallery/m18-preview.jpg",  backImage: "/gallery/m19-preview.jpg",  fullImage: "/gallery/m18-full.jpeg", alt: "Men Style 18", category: "Men" },
  { id: 43, previewImage: "/gallery/m19-preview.jpg",  backImage: "/gallery/m20-preview.jpeg", fullImage: "/gallery/m19-full.jpeg", alt: "Men Style 19", category: "Men" },
  { id: 44, previewImage: "/gallery/m20-preview.jpeg", backImage: "/gallery/m21-preview.jpeg", fullImage: "/gallery/m20-full.jpeg", alt: "Men Style 20", category: "Men" },
  { id: 45, previewImage: "/gallery/m21-preview.jpeg", backImage: "/gallery/m22-preview.jpg",  fullImage: "/gallery/m21-full.png",  alt: "Men Style 21", category: "Men" },
  { id: 46, previewImage: "/gallery/m22-preview.jpg",  backImage: "/gallery/m23-preview.jpg",  fullImage: "/gallery/m22-full.jpg",  alt: "Men Style 22", category: "Men" },
  { id: 47, previewImage: "/gallery/m23-preview.jpg",  backImage: "/gallery/m24-preview.jpg",  fullImage: "/gallery/m23-full.jpg",  alt: "Men Style 23", category: "Men" },
  { id: 48, previewImage: "/gallery/m24-preview.jpg",  backImage: "/gallery/m25-preview.jpg",  fullImage: "/gallery/m24-full.jpg",  alt: "Men Style 24", category: "Men" },
  { id: 49, previewImage: "/gallery/m25-preview.jpg",  backImage: "/gallery/m26-preview.jpg",  fullImage: "/gallery/m25-full.jpg",  alt: "Men Style 25", category: "Men" },
  { id: 50, previewImage: "/gallery/m26-preview.jpg",  backImage: "/gallery/m27-preview.jpg",  fullImage: "/gallery/m26-full.png",  alt: "Men Style 26", category: "Men" },
  { id: 51, previewImage: "/gallery/m27-preview.jpg",  backImage: "/gallery/m28-preview.jpeg", fullImage: "/gallery/m27-full.jpg",  alt: "Men Style 27", category: "Men" },
  { id: 52, previewImage: "/gallery/m28-preview.jpeg", backImage: "/gallery/m29-preview.jpg",  fullImage: "/gallery/m28-full.jpeg", alt: "Men Style 28", category: "Men" },
  { id: 53, previewImage: "/gallery/m29-preview.jpg",  backImage: "/gallery/m30-preview.jpg",  fullImage: "/gallery/m29-full.jpg",  alt: "Men Style 29", category: "Men" },
  { id: 54, previewImage: "/gallery/m30-preview.jpg",  backImage: "/gallery/m31-preview.jpg",  fullImage: "/gallery/m30-full.jpg",  alt: "Men Style 30", category: "Men" },
  { id: 55, previewImage: "/gallery/m31-preview.jpg",  backImage: "/gallery/m32-preview.jpg",  fullImage: "/gallery/m31-full.jpg",  alt: "Men Style 31", category: "Men" },
  { id: 56, previewImage: "/gallery/m32-preview.jpg",  backImage: "/gallery/m33-preview.jpg",  fullImage: "/gallery/m32-full.jpg",  alt: "Men Style 32", category: "Men" },
  { id: 57, previewImage: "/gallery/m33-preview.jpg",  backImage: "/gallery/m34-preview.jpg",  fullImage: "/gallery/m33-full.jpg",  alt: "Men Style 33", category: "Men" },
  { id: 58, previewImage: "/gallery/m34-preview.jpg",  backImage: "/gallery/m35-preview.jpg",  fullImage: "/gallery/m34-full.jpg",  alt: "Men Style 34", category: "Men" },
  { id: 59, previewImage: "/gallery/m35-preview.jpg",  backImage: "/gallery/m36-preview.jpg",  fullImage: "/gallery/m35-full.jpg",  alt: "Men Style 35", category: "Men" },
  { id: 60, previewImage: "/gallery/m36-preview.jpg",  backImage: "/gallery/m37-preview.jpg",  fullImage: "/gallery/m36-full.jpg",  alt: "Men Style 36", category: "Men" },
  { id: 61, previewImage: "/gallery/m37-preview.jpg",  backImage: "/gallery/m38-preview.jpg",  fullImage: "/gallery/m37-full.jpg",  alt: "Men Style 37", category: "Men" },
  { id: 62, previewImage: "/gallery/m38-preview.jpg",  backImage: "/gallery/m39-preview.jpg",  fullImage: "/gallery/m38-full.jpg",  alt: "Men Style 38", category: "Men" },
  { id: 63, previewImage: "/gallery/m39-preview.jpg",  backImage: "/gallery/m40-preview.jpg",  fullImage: "/gallery/m39-full.jpg",  alt: "Men Style 39", category: "Men" },
  { id: 64, previewImage: "/gallery/m40-preview.jpg",  backImage: "/gallery/m1-preview.jpeg",  fullImage: "/gallery/m40-full.png",  alt: "Men Style 40", category: "Men" },
  // Women
  { id: 7,  previewImage: "/gallery/w1-preview.jpg",  backImage: "/gallery/w2-preview.jpg",  fullImage: "/gallery/w1-full.jpg",  alt: "Women Style 1",  category: "Women" },
  { id: 8,  previewImage: "/gallery/w2-preview.jpg",  backImage: "/gallery/w3-preview.jpg",  fullImage: "/gallery/w2-full.png",  alt: "Women Style 2",  category: "Women" },
  { id: 9,  previewImage: "/gallery/w3-preview.jpg",  backImage: "/gallery/w4-preview.jpg",  fullImage: "/gallery/w3-full.jpg",  alt: "Women Style 3",  category: "Women" },
  { id: 10, previewImage: "/gallery/w4-preview.jpg",  backImage: "/gallery/w5-preview.jpg",  fullImage: "/gallery/w4-full.jpg",  alt: "Women Style 4",  category: "Women" },
  { id: 11, previewImage: "/gallery/w5-preview.jpg",  backImage: "/gallery/w6-preview.jpg",  fullImage: "/gallery/w5-full.jpg",  alt: "Women Style 5",  category: "Women" },
  { id: 12, previewImage: "/gallery/w6-preview.jpg",  backImage: "/gallery/w7-preview.jpg",  fullImage: "/gallery/w6-full.jpg",  alt: "Women Style 6",  category: "Women" },
  { id: 19, previewImage: "/gallery/w7-preview.jpg",  backImage: "/gallery/w8-preview.jpg",  fullImage: "/gallery/w7-full.jpg",  alt: "Women Style 7",  category: "Women" },
  { id: 20, previewImage: "/gallery/w8-preview.jpg",  backImage: "/gallery/w9-preview.jpg",  fullImage: "/gallery/w8-full.jpg",  alt: "Women Style 8",  category: "Women" },
  { id: 21, previewImage: "/gallery/w9-preview.jpg",  backImage: "/gallery/w10-preview.jpg", fullImage: "/gallery/w9-full.jpg",  alt: "Women Style 9",  category: "Women" },
  { id: 22, previewImage: "/gallery/w10-preview.jpg", backImage: "/gallery/w11-preview.jpg", fullImage: "/gallery/w10-full.jpg", alt: "Women Style 10", category: "Women" },
  { id: 23, previewImage: "/gallery/w11-preview.jpg", backImage: "/gallery/w12-preview.jpg", fullImage: "/gallery/w11-full.jpg", alt: "Women Style 11", category: "Women" },
  { id: 24, previewImage: "/gallery/w12-preview.jpg", backImage: "/gallery/w13-preview.jpg", fullImage: "/gallery/w12-full.jpg", alt: "Women Style 12", category: "Women" },
  { id: 25, previewImage: "/gallery/w13-preview.jpg", backImage: "/gallery/w14-preview.jpg", fullImage: "/gallery/w13-full.jpg", alt: "Women Style 13", category: "Women" },
  { id: 26, previewImage: "/gallery/w14-preview.jpg", backImage: "/gallery/w15-preview.jpg", fullImage: "/gallery/w14-full.jpg", alt: "Women Style 14", category: "Women" },
  { id: 27, previewImage: "/gallery/w15-preview.jpg", backImage: "/gallery/w16-preview.jpg", fullImage: "/gallery/w15-full.png", alt: "Women Style 15", category: "Women" },
  { id: 28, previewImage: "/gallery/w16-preview.jpg", backImage: "/gallery/w17-preview.jpg", fullImage: "/gallery/w16-full.jpg", alt: "Women Style 16", category: "Women" },
  { id: 29, previewImage: "/gallery/w17-preview.jpg", backImage: "/gallery/w18-preview.jpg", fullImage: "/gallery/w17-full.jpg", alt: "Women Style 17", category: "Women" },
  { id: 30, previewImage: "/gallery/w18-preview.jpg", backImage: "/gallery/w1-preview.jpg",  fullImage: "/gallery/w18-full.jpg", alt: "Women Style 18", category: "Women" },
  // Hair & Makeup
  { id: 13, previewImage: "/gallery/hm1-preview.jpg", backImage: "/gallery/hm2-preview.jpg", fullImage: "/gallery/hm1-full.jpg",  alt: "Hair & Makeup 1", category: "Hair & Makeup" },
  { id: 14, previewImage: "/gallery/hm2-preview.jpg", backImage: "/gallery/hm3-preview.jpg", fullImage: "/gallery/hm2-full.jpg",  alt: "Hair & Makeup 2", category: "Hair & Makeup" },
  { id: 15, previewImage: "/gallery/hm3-preview.jpg", backImage: "/gallery/hm4-preview.jpg", fullImage: "/gallery/hm3-full.jpg",  alt: "Hair & Makeup 3", category: "Hair & Makeup" },
  { id: 16, previewImage: "/gallery/hm4-preview.jpg", backImage: "/gallery/hm5-preview.jpg", fullImage: "/gallery/hm4-full.png",  alt: "Hair & Makeup 4", category: "Hair & Makeup" },
  { id: 17, previewImage: "/gallery/hm5-preview.jpg", backImage: "/gallery/hm1-preview.jpg", fullImage: "/gallery/hm5-full.jpg",  alt: "Hair & Makeup 5", category: "Hair & Makeup" },
];

const VIDEO_ITEMS: VideoItem[] = [
  { id: "B23e-dWG2Ws", title: "Shear Madness — Salon Feature"        },
  { id: "SHTB9Tdy9kg", title: "Shear Madness — Beauty Transformations" },
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/* ─────────────────────────────────────────────
   Testimonials Data
───────────────────────────────────────────── */
const TESTIMONIALS = [
  { name: "Verified Reviewer",   role: "Google Review", text: "I love this place. Right when you walk in, you are always greeted by David, who is super friendly and welcoming. Victor is the absolute best. He takes his time and is meticulous with his cuts/styling. I highly recommend you give this place a try :)" },
  { name: "Michelle Ferran",     role: "Google Review", text: "OMG I had my first haircut from Victor — what an amazing experience!!! Not only did I get a fabulous haircut, Victor took the time to talk me through my new style. He showed me how to style it with his hair products." },
  { name: "Bradley Paszkiewicz", role: "Google Review", text: "Honestly the best haircut I have ever gotten. Victor has an absolutely amazing personality that makes the whole experience fun, plus super experienced. He explains everything he is doing/about to do and why." },
  { name: "Ángeles González",    role: "Google Review", text: "Today my boyfriend went to this place to get his hair cut. He received what we believe is the best haircut he's ever had, so I had to come here to say THANK YOU." },
  { name: "Henna Vora",          role: "Google Review", text: "I love my husband's haircut and styling. Victor is professional and excellent at his job. Brilliant skill set to handle my husband's hair volumes. Big thank you." },
  { name: "Gregory G.",          role: "Google Review", text: "The 2 owner operators are always on-site, so the well run, full service shop is always fully stocked, staffed, and maintained. David and Viktor space appointments that they can actually honor." },
  { name: "Saarth Shah",         role: "Google Review", text: "Best haircut place in town. Victor is amazing at knowing the hair style you want and has some great suggestions. David is very nice and friendly." },
  { name: "G Bha",               role: "Google Review", text: "Love the edgy cuts Victor does! He always takes the time to make sure it's cut and styled well. I've tried different hair salons both in Hoboken and New York City but Shear Madness is a cut above all of them!" },
  { name: "Jaime Zimmel",        role: "Google Review", text: "David and Victor are always on-site, and always very accommodating and professional. The site is always well maintained and clean. They always make the experience very warm and welcoming." },
  { name: "Jesse Luo",           role: "Google Review", text: "Met with Victor, he was very patient with me in building up a better haircut than my usual, and explained all his recommendations in detail. Highly recommended and worth a trip." },
  { name: "Andrew Lazirko",      role: "Google Review", text: "My first haircut at a new salon in 28 years. Absolute legends in here. 10/10 would recommend to everyone. Class act establishment. My new spot for sure." },
  { name: "Erdal Turnacioglu",   role: "Google Review", text: "I've been going to Victor for over 15 years now, no matter where I've lived and worked in New York or New Jersey. He's the best! Highly recommend!" },
  { name: "Brad Mundt",          role: "Google Review", text: "Excellent cut by Victor. I appreciate his explanations as to why he is doing certain things and his overall skill level." },
  { name: "Georgiy Yudintsev",   role: "Google Review", text: "Excellent haircut, a little pricey but it was very well done. Very chill and easy going staff too!" },
  { name: "Daniel Mikus",        role: "Google Review", text: "I love this place! Even after moving to Brooklyn I still make the journey across both rivers monthly to get my hair cut." },
];


/* ─────────────────────────────────────────────
   Page
───────────────────────────────────────────── */
export default function GalleryPageContent({
  bgImage,
  cmsGalleryImages,
}: {
  bgImage?:          string;
  cmsGalleryImages?: CmsGalleryImage[];
}) {
  // Convert CMS images to GalleryItems (shown in "All" tab only).
  const cmsItems: GalleryItem[] = (cmsGalleryImages ?? []).map((img, i, arr) => ({
    id:           -(i + 1),
    previewImage: img.url,
    backImage:    arr[(i + 1) % arr.length]?.url ?? img.url,
    fullImage:    img.url,
    alt:          img.alt || img.title || `Gallery Image ${i + 1}`,
    category:     "Men" as ImageCategory,
  }));
  const allWithCms = [...cmsItems, ...GALLERY_ITEMS];

  const [activeTab, setActiveTab]       = useState<ActiveTab>("All");
  const [lightboxItem, setLightboxItem] = useState<GalleryItem | null>(null);
  // Start with original order on both server and client to avoid hydration mismatch,
  // then shuffle on the client after mount.
  const [allItems, setAllItems] = useState<GalleryItem[]>(allWithCms);
  useEffect(() => { setAllItems(shuffle([...allWithCms])); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const visibleItems: GalleryItem[] =
    activeTab === "All"    ? allItems :
    activeTab === "Videos" ? []       :
    GALLERY_ITEMS.filter((item) => item.category === activeTab);

  const isVideos = activeTab === "Videos";

  const closeLightbox = useCallback(() => setLightboxItem(null), []);

  useEffect(() => {
    if (!lightboxItem) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") closeLightbox(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxItem, closeLightbox]);

  useEffect(() => {
    document.body.style.overflow = lightboxItem ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [lightboxItem]);

  return (
    <>
    {/* ── MOBILE FIXED BACKGROUND ──────────────────────────────────────────
        On mobile, background-attachment:fixed is unsupported on iOS for
        non-body elements. This single fixed div covers the entire gallery
        page (both gallery + reviews sections) as a stable backdrop.
        Hidden on desktop — the section's own background-attachment:fixed
        handles it there.
    ─────────────────────────────────────────────────────────────────────── */}
    <div
      className="gallery-bg-fixed-layer"
      aria-hidden
      style={{ backgroundImage: `url('${bgImage ?? "/gallery-bg2.jpg"}')` }}
    />
    <section
      className="relative min-h-screen overflow-x-hidden gallery-bg-section"
      data-cms-bg={bgImage ?? "FALLBACK:/gallery-bg2.jpg"}
      style={{
        paddingTop: "calc(var(--navbar-h, 80px) + 2.4rem)",
        backgroundImage: `url('${bgImage ?? "/gallery-bg2.jpg"}')`,
        backgroundAttachment: "fixed",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* ── Translucent overlay for 50% visibility ── */}
      <div aria-hidden className="absolute inset-0 z-0 pointer-events-none"
        style={{ background: "rgba(253,250,246,0.50)" }} />

      {/* ── All content above bg ── */}
      <div className="relative z-10">

      {/* ── Header ── */}
      <div className="flex flex-col items-center text-center px-6 pb-10 md:pb-12">
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="font-sans text-[10px] tracking-[0.35em] uppercase font-medium"
          style={{ color: "#7A5C10" }}
        >
          Gallery
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE, delay: 0.1 }}
          className="font-serif mt-5 leading-[1.1]"
          style={{ fontSize: "clamp(2.6rem, 5.5vw, 4.2rem)", fontWeight: 700, color: "#556B2F" }}
        >
          Our Portfolio
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE, delay: 0.2 }}
          className="mt-4 font-sans leading-relaxed max-w-md"
          style={{ fontSize: "clamp(0.9rem, 1.5vw, 1.05rem)", color: "#1a1a1a", fontWeight: 400 }}
        >
          Explore our collection of salon transformations, styling moments,
          and signature beauty work.
        </motion.p>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE, delay: 0.32 }}
          className="mt-12 flex flex-wrap items-center justify-center gap-2 sm:gap-3"
          role="tablist"
          aria-label="Gallery categories"
        >
          {(["All", ...TABS] as const).map((tab) => (
            <TabButton
              key={tab}
              label={tab}
              isActive={activeTab === tab}
              onClick={() => setActiveTab(tab)}
            />
          ))}
        </motion.div>
      </div>

      {/* ── Showcase ── */}
      <div id="portfolio" className="pb-14 md:pb-20 mt-2 md:mt-4">
        <AnimatePresence mode="wait">
          {isVideos ? (
            <VideoSection key="videos" />
          ) : (
            <CardGrid
              key={activeTab}
              items={visibleItems}
              onCardClick={setLightboxItem}
            />
          )}
        </AnimatePresence>
      </div>

      {/* ── Lightbox ── */}
      <AnimatePresence>
        {lightboxItem && (
          <Lightbox item={lightboxItem} onClose={closeLightbox} />
        )}
      </AnimatePresence>

      </div>{/* end relative z-10 */}
    </section>
    <ReviewsSection bgImage={bgImage} />
    </>
  );
}

/* ─────────────────────────────────────────────
   Card Slider — 3 visible, autoplay, arrow nav,
   touch swipe, pause on hover
───────────────────────────────────────────── */
function CardGrid({
  items,
  onCardClick,
}: {
  items: GalleryItem[];
  onCardClick: (item: GalleryItem) => void;
}) {
  const [current,      setCurrent]      = useState(0);
  const [paused,       setPaused]       = useState(false);
  const [visibleCount, setVisibleCount] = useState(3);
  const [containerW,   setContainerW]   = useState(0);

  const trackWrapRef = useRef<HTMLDivElement>(null);
  const autoRef      = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const dragStart    = useRef<number | null>(null);

  const N        = items.length;
  const GAP      = 0;
  const cardW    = containerW > 0 ? (containerW - GAP * (visibleCount - 1)) / visibleCount : 0;
  const maxIndex = Math.max(0, N - visibleCount);

  useEffect(() => {
    const el = trackWrapRef.current;
    if (!el) return;
    const update = () => {
      const w = el.offsetWidth;
      setContainerW(w);
      if (w < 640)  setVisibleCount(1);
      else          setVisibleCount(3);
    };
    const ro = new ResizeObserver(update);
    ro.observe(el);
    update();
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (paused || N <= visibleCount) return;
    autoRef.current = setInterval(() => {
      setCurrent(c => (c >= maxIndex ? 0 : c + 1));
    }, 3000);
    return () => clearInterval(autoRef.current);
  }, [paused, N, visibleCount, maxIndex]);

  const prev = useCallback(() => setCurrent(c => Math.max(0, c - 1)), []);
  const next = useCallback(() => setCurrent(c => Math.min(maxIndex, c + 1)), [maxIndex]);

  const onPointerDown = (e: React.PointerEvent) => { dragStart.current = e.clientX; };
  const onPointerUp   = (e: React.PointerEvent) => {
    if (dragStart.current === null) return;
    const dx = e.clientX - dragStart.current;
    if (dx < -40) next();
    else if (dx > 40) prev();
    dragStart.current = null;
  };

  const translateX = -(current * (cardW + GAP));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.45, ease: EASE }}
      className="w-full overflow-x-hidden"
      style={{ paddingTop: "clamp(1.5rem, 3vw, 2.5rem)", paddingLeft: "clamp(2rem, 8vw, 10rem)", paddingRight: "clamp(2rem, 8vw, 10rem)" }}
    >
      <div className="relative">
        <div
          ref={trackWrapRef}
          className="w-full overflow-hidden select-none hide-scrollbar"
          style={{ cursor: "grab", touchAction: "pan-y" }}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => { setPaused(false); dragStart.current = null; }}
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
          onPointerLeave={() => { dragStart.current = null; }}
        >
          <div
            style={{
              display:    "flex",
              gap:        GAP,
              transform:  `translateX(${translateX}px)`,
              transition: "transform 0.6s cubic-bezier(0.32,0.72,0,1)",
              willChange: "transform",
            }}
          >
            {items.map((item) => (
              <div key={item.id} style={{ flexShrink: 0, width: cardW || "auto" }}>
                <GalleryCard item={item} onClick={() => onCardClick(item)} />
              </div>
            ))}
          </div>
        </div>

        {/* Arrows overlaid on the images */}
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          <div className="pointer-events-auto">
            <SliderBtn dir="prev" disabled={current === 0} onClick={prev} />
          </div>
        </div>
        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
          <div className="pointer-events-auto">
            <SliderBtn dir="next" disabled={current >= maxIndex} onClick={next} />
          </div>
        </div>
      </div>

      {maxIndex > 0 && (
        <div className="flex justify-center gap-2 mt-4">
          {Array.from({ length: maxIndex + 1 }).map((_, i) => (
            <button
              key={i}
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => setCurrent(i)}
              style={{
                height: 5, width: i === current ? 20 : 5,
                borderRadius: 9999,
                background: i === current
                  ? "linear-gradient(90deg,#C9A96E,#B8935A)"
                  : "rgba(58,56,50,0.18)",
                transition: "width 0.3s ease, background 0.3s ease",
                border: "none", cursor: "pointer", padding: 0,
              }}
            />
          ))}
        </div>
      )}

      <p
        className="mt-4 text-center font-sans text-[15px] tracking-[0.08em]"
        style={{ color: "#1a1a1a", fontWeight: 700 }}
      >
        Click on picture for Multiple Angles
      </p>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   Gallery Card
───────────────────────────────────────────── */
function GalleryCard({ item, onClick }: { item: GalleryItem; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className="relative overflow-hidden cursor-zoom-in"
      style={{
        width: "100%",
        height: "clamp(260px, 30vw, 420px)",
        boxShadow: hovered ? "0 12px 32px rgba(58,56,50,0.16)" : "0 4px 16px rgba(58,56,50,0.08)",
        transition: "box-shadow 0.4s ease",
      }}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Image
        src={item.previewImage}
        alt={item.alt}
        fill
        className="object-contain"
        sizes="(max-width: 640px) 88vw, 33vw"
        style={{
          transform:      hovered ? "scale(1.05)" : "scale(1)",
          transition:     "transform 0.6s cubic-bezier(0.22,1,0.36,1)",
          objectPosition: item.category === "Hair & Makeup" ? "center top" : "center center",
        }}
      />
    </div>
  );
}

/* ─────────────────────────────────────────────
   Slider Arrow Button
───────────────────────────────────────────── */
function SliderBtn({
  dir,
  disabled,
  onClick,
}: {
  dir: "prev" | "next";
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={dir === "prev" ? "Previous" : "Next"}
      style={{
        flexShrink: 0, width: 48, height: 48, borderRadius: "50%",
        background: "rgba(253,250,246,0.97)",
        border: "1.5px solid rgba(58,56,50,0.15)",
        boxShadow: "0 4px 18px rgba(58,56,50,0.10), 0 1px 4px rgba(58,56,50,0.06)",
        opacity: disabled ? 0.22 : 1,
        cursor: disabled ? "default" : "pointer",
        display: "flex", alignItems: "center", justifyContent: "center",
        transform: "scale(1)",
        transition: "opacity 0.25s, border-color 0.25s, box-shadow 0.25s, transform 0.2s",
      }}
      onMouseEnter={(e) => {
        if (disabled) return;
        const b = e.currentTarget as HTMLButtonElement;
        b.style.borderColor = "#C9A96E";
        b.style.boxShadow = "0 6px 24px rgba(201,169,110,0.28), 0 2px 8px rgba(58,56,50,0.08)";
        b.style.transform = "scale(1.08)";
      }}
      onMouseLeave={(e) => {
        const b = e.currentTarget as HTMLButtonElement;
        b.style.borderColor = "rgba(58,56,50,0.15)";
        b.style.boxShadow = "0 4px 18px rgba(58,56,50,0.10), 0 1px 4px rgba(58,56,50,0.06)";
        b.style.transform = "scale(1)";
      }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
        stroke="#3A3832" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {dir === "prev" ? <path d="M15 18l-6-6 6-6" /> : <path d="M9 18l6-6-6-6" />}
      </svg>
    </button>
  );
}

/* ─────────────────────────────────────────────
   Video Section
   Two YouTube embeds side by side on desktop,
   stacked on mobile. Includes its own header.
───────────────────────────────────────────── */
function VideoSection() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.45, ease: EASE }}
      className="w-full flex justify-center px-6 md:px-16"
      style={{ paddingTop: "clamp(3.5rem, 6vw, 5rem)" }}
    >
      {/* 2-column video grid, centred — 60% wider than original, 45% more gap */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-[35px] md:gap-[46px] w-full max-w-[1515px]">
        {VIDEO_ITEMS.map((v, i) => (
          <motion.div
            key={v.id}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: EASE, delay: i * 0.12 }}
          >
            <YouTubeEmbed videoId={v.id} title={v.title} />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}


/* ─────────────────────────────────────────────
   Testimonial Card
───────────────────────────────────────────── */
function TestimonialCard({ t }: { t: { name: string; role: string; text: string } }) {
  return (
    <div
      style={{
        background:    "rgba(255,255,255,0.72)",
        border:        "1px solid rgba(201,169,110,0.2)",
        borderRadius:  18,
        boxShadow:     "0 4px 28px rgba(58,56,50,0.07), 0 1px 4px rgba(58,56,50,0.04)",
        padding:       "clamp(1.25rem, 2.5vw, 1.75rem)",
        display:       "flex",
        flexDirection: "column" as const,
        gap:           14,
        height:        "100%",
        boxSizing:     "border-box" as const,
      }}
    >
      {/* Stars */}
      <div style={{ display: "flex", gap: 3 }}>
        {[1, 2, 3, 4, 5].map((i) => (
          <svg key={i} width="13" height="13" viewBox="0 0 24 24" fill="#C9A96E">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        ))}
      </div>

      {/* Quote */}
      <p
        style={{
          fontSize:   "clamp(0.84rem, 1.2vw, 0.93rem)",
          color:      "#3A3832",
          lineHeight: 1.72,
          fontStyle:  "italic",
          flex:       1,
        }}
      >
        &ldquo;{t.text}&rdquo;
      </p>

      {/* Divider */}
      <div style={{ height: 1, background: "linear-gradient(90deg, rgba(201,169,110,0.3), transparent)" }} />

      {/* Author */}
      <div>
        <p style={{ fontWeight: 600, fontSize: "0.87rem", color: "#3A3832", letterSpacing: "0.02em" }}>
          {t.name}
        </p>
        <p style={{ fontSize: "0.75rem", color: "rgba(58,56,50,0.48)", marginTop: 2, letterSpacing: "0.04em" }}>
          {t.role}
        </p>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Reviews Section — horizontal testimonial carousel
───────────────────────────────────────────── */
function ReviewsSection({ bgImage }: { bgImage?: string }) {
  const [idx, setIdx]         = useState(0);
  const [paused, setPaused]   = useState(false);
  const [visibleCount, setVC] = useState(3);
  const [containerW, setW]    = useState(0);

  const trackRef   = useRef<HTMLDivElement>(null);
  const autoRef    = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const dragStart  = useRef<number | null>(null);
  const [transOn, setTransOn] = useState(true);

  const N        = TESTIMONIALS.length;
  const GAP      = 20;
  const maxIndex = Math.max(0, N - visibleCount);
  const cardW    = visibleCount === 1
    ? containerW * 0.88
    : containerW > 0 ? (containerW - GAP * (visibleCount - 1)) / visibleCount : 0;

  /* ── Responsive breakpoints ── */
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const update = () => {
      const w = el.offsetWidth;
      setW(w);
      if (w < 640)       setVC(1);
      else if (w < 1024) setVC(2);
      else               setVC(3);
    };
    const ro = new ResizeObserver(update);
    ro.observe(el);
    update();
    return () => ro.disconnect();
  }, []);

  /* ── Instant wrap to 0 without animation ── */
  const wrapToStart = useCallback(() => {
    setTransOn(false);
    setIdx(0);
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        setTransOn(true);
      })
    );
  }, []);

  /* ── Navigation ── */
  const nextSlide = useCallback(() => {
    if (idx >= maxIndex) { wrapToStart(); return; }
    setIdx(idx + 1);
  }, [idx, maxIndex, wrapToStart]);

  const prevSlide = useCallback(() => setIdx((c) => Math.max(0, c - 1)), []);

  /* ── Autoplay ── */
  useEffect(() => {
    if (paused) { clearInterval(autoRef.current); return; }
    autoRef.current = setInterval(nextSlide, 4500);
    return () => clearInterval(autoRef.current);
  }, [paused, nextSlide]);

  /* ── Pointer drag / swipe ── */
  const onPointerDown = (e: React.PointerEvent) => { dragStart.current = e.clientX; };
  const onPointerUp   = (e: React.PointerEvent) => {
    if (dragStart.current === null) return;
    const dx = e.clientX - dragStart.current;
    if (dx < -40) nextSlide();
    else if (dx > 40) prevSlide();
    dragStart.current = null;
  };

  const translateX = -(idx * (cardW + GAP));

  return (
    <section
      id="reviews"
      className="w-full relative overflow-hidden gallery-bg-section"
      style={{
        padding: "clamp(1.75rem, 3vw, 2.5rem) 0 clamp(2rem, 4vw, 3rem)",
        backgroundImage: `url('${bgImage ?? "/gallery-bg2.jpg"}')`,
        backgroundAttachment: "fixed",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Same overlay as gallery section */}
      <div aria-hidden style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(253,250,246,0.50)", pointerEvents: "none", zIndex: 0 }} />

      {/* Thin gold divider */}
      <div
        style={{
          position: "relative", zIndex: 1,
          margin:     "0 auto clamp(1.25rem, 2.5vw, 2rem)",
          maxWidth:   "80%",
          height:     1,
          background: "linear-gradient(90deg, transparent, rgba(201,169,110,0.35) 25%, rgba(201,169,110,0.35) 75%, transparent)",
        }}
      />

      {/* Header */}
      <div
        className="flex flex-col items-center text-center px-6"
        style={{ marginBottom: "clamp(1rem, 2vw, 1.5rem)", position: "relative", zIndex: 1 }}
      >
        <p
          className="font-sans"
          style={{ fontSize: "0.68rem", letterSpacing: "0.34em", textTransform: "uppercase", color: "#7A5C10", fontWeight: 700 }}
        >
          Reviews
        </p>
        <h2
          className="font-serif"
          style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)", fontWeight: 700, color: "#556B2F", marginTop: "0.5rem", lineHeight: 1.15 }}
        >
          What Clients Say
        </h2>
        <p
          className="font-sans"
          style={{ fontSize: "clamp(0.85rem, 1.4vw, 0.95rem)", color: "#1a1a1a", marginTop: "0.6rem", opacity: 0.6 }}
        >
          About Shear Madness
        </p>
      </div>

      {/* Carousel viewport */}
      <div style={{ padding: "0 clamp(1.5rem, 5vw, 5rem)", position: "relative", zIndex: 1 }}>
        <div
          ref={trackRef}
          className="hide-scrollbar"
          style={{ overflow: "hidden", cursor: "grab", userSelect: "none", touchAction: "pan-y" }}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => { setPaused(false); dragStart.current = null; }}
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
          onPointerLeave={() => { dragStart.current = null; }}
        >
          {/* Sliding track */}
          <div
            style={{
              display:    "flex",
              gap:        GAP,
              transform:  `translateX(${translateX}px)`,
              transition: transOn ? "transform 0.65s cubic-bezier(0.32,0.72,0,1)" : "none",
              willChange: "transform",
            }}
          >
            {TESTIMONIALS.map((t, i) => (
              <div key={i} style={{ flexShrink: 0, width: cardW || "auto" }}>
                <TestimonialCard t={t} />
              </div>
            ))}
          </div>
        </div>

        {/* Controls: prev · dots · next */}
        <div
          style={{
            display:        "flex",
            alignItems:     "center",
            justifyContent: "center",
            gap:            20,
            marginTop:      "clamp(0.875rem, 1.75vw, 1.25rem)",
          }}
        >
          <SliderBtn dir="prev" disabled={idx === 0} onClick={prevSlide} />

          {/* Dot indicators */}
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {Array.from({ length: maxIndex + 1 }).map((_, i) => (
              <button
                key={i}
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => setIdx(i)}
                style={{
                  height:       5,
                  width:        i === idx ? 20 : 5,
                  borderRadius: 9999,
                  background:   i === idx
                    ? "linear-gradient(90deg,#C9A96E,#B8935A)"
                    : "rgba(58,56,50,0.18)",
                  transition:   "width 0.3s ease, background 0.3s ease",
                  border:       "none",
                  cursor:       "pointer",
                  padding:      0,
                }}
              />
            ))}
          </div>

          <SliderBtn dir="next" disabled={false} onClick={nextSlide} />
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   Lightbox
───────────────────────────────────────────── */
function Lightbox({ item, onClose }: { item: GalleryItem; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.28 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-6 md:p-12"
      style={{ background: "rgba(18,16,12,0.9)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 16 }}
        animate={{ scale: 1,   opacity: 1, y: 0  }}
        exit={{ scale: 0.93,  opacity: 0, y: 8  }}
        transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
        className="relative flex flex-col items-center w-full"
        style={{ maxWidth: "480px" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button — above image on desktop, overlaid top-right on mobile */}
        <button
          onClick={onClose}
          className="hidden sm:flex absolute -top-10 right-0 items-center gap-2 font-sans text-[10px] tracking-[0.2em] uppercase font-medium transition-colors duration-200"
          style={{ color: "rgba(255,255,255,0.5)" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#fff"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.5)"; }}
          aria-label="Close"
        >
          <span>Close</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        {/* Mobile close button — inside the image, top-right corner */}
        <button
          onClick={onClose}
          className="sm:hidden absolute top-2 right-2 z-20 flex items-center justify-center w-9 h-9 rounded-full"
          style={{ background: "rgba(0,0,0,0.55)", color: "rgba(255,255,255,0.85)" }}
          aria-label="Close"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        <div
          className="relative w-full overflow-hidden rounded-2xl"
          style={{ aspectRatio: "1 / 1", maxHeight: "80vh", boxShadow: "0 32px 96px rgba(0,0,0,0.55)" }}
        >
          <Image
            src={item.fullImage}
            alt={item.alt}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 480px"
            priority
          />
        </div>

        <p
          className="mt-5 font-sans text-[11px] tracking-[0.22em] uppercase font-medium"
          style={{ color: "rgba(255,255,255,0.45)" }}
        >
          {item.alt}
        </p>
      </motion.div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   Tab Button
───────────────────────────────────────────── */
function TabButton({
  label,
  isActive,
  onClick,
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      role="tab"
      aria-selected={isActive}
      onClick={onClick}
      className="gallery-tab-btn inline-flex items-center justify-center rounded-full font-sans text-[11px] tracking-[0.2em] uppercase font-medium transition-all duration-300 hover:-translate-y-px outline-none focus-visible:ring-2 focus-visible:ring-[#C4A96A]/40"
      style={{
        padding:    "11px 28px",
        background: isActive ? "linear-gradient(135deg, #C9A96E 0%, #B8935A 55%, #C4A96A 100%)" : "transparent",
        color:      isActive ? "#fff" : "#3A3832",
        border:     isActive ? "none" : "1px solid rgba(58,56,50,0.28)",
        boxShadow:  isActive ? "0 4px 18px rgba(196,169,106,0.38), inset 0 1px 0 rgba(255,255,255,0.15)" : "none",
      }}
      onMouseEnter={(e) => {
        if (!isActive) {
          (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(196,169,106,0.55)";
          (e.currentTarget as HTMLButtonElement).style.color       = "#C4A96A";
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(58,56,50,0.28)";
          (e.currentTarget as HTMLButtonElement).style.color       = "#3A3832";
        }
      }}
    >
      {label}
    </button>
  );
}

/* ─────────────────────────────────────────────
   Video Card
───────────────────────────────────────────── */
/* ─────────────────────────────────────────────
   YouTube Embed
   Responsive 16:9 iframe with rounded corners,
   soft shadow, and a subtle warm border.
───────────────────────────────────────────── */
function YouTubeEmbed({ videoId, title }: { videoId: string; title: string }) {
  return (
    <div className="flex flex-col gap-3">
      {/* 16:9 responsive frame */}
      <div
        className="relative w-full overflow-hidden rounded-2xl"
        style={{
          aspectRatio: "16 / 9",
          boxShadow:   "0 8px 36px rgba(58,56,50,0.14)",
          border:      "1px solid rgba(196,169,106,0.15)",
          background:  "#1a1816",
        }}
      >
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&color=white`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          loading="lazy"
          className="absolute inset-0 w-full h-full"
          style={{ border: "none" }}
        />
      </div>

      {/* Caption */}
      <p
        className="font-sans text-center text-[11px] tracking-[0.16em] uppercase"
        style={{ color: "#1a1a1a", fontWeight: 700 }}
      >
        {title}
      </p>
    </div>
  );
}
