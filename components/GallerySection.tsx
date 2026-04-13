"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

// Gallery items — replace src with actual image paths in /public/gallery/
const galleryItems = [
  { id: 1, caption: "Precision cut", aspect: "aspect-[4/5]", delay: 0 },
  { id: 2, caption: "Balayage blend", aspect: "aspect-square", delay: 0.08 },
  { id: 3, caption: "Updo styling", aspect: "aspect-[3/4]", delay: 0.16 },
  { id: 4, caption: "Color artistry", aspect: "aspect-square", delay: 0.24 },
  { id: 5, caption: "The salon", aspect: "aspect-[4/3]", delay: 0.1 },
  { id: 6, caption: "Treatment ritual", aspect: "aspect-[3/4]", delay: 0.18 },
];

// Tonal placeholder colors to suggest gallery imagery
const placeholderColors = [
  "from-[#E4DDD4] to-[#D9C9B8]",
  "from-[#D4E0D0] to-[#C4D4BF]",
  "from-[#E8E0D4] to-[#DDD0C4]",
  "from-[#F0E8D8] to-[#E4D8C8]",
  "from-[#D8DDD4] to-[#C8CEC4]",
  "from-[#E4D8CC] to-[#D8CCBC]",
];

export default function GallerySection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section id="gallery" className="relative py-28 md:py-40 bg-[#FDFAF6]">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-16 gap-6" ref={ref}>
          <div>
            <motion.div
              initial={{ scaleX: 0, opacity: 0 }}
              animate={isInView ? { scaleX: 1, opacity: 1 } : {}}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="w-16 h-px bg-[#C4A96A] mb-8"
            />
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="text-[#8FA68C] text-xs tracking-[0.3em] uppercase font-sans font-medium mb-4"
            >
              Portfolio
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 24 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
              className="font-serif text-[#556B2F] leading-[1.1]"
              style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)", fontWeight: 300 }}
            >
              The Archive
            </motion.h2>
          </div>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="font-sans text-[#3A3832]/55 text-sm leading-relaxed max-w-xs md:text-right"
          >
            A glimpse into our space, our craft,
            <br />
            and the beauty we create.
          </motion.p>
        </div>

        {/* Masonry-style Gallery Grid */}
        <div className="columns-2 md:columns-3 gap-4 space-y-4">
          {galleryItems.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 28, scale: 0.97 }}
              animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
              transition={{
                duration: 0.85,
                ease: [0.22, 1, 0.36, 1],
                delay: item.delay + 0.2,
              }}
              className="break-inside-avoid mb-4"
            >
              <GalleryItem item={item} color={placeholderColors[i]} />
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="text-center mt-16"
        >
          <a
            href="https://www.instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 text-[#3A3832]/60 text-sm tracking-[0.15em] uppercase font-sans hover:text-[#C4A96A] transition-colors duration-300"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="2" y="2" width="20" height="20" rx="5" />
              <circle cx="12" cy="12" r="4" />
              <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
            </svg>
            See more on Instagram
          </a>
        </motion.div>
      </div>
    </section>
  );
}

function GalleryItem({
  item,
  color,
}: {
  item: (typeof galleryItems)[number];
  color: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-sm cursor-pointer">
      {/* Placeholder image area */}
      <div className={`w-full ${item.aspect} bg-gradient-to-br ${color} transition-transform duration-700 group-hover:scale-105`}>
        {/* Decorative inner element */}
        <div className="absolute inset-0 flex items-center justify-center opacity-20">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <circle cx="20" cy="20" r="18" stroke="#C4A96A" strokeWidth="0.8" />
            <path
              d="M20 8 C20 8 12 14 12 20 C12 26 16 30 20 32 C24 30 28 26 28 20 C28 14 20 8 20 8Z"
              fill="#8FA68C"
              opacity="0.5"
            />
          </svg>
        </div>
      </div>

      {/* Hover overlay with caption */}
      <div className="absolute inset-0 bg-gradient-to-t from-[rgba(58,56,50,0.7)] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500">
        <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-2 group-hover:translate-y-0 transition-transform duration-400">
          <p
            className="font-serif text-white italic"
            style={{ fontSize: "0.95rem" }}
          >
            {item.caption}
          </p>
        </div>
      </div>

      {/* Top shine on hover */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(196,169,106,0.8)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    </div>
  );
}
