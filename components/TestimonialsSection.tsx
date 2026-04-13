"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";

const testimonials = [
  {
    name: "Sophia L.",
    location: "Hoboken, NJ",
    rating: 5,
    text: "Walking into Shear Madness feels like stepping into a different world — calm, beautiful, and so intentional. My hair has never looked better, and I leave every visit feeling genuinely restored.",
    service: "Balayage & Cut",
  },
  {
    name: "Michelle K.",
    location: "Jersey City, NJ",
    rating: 5,
    text: "The most peaceful salon experience I've ever had. The atmosphere is stunning, the stylists are true artists, and the results speak for themselves. I won't go anywhere else.",
    service: "Updo & Styling",
  },
  {
    name: "Natalie R.",
    location: "Manhattan, NY",
    rating: 5,
    text: "I've tried salons all over New York and Hoboken, and nothing comes close. It's the combination of skill, care, and environment — everything feels elevated and considered.",
    service: "Keratin Treatment",
  },
  {
    name: "James T.",
    location: "Hoboken, NJ",
    rating: 5,
    text: "As someone who was always nervous about haircuts, Shear Madness completely changed my perspective. The team takes their time, listens, and delivers every single time.",
    service: "Men's Cut",
  },
];

function StarIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path
        d="M7 1 L8.5 5 L13 5 L9.5 7.5 L11 12 L7 9.5 L3 12 L4.5 7.5 L1 5 L5.5 5Z"
        fill="#C4A96A"
      />
    </svg>
  );
}

export default function TestimonialsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  const [active, setActive] = useState(0);

  return (
    <section id="testimonials" className="relative py-28 md:py-40 bg-[#FAF6EF]">
      {/* Decorative background quote mark */}
      <div className="absolute top-16 left-1/2 -translate-x-1/2 pointer-events-none select-none opacity-[0.03]">
        <span
          className="font-serif text-[#C4A96A]"
          style={{ fontSize: "clamp(12rem, 20vw, 22rem)", lineHeight: 1 }}
        >
          &ldquo;
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Header */}
        <div className="text-center mb-20" ref={ref}>
          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            animate={isInView ? { scaleX: 1, opacity: 1 } : {}}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="w-16 h-px bg-[#C4A96A] mx-auto mb-8"
          />
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-[#8FA68C] text-xs tracking-[0.3em] uppercase font-sans font-medium mb-4"
          >
            Client Stories
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
            className="font-serif text-[#556B2F] leading-[1.1]"
            style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)", fontWeight: 300 }}
          >
            Words from
            <em> Our Guests</em>
          </motion.h2>
        </div>

        {/* Featured Testimonial */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
          className="max-w-3xl mx-auto text-center mb-16"
        >
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex justify-center gap-1 mb-6">
              {Array.from({ length: testimonials[active].rating }).map((_, i) => (
                <StarIcon key={i} />
              ))}
            </div>
            <p
              className="font-serif text-[#3A3832] italic leading-[1.7] mb-8"
              style={{ fontSize: "clamp(1.05rem, 2.5vw, 1.35rem)", fontWeight: 400, color: "#111111", lineHeight: 1.75 }}
            >
              &ldquo;{testimonials[active].text}&rdquo;
            </p>
            <div>
              <p className="font-sans text-[#3A3832] font-medium text-sm tracking-wider">
                {testimonials[active].name}
              </p>
              <p className="font-sans text-[#8FA68C] text-xs tracking-[0.15em] uppercase mt-1">
                {testimonials[active].service} · {testimonials[active].location}
              </p>
            </div>
          </motion.div>
        </motion.div>

        {/* Testimonial selector dots + mini cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {testimonials.map((t, i) => (
            <motion.button
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.4 + i * 0.08 }}
              onClick={() => setActive(i)}
              className={`text-left p-5 border transition-all duration-400 rounded-sm cursor-pointer ${
                active === i
                  ? "border-[#C4A96A] bg-white shadow-[0_4px_24px_rgba(196,169,106,0.12)] -translate-y-0.5"
                  : "border-[#E4DDD4] bg-transparent hover:border-[#C4A96A]/40 hover:bg-white/50 hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(196,169,106,0.10)]"
              }`}
            >
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: t.rating }).map((_, si) => (
                  <StarIcon key={si} />
                ))}
              </div>
              <p className="font-sans text-[#3A3832] text-xs font-medium mb-0.5">
                {t.name}
              </p>
              <p className="font-sans text-[#8FA68C] text-[10px] tracking-wider uppercase">
                {t.service}
              </p>
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
}
