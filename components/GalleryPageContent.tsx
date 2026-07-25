"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback, useRef } from "react";
import type { SitePortfolioImage, SiteTestimonial } from "@/lib/site-data";
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

const CATEGORY_MAP: Record<string, ImageCategory> = {
  men:   "Men",
  women: "Women",
  both:  "Hair & Makeup",
}

function buildGalleryItems(portfolioImages: SitePortfolioImage[]): GalleryItem[] {
  return portfolioImages.map((img, i, arr) => {
    const sameCat = arr.filter(x => x.category === img.category)
    const myIdx   = sameCat.findIndex(x => x.id === img.id)
    const next    = sameCat[(myIdx + 1) % sameCat.length]
    // Card shows the thumbnail (single clean portrait). If none was uploaded,
    // fall back to the multi-angle collage (img.url) so the card is never empty.
    const cardPreview = img.thumbnail_url || img.url
    const nextPreview = next?.thumbnail_url || next?.url || cardPreview
    return {
      id:           i + 1,
      previewImage: cardPreview,
      backImage:    nextPreview,
      // Lightbox opens the multi-angle collage. full_url kept as legacy override.
      fullImage:    img.full_url ?? img.url,
      alt:          img.alt || img.title || "Gallery image",
      category:     CATEGORY_MAP[img.category] ?? "Men",
    }
  })
}

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
   Page
