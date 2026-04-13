"use client";

import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { useRef } from "react";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const pillars = [
  {
    label: "A Calm Environment",
    description:
      "Every element of our space — the light, the texture, the quiet — is chosen to ease your mind from the moment you arrive.",
  },
  {
    label: "Expert Stylists",
    description:
      "Our artists are trained in the latest techniques across cuts, color, treatments, and styling for all hair types.",
  },
  {
    label: "Personalized Every Time",
    description:
      "We listen first. Every consultation is as individual as the person in the chair — no generic templates, ever.",
  },
  {
    label: "Professional Craftsmanship",
    description:
      "From a precision cut to a full color transformation, we hold every service to a standard of quiet excellence.",
  },
];

export default function ExperienceSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(contentRef, { once: true, margin: "-80px" });

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  // Very subtle image parallax
  const imageY = useTransform(scrollYProgress, [0, 1], ["5%", "-5%"]);

  return (
    <section
      id="experience"
      ref={sectionRef}
      className="relative py-28 md:py-44 overflow-hidden"
      style={{ background: "#F4EFE5" }}
    >
      {/* Water-wave SVG at bottom */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none overflow-hidden">
        <svg viewBox="0 0 1440 100" fill="none" preserveAspectRatio="none"
          className="w-full" style={{ opacity: 0.05 }}
        >
          <path d="M0 50 Q360 10 720 50 Q1080 90 1440 50 L1440 100 L0 100Z" fill="#8FA68C" />
          <path d="M0 65 Q360 30 720 65 Q1080 100 1440 65 L1440 100 L0 100Z" fill="#C4A96A" opacity="0.6" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12">

        {/* ── HEADER ────────────────────────────────────────────────────── */}
        <div className="text-center mb-20" ref={contentRef}>
          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            animate={isInView ? { scaleX: 1, opacity: 1 } : {}}
            transition={{ duration: 1.1, ease: EASE }}
            className="w-14 h-px mx-auto mb-9 origin-center"
            style={{ background: "linear-gradient(90deg, transparent, #C4A96A, transparent)" }}
          />
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="font-sans text-[#8FA68C] text-[10px] tracking-[0.35em] uppercase font-medium mb-4"
          >
            Our Artists
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 26 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1, ease: EASE, delay: 0.2 }}
            className="font-serif text-[#556B2F] leading-[1.08]"
            style={{ fontSize: "clamp(2.1rem, 5vw, 4rem)", fontWeight: 300 }}
          >
            Step Into Calm.
            <br />
            <em>Leave Transformed.</em>
          </motion.h2>
        </div>

        {/* ── TWO COLUMN ────────────────────────────────────────────────── */}
        <div className="grid md:grid-cols-2 gap-16 md:gap-24 items-center">

          {/* Image — with parallax */}
          <motion.div
            style={{ y: imageY }}
            className="relative order-2 md:order-1"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              whileHover={{ boxShadow: "0 28px 72px rgba(196,169,106,0.16)" }}
              transition={{ duration: 1.2, ease: EASE, delay: 0.3 }}
              className="relative aspect-[3/4] overflow-hidden rounded-sm"
              style={{ background: "linear-gradient(150deg, #E4DDD4, #CEC4B8)" }}
            >
              {/* Placeholder art */}
              <div className="absolute inset-0 flex items-center justify-center opacity-18 select-none">
                <svg width="72" height="96" viewBox="0 0 72 96" fill="none">
                  <path
                    d="M36 4C36 4 10 22 10 48C10 70 22 84 36 92C50 84 62 70 62 48C62 22 36 4 36 4Z"
                    fill="#8FA68C"
                  />
                  <path
                    d="M36 16C36 16 18 30 18 50C18 66 26 78 36 84C46 78 54 66 54 50C54 30 36 16 36 16Z"
                    fill="#C4A96A"
                    opacity="0.55"
                  />
                </svg>
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-transparent to-[rgba(196,169,106,0.07)]" />
            </motion.div>

            {/* Left gold line accent */}
            <motion.div
              initial={{ scaleY: 0 }}
              animate={isInView ? { scaleY: 1 } : {}}
              transition={{ duration: 1.1, ease: EASE, delay: 0.6 }}
              className="absolute -left-4 top-12 bottom-12 w-px origin-top"
              style={{
                background: "linear-gradient(to bottom, transparent, rgba(196,169,106,0.55), transparent)",
              }}
            />
          </motion.div>

          {/* Text */}
          <div className="order-1 md:order-2">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.9, ease: EASE, delay: 0.25 }}
              className="font-sans text-[#3A3832]/62 text-[0.93rem] leading-[1.9] mb-11"
            >
              From the moment you walk through our door, the outside world softens.
              The light is warm, the pace is unhurried, and every stylist at Shear
              Madness brings not only technical skill — but genuine attentiveness to
              every client who sits in their chair.
            </motion.p>

            {/* Pillars */}
            <div className="space-y-7">
              {pillars.map((pillar, i) => (
                <motion.div
                  key={pillar.label}
                  initial={{ opacity: 0, x: 18 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  whileHover={{ x: 4 }}
                  transition={{ duration: 0.8, ease: EASE, delay: 0.35 + i * 0.09 }}
                  className="flex gap-5 group cursor-default"
                >
                  <div className="flex-shrink-0 mt-[7px]">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#C4A96A] transition-all duration-300 group-hover:scale-125 group-hover:shadow-[0_0_6px_rgba(196,169,106,0.7)]" />
                  </div>
                  <div>
                    <h4
                      className="font-serif text-[#556B2F] mb-1.5 transition-colors duration-300 group-hover:text-[#C4A96A]"
                      style={{ fontSize: "1.1rem", fontWeight: 400 }}
                    >
                      {pillar.label}
                    </h4>
                    <p className="font-sans text-[#3A3832]/52 text-sm leading-[1.75] transition-colors duration-300 group-hover:text-[#3A3832]/70">
                      {pillar.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.9, delay: 0.82 }}
              className="mt-12"
            >
              <a
                href="#booking"
                className="group relative inline-flex items-center gap-3 rounded-full font-sans text-[11px] tracking-[0.2em] uppercase font-medium text-white transition-all duration-400 hover:-translate-y-0.5 overflow-hidden"
                style={{
                  padding: "13px 32px",
                  background: "linear-gradient(135deg, #8FA68C, #7A9477)",
                  boxShadow: "0 4px 20px rgba(143,166,140,0.42)",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.boxShadow =
                    "0 8px 28px rgba(143,166,140,0.58)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.boxShadow =
                    "0 4px 20px rgba(143,166,140,0.42)";
                }}
              >
                <span
                  className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background: "linear-gradient(105deg, transparent 38%, rgba(255,255,255,0.18) 50%, transparent 62%)",
                  }}
                />
                <span className="relative z-10">Meet the Team</span>
              </a>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