───────────────────────────────────────────── */
export default function GalleryPageContent({
  bgImage,
  portfolioImages = [],
  testimonials    = [],
}: {
  bgImage?:         string;
  portfolioImages?: SitePortfolioImage[];
  testimonials?:    SiteTestimonial[];
}) {
  const galleryItems = buildGalleryItems(portfolioImages);

  const [activeTab, setActiveTab]       = useState<ActiveTab>("All");
  const [lightboxItem, setLightboxItem] = useState<GalleryItem | null>(null);
  const [allItems, setAllItems]         = useState<GalleryItem[]>(galleryItems);
  useEffect(() => { setAllItems(shuffle([...galleryItems])); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const visibleItems: GalleryItem[] =
    activeTab === "All"    ? allItems :
    activeTab === "Videos" ? []       :
    galleryItems.filter((item) => item.category === activeTab);

  const isVideos = activeTab === "Videos";

  const closeLightbox = useCallback(() => setLightboxItem(null), []);

  useEffect(() => {
    if (!lightboxItem) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") closeLightbox(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxItem, closeLightbox]);

  useEffect(() => {
    if (!lightboxItem) return;
    const scrollY = window.scrollY;
    document.body.style.position = "fixed";
    document.body.style.top      = `-${scrollY}px`;
    document.body.style.width    = "100%";
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.position = "";
      document.body.style.top      = "";
      document.body.style.width    = "";
      document.body.style.overflow = "";
      window.scrollTo(0, scrollY);
    };
  }, [lightboxItem]);

  const resolvedBg = bgImage ?? "/gallery-bg2.jpg";

  return (
    <>
    <div
      className="gallery-bg-section"
      data-cms-bg={bgImage ?? "FALLBACK:/gallery-bg2.jpg"}
      style={{
        position: "relative",
        backgroundImage: `url('${bgImage ?? "/gallery-bg2.jpg"}')`,
        backgroundAttachment: "fixed",
        backgroundSize: "100% auto",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "top center",
        backgroundColor: "#FAF6EF",
      }}
    >

    <section
      className="relative min-h-screen overflow-x-hidden"
      style={{
        paddingTop: "calc(var(--navbar-h, 80px) + 2.4rem)",
        zIndex: 1,
      }}
    >
      {/* ── All content above bg ── */}
      <div className="relative z-10">

      {/* ── Header ── */}
      <div id="portfolio" className="flex flex-col items-center text-center px-6 pb-10 md:pb-12" style={{ scrollMarginTop: "calc(var(--navbar-h) + 16px)" }}>
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
      <div className="pb-14 md:pb-20 mt-2 md:mt-4">
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
    <ReviewsSection testimonials={testimonials} />
    </div>{/* end shared bg wrapper */}
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
  const [current,       setCurrent]       = useState(0);
  const [paused,        setPaused]        = useState(false);
  const [manualPaused,  setManualPaused]  = useState(false);
  const [visibleCount,  setVisibleCount]  = useState(3);
  const [containerW,   setContainerW]   = useState(0);

  const trackWrapRef = useRef<HTMLDivElement>(null);
  const autoRef      = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const dragStart    = useRef<number | null>(null);

  const N        = items.length;
  const GAP      = 0;
  const cardW    = containerW > 0 ? (containerW - GAP * (visibleCount - 1)) / visibleCount : 0;
  const maxIndex = Math.max(0, N - visibleCount);

  if (N === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4, ease: EASE }}
        className="flex flex-col items-center justify-center py-28 text-center"
      >
        <p className="font-sans text-[#3A3832]/40 text-sm tracking-[0.12em] uppercase">
          No images in this category yet
        </p>
      </motion.div>
    );
  }

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
    if (paused || manualPaused || N <= visibleCount) return;
    autoRef.current = setInterval(() => {
      setCurrent(c => (c >= maxIndex ? 0 : c + 1));
    }, 3000);
    return () => clearInterval(autoRef.current);
  }, [paused, manualPaused, N, visibleCount, maxIndex]);

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
      className="gallery-card-grid-pad w-full overflow-x-hidden"
      style={{ paddingTop: "clamp(1.5rem, 3vw, 2.5rem)", paddingLeft: "clamp(2rem, 8vw, 10rem)", paddingRight: "clamp(2rem, 8vw, 10rem)" }}
    >
      <div className="relative">
        <div
          ref={trackWrapRef}
          className="w-full overflow-hidden select-none hide-scrollbar"
          style={{ cursor: "grab", touchAction: "pan-y" }}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => { setPaused(false); dragStart.current = null; }}
          onTouchStart={() => setPaused(true)}
          onTouchEnd={() => setPaused(false)}
          onTouchCancel={() => setPaused(false)}
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
                <GalleryCard
                  item={item}
                  onClick={() => onCardClick(item)}
                  onHoverStart={() => setPaused(true)}
                  onHoverEnd={() => setPaused(false)}
                />
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
        <div className="flex justify-center items-center gap-3 mt-4">
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

          {/* Pause / Play button */}
          <button
            onClick={() => setManualPaused(p => !p)}
            aria-label={manualPaused ? "Play" : "Pause"}
            style={{
              width: 26, height: 26, borderRadius: "50%",
              border: "1px solid rgba(196,169,106,0.45)",
              background: "rgba(253,250,246,0.90)",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", flexShrink: 0,
              boxShadow: "0 2px 8px rgba(58,56,50,0.08)",
            }}
          >
            {manualPaused ? (
              <svg width="9" height="10" viewBox="0 0 9 10" fill="none">
                <path d="M1.5 1L7.5 5L1.5 9V1Z" fill="#8A6840" />
              </svg>
            ) : (
              <svg width="9" height="10" viewBox="0 0 9 10" fill="none">
                <rect x="1" y="1" width="2.5" height="8" rx="1" fill="#8A6840" />
                <rect x="5.5" y="1" width="2.5" height="8" rx="1" fill="#8A6840" />
              </svg>
            )}
          </button>
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
function GalleryCard({
  item,
  onClick,
  onHoverStart,
  onHoverEnd,
}: {
  item: GalleryItem;
  onClick: () => void;
  onHoverStart?: () => void;
  onHoverEnd?: () => void;
}) {
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
      onMouseEnter={() => { setHovered(true); onHoverStart?.(); }}
      onMouseLeave={() => { setHovered(false); onHoverEnd?.(); }}
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
function TestimonialCard({ t }: { t: SiteTestimonial }) {
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
        &ldquo;{t.review}&rdquo;
      </p>

      {/* Divider */}
      <div style={{ height: 1, background: "linear-gradient(90deg, rgba(201,169,110,0.3), transparent)" }} />

      {/* Author */}
      <div>
        <p style={{ fontWeight: 600, fontSize: "0.87rem", color: "#3A3832", letterSpacing: "0.02em" }}>
          {t.customer_name}
        </p>
        <p style={{ fontSize: "0.75rem", color: "rgba(58,56,50,0.48)", marginTop: 2, letterSpacing: "0.04em" }}>
          Google Review
        </p>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Reviews Section — horizontal testimonial carousel
───────────────────────────────────────────── */
function ReviewsSection({ testimonials }: { testimonials: SiteTestimonial[] }) {
  const [idx, setIdx]         = useState(0);
  const [paused, setPaused]   = useState(false);
  const [visibleCount, setVC] = useState(3);
  const [containerW, setW]    = useState(0);

  const trackRef   = useRef<HTMLDivElement>(null);
  const autoRef    = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const dragStart  = useRef<number | null>(null);
  const [transOn, setTransOn] = useState(true);

  const N        = testimonials.length;
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
      className="w-full relative overflow-hidden"
      style={{
        padding: "clamp(1.75rem, 3vw, 2.5rem) 0 clamp(2rem, 4vw, 3rem)",
        zIndex: 1,
      }}
    >

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
          onTouchStart={() => setPaused(true)}
          onTouchEnd={() => setPaused(false)}
          onTouchCancel={() => setPaused(false)}
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
            {testimonials.map((t, i) => (
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
      style={{ background: "rgba(18,16,12,0.9)", backdropFilter: "blur(6px)", touchAction: "none", overscrollBehavior: "none" }}
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
