"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CustomCursor from "@/components/CustomCursor";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

function LotusPetal({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 120 180"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={style}
    >
      <path
        d="M60 175 C60 175 8 120 8 70 C8 30 30 5 60 5 C90 5 112 30 112 70 C112 120 60 175 60 175Z"
        fill="currentColor"
        opacity="0.9"
      />
      <path
        d="M60 165 C60 165 22 115 22 72 C22 38 38 18 60 18 C82 18 98 38 98 72 C98 115 60 165 60 165Z"
        fill="white"
        opacity="0.25"
      />
    </svg>
  );
}

const contactDetails = [
  {
    label: "Address",
    value: "80 Park Ave\nHoboken, NJ 07030",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
        <circle cx="12" cy="9" r="2.5" />
      </svg>
    ),
    action: {
      label: "Get Directions",
      href: "https://maps.google.com/?q=80+Park+Ave+Hoboken+NJ+07030",
    },
  },
  {
    label: "Phone",
    value: "(201) 222-2102",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.4 21 3 13.6 3 4.5c0-.6.4-1 1-1H8c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z" />
      </svg>
    ),
    action: { label: "Call Now", href: "tel:+12012222102" },
  },
  {
    label: "Email",
    value: "hello@shearmadness.com",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
      </svg>
    ),
    action: { label: "Send Email", href: "mailto:hello@shearmadness.com" },
  },
  {
    label: "Instagram",
    value: "@shearmadnesshoboken",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="2" y="2" width="20" height="20" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
      </svg>
    ),
    action: { label: "Follow Us", href: "https://www.instagram.com" },
  },
];

const hours = [
  { day: "Tue – Thu", time: "10:00 am – 9:00 pm" },
  { day: "Fri",       time: "10:00 am – 8:00 pm" },
  { day: "Sat",       time: "10:00 am – 6:00 pm" },
  { day: "Sun – Mon", time: "Closed"              },
];

// ── HERO ────────────────────────────────────────────────────────────────────

function ContactHero() {
  return (
    <section
      className="relative flex items-center justify-center overflow-hidden"
      style={{ minHeight: "64vh", background: "#FAF6EF" }}
    >
      {/* Lotus cluster — top right */}
      <div
        className="absolute -top-8 -right-8 w-64 h-64 pointer-events-none opacity-[0.07]"
        style={{ color: "#7A5C10" }}
      >
        {[0, 40, 80, 120, 160, 200, 240, 280, 320].map((angle) => (
          <LotusPetal
            key={angle}
            className="absolute w-14 h-20 top-1/2 left-1/2 -translate-x-1/2 origin-bottom"
            style={
              {
                transform: `rotate(${angle}deg) translateY(-50%)`,
              } as React.CSSProperties
            }
          />
        ))}
      </div>

      {/* Lotus cluster — bottom left */}
      <div
        className="absolute -bottom-6 -left-6 w-44 h-44 pointer-events-none opacity-[0.05]"
        style={{ color: "#8FA68C" }}
      >
        {[0, 60, 120, 180, 240, 300].map((angle) => (
          <LotusPetal
            key={angle}
            className="absolute w-10 h-16 top-1/2 left-1/2 origin-bottom"
            style={
              {
                transform: `rotate(${angle}deg) translateY(-50%)`,
              } as React.CSSProperties
            }
          />
        ))}
      </div>

      {/* Bottom section blend */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
        style={{
          background:
            "linear-gradient(to top, #FDFAF6 0%, rgba(253,250,246,0) 100%)",
        }}
      />

      {/* Content */}
      <div className="relative z-10 text-center px-6 py-32 md:py-40">
        {/* Gold rule */}
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 1.1, ease: EASE }}
          className="w-14 h-px mx-auto mb-8 origin-center"
          style={{
            background:
              "linear-gradient(90deg, transparent, #C4A96A, transparent)",
          }}
        />

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.12 }}
          className="font-sans text-[#8FA68C] text-[10px] tracking-[0.38em] uppercase font-medium mb-5"
        >
          Shear Madness · Hoboken NJ
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.15, ease: EASE, delay: 0.2 }}
          className="font-serif text-[#556B2F] leading-[1.0] mb-7"
          style={{
            fontSize: "clamp(3.2rem, 7.5vw, 6.2rem)",
            fontWeight: 400,
          }}
        >
          Contact Us
        </motion.h1>

        {/* Ornamental divider */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.95, ease: EASE, delay: 0.52 }}
          className="flex items-center justify-center gap-3 mb-7"
        >
          <div
            className="h-px w-10"
            style={{
              background:
                "linear-gradient(to right, transparent, rgba(196,169,106,0.7))",
            }}
          />
          <div
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: "#C4A96A", opacity: 0.8 }}
          />
          <div
            className="h-px w-10"
            style={{
              background:
                "linear-gradient(to left, transparent, rgba(196,169,106,0.7))",
            }}
          />
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: EASE, delay: 0.64 }}
          className="font-serif text-[#3A3832]/62 italic mb-12"
          style={{
            fontSize: "clamp(1rem, 2.2vw, 1.45rem)",
            fontWeight: 400,
          }}
        >
          Visit, book, or reach out — we look forward to welcoming you.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: EASE, delay: 0.84 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          {/* Book Now */}
          <a
            href="/booking"
            className="group relative inline-flex items-center justify-center rounded-full font-sans text-[11px] tracking-[0.22em] uppercase font-medium text-white transition-all duration-400 hover:-translate-y-0.5 overflow-hidden"
            style={{
              padding: "14px 38px",
              background:
                "linear-gradient(135deg, #C9A96E 0%, #B8935A 55%, #C4A96A 100%)",
              boxShadow:
                "0 5px 26px rgba(196,169,106,0.50), inset 0 1px 0 rgba(255,255,255,0.2)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.boxShadow =
                "0 9px 34px rgba(196,169,106,0.65), inset 0 1px 0 rgba(255,255,255,0.22)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.boxShadow =
                "0 5px 26px rgba(196,169,106,0.50), inset 0 1px 0 rgba(255,255,255,0.2)";
            }}
          >
            <span
              className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{
                background:
                  "linear-gradient(105deg, transparent 38%, rgba(255,255,255,0.22) 50%, transparent 62%)",
              }}
            />
            <span className="relative z-10">Book Now</span>
          </a>

          {/* Call Us */}
          <a
            href="tel:+12012222102"
            className="group relative inline-flex items-center justify-center gap-2 rounded-full font-sans text-[11px] tracking-[0.22em] uppercase font-medium text-[#2C2A25] transition-all duration-400 hover:-translate-y-0.5 overflow-hidden"
            style={{
              padding: "14px 38px",
              background: "rgba(253,250,246,0.55)",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
              border: "1.5px solid rgba(58,56,50,0.22)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.borderColor =
                "rgba(196,169,106,0.55)";
              (e.currentTarget as HTMLAnchorElement).style.boxShadow =
                "0 6px 24px rgba(196,169,106,0.16)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.borderColor =
                "rgba(58,56,50,0.22)";
              (e.currentTarget as HTMLAnchorElement).style.boxShadow = "none";
            }}
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              className="relative z-10"
            >
              <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.4 21 3 13.6 3 4.5c0-.6.4-1 1-1H8c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z" />
            </svg>
            <span className="relative z-10">Call Us</span>
          </a>
        </motion.div>
      </div>
    </section>
  );
}

// ── CONTACT INFO + MAP ──────────────────────────────────────────────────────

function ContactInfoMap() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  const fadeUp = (delay: number) => ({
    initial: { opacity: 0, y: 24 },
    animate: isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 },
    transition: { duration: 0.85, ease: EASE, delay },
  });

  return (
    <section className="relative py-24 md:py-40" style={{ background: "#FDFAF6" }}>
      {/* Subtle dot-grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.022]"
        style={{
          backgroundImage:
            "radial-gradient(circle, #8FA68C 1px, transparent 1px)",
          backgroundSize: "36px 36px",
        }}
      />

      <div ref={ref} className="relative z-10 max-w-7xl mx-auto px-6 md:px-12">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            animate={isInView ? { scaleX: 1, opacity: 1 } : {}}
            transition={{ duration: 1.1, ease: EASE }}
            className="w-14 h-px mx-auto mb-8 origin-center"
            style={{
              background:
                "linear-gradient(90deg, transparent, #C4A96A, transparent)",
            }}
          />
          <motion.p
            {...fadeUp(0.1)}
            className="font-sans text-[#8FA68C] text-[10px] tracking-[0.35em] uppercase font-medium mb-3"
          >
            Find Us
          </motion.p>
          <motion.h2
            {...fadeUp(0.2)}
            className="font-serif text-[#556B2F] leading-[1.08]"
            style={{ fontSize: "clamp(1.9rem, 4vw, 3.4rem)", fontWeight: 300 }}
          >
            Visit the Salon
          </motion.h2>
        </div>

        {/* Two-column */}
        <div className="grid md:grid-cols-2 gap-10 md:gap-20 items-start">

          {/* LEFT — info blocks */}
          <div className="space-y-3">
            {contactDetails.map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: -20 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.8, ease: EASE, delay: 0.2 + i * 0.1 }}
                className="group flex gap-5 p-6 rounded-sm transition-all duration-400 hover:-translate-y-px"
                style={{
                  background: "rgba(253,250,246,0.95)",
                  border: "1px solid rgba(196,169,106,0.14)",
                  boxShadow: "0 2px 18px rgba(58,56,50,0.05)",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.boxShadow =
                    "0 8px 36px rgba(196,169,106,0.12)";
                  (e.currentTarget as HTMLDivElement).style.borderColor =
                    "rgba(196,169,106,0.30)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.boxShadow =
                    "0 2px 18px rgba(58,56,50,0.05)";
                  (e.currentTarget as HTMLDivElement).style.borderColor =
                    "rgba(196,169,106,0.14)";
                }}
              >
                <div className="flex-shrink-0 mt-0.5 text-[#C4A96A]">
                  {item.icon}
                </div>
                <div className="flex-1">
                  <p className="font-sans text-[#8FA68C] text-[9px] tracking-[0.32em] uppercase font-medium mb-1.5">
                    {item.label}
                  </p>
                  <p
                    className="font-serif text-[#2C2A25] whitespace-pre-line"
                    style={{ fontSize: "1.05rem", fontWeight: 400, lineHeight: 1.55 }}
                  >
                    {item.value}
                  </p>
                  {item.action && (
                    <a
                      href={item.action.href}
                      target={item.action.href.startsWith("http") ? "_blank" : undefined}
                      rel={item.action.href.startsWith("http") ? "noopener noreferrer" : undefined}
                      className="inline-flex items-center gap-1.5 mt-2.5 font-sans text-[10px] tracking-[0.18em] uppercase text-[#C4A96A] hover:text-[#B8935A] transition-colors duration-300 group/link"
                    >
                      {item.action.label}
                      <span className="transition-transform duration-300 group-hover/link:translate-x-0.5">→</span>
                    </a>
                  )}
                </div>
              </motion.div>
            ))}

            {/* Hours block */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, ease: EASE, delay: 0.62 }}
              className="p-6 rounded-sm"
              style={{
                background: "rgba(253,250,246,0.95)",
                border: "1px solid rgba(196,169,106,0.14)",
                boxShadow: "0 2px 18px rgba(58,56,50,0.05)",
              }}
            >
              <div className="flex gap-5">
                <div className="flex-shrink-0 mt-0.5 text-[#C4A96A]">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="font-sans text-[#8FA68C] text-[9px] tracking-[0.32em] uppercase font-medium mb-4">
                    Hours
                  </p>
                  <div className="space-y-2.5">
                    {hours.map((h) => (
                      <div
                        key={h.day}
                        className="flex justify-between items-baseline gap-3"
                      >
                        <span style={{ fontFamily: "sans-serif", color: "#000000", fontWeight: 800, fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", flexShrink: 0 }}>
                          {h.day}
                        </span>
                        <div
                          className="flex-1 h-px"
                          style={{ background: "rgba(196,169,106,0.14)" }}
                        />
                        <span style={{
                          fontFamily: "sans-serif",
                          fontSize: "13px",
                          fontWeight: 800,
                          flexShrink: 0,
                          color: h.time === "Closed" ? "rgba(0,0,0,0.40)" : "#000000",
                          fontStyle: h.time === "Closed" ? "italic" : "normal",
                        }}>
                          {h.time}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* RIGHT — map */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 18 }}
            animate={isInView ? { opacity: 1, scale: 1, y: 0 } : {}}
            transition={{ duration: 1.15, ease: EASE, delay: 0.32 }}
            className="sticky top-28"
          >
            {/* Corner accent */}
            <div className="absolute -top-3 -right-3 w-20 h-20 border border-[#C4A96A]/22 rounded-sm pointer-events-none z-0" />

            {/* Map frame */}
            <div
              className="relative z-10 overflow-hidden rounded-sm"
              style={{
                boxShadow:
                  "0 12px 56px rgba(58,56,50,0.10), 0 2px 10px rgba(58,56,50,0.06)",
                border: "1px solid rgba(196,169,106,0.18)",
              }}
            >
              <iframe
                src="https://maps.google.com/maps?q=80+Park+Ave+Hoboken+NJ+07030&output=embed&z=15"
                width="100%"
                height="460"
                style={{ border: 0, display: "block" }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Shear Madness Hoboken location"
              />
            </div>

            {/* Get Directions */}
            <div className="mt-5 flex items-center justify-between flex-wrap gap-4">
              <p className="font-sans text-[#3A3832]/45 text-[11px] tracking-[0.1em]">
                80 Park Ave, Hoboken, NJ 07030
              </p>
              <a
                href="https://maps.google.com/?q=80+Park+Ave+Hoboken+NJ+07030"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2.5 font-sans text-[10.5px] tracking-[0.2em] uppercase font-medium text-[#C4A96A] transition-all duration-400 hover:gap-3.5"
              >
                Get Directions
                <span className="block h-px w-7 bg-[#C4A96A] transition-all duration-400 group-hover:w-10" />
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ── SOCIAL SECTION ──────────────────────────────────────────────────────────

function SocialSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section
      className="relative py-24 md:py-36 overflow-hidden"
      style={{ background: "#FAF6EF" }}
    >
      {/* Water-wave top edge */}
      <svg
        className="absolute top-0 left-0 w-full pointer-events-none"
        viewBox="0 0 1440 72"
        fill="none"
        preserveAspectRatio="none"
        style={{ opacity: 0.045 }}
      >
        <path
          d="M0 36 Q360 8 720 36 Q1080 64 1440 36 L1440 0 L0 0Z"
          fill="#C4A96A"
        />
      </svg>

      {/* Water-wave bottom edge */}
      <svg
        className="absolute bottom-0 left-0 w-full pointer-events-none"
        viewBox="0 0 1440 72"
        fill="none"
        preserveAspectRatio="none"
        style={{ opacity: 0.035 }}
      >
        <path
          d="M0 36 Q360 64 720 36 Q1080 8 1440 36 L1440 72 L0 72Z"
          fill="#8FA68C"
        />
      </svg>

      <div
        ref={ref}
        className="relative z-10 w-full max-w-2xl mx-auto px-6 md:px-12 text-center"
      >
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={isInView ? { scaleX: 1, opacity: 1 } : {}}
          transition={{ duration: 1.1, ease: EASE }}
          className="w-14 h-px mx-auto mb-9 origin-center"
          style={{
            background:
              "linear-gradient(90deg, transparent, #C4A96A, transparent)",
          }}
        />

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="font-sans text-[#8FA68C] text-[10px] tracking-[0.35em] uppercase font-medium mb-4"
        >
          Stay Connected
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.95, ease: EASE, delay: 0.18 }}
          className="font-serif text-[#556B2F] leading-[1.08] mb-5"
          style={{ fontSize: "clamp(1.9rem, 4vw, 3.4rem)", fontWeight: 300 }}
        >
          Follow Our Work
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, ease: EASE, delay: 0.3 }}
          className="font-sans text-[#3A3832]/58 leading-[1.9] mb-12"
          style={{ fontSize: "0.93rem" }}
        >
          See our latest styles, salon moments, and transformations.
          <br />
          We share our craft — one appointment at a time.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, ease: EASE, delay: 0.42 }}
          className="flex flex-col items-center gap-6"
        >
          {/* Instagram handle card */}
          <div
            className="inline-flex items-center gap-4 px-8 py-5 rounded-sm transition-all duration-400 hover:-translate-y-0.5"
            style={{
              background: "rgba(253,250,246,0.95)",
              border: "1px solid rgba(196,169,106,0.18)",
              boxShadow: "0 4px 24px rgba(58,56,50,0.07)",
            }}
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#C4A96A"
              strokeWidth="1.4"
            >
              <rect x="2" y="2" width="20" height="20" rx="5" />
              <circle cx="12" cy="12" r="4" />
              <circle cx="17.5" cy="6.5" r="1" fill="#C4A96A" stroke="none" />
            </svg>
            <div className="text-left">
              <p className="font-sans text-[#3A3832]/40 text-[9px] tracking-[0.28em] uppercase mb-0.5">
                Instagram
              </p>
              <p
                className="font-serif text-[#2C2A25]"
                style={{ fontSize: "1.05rem", fontWeight: 400 }}
              >
                @shearmadnesshoboken
              </p>
            </div>
          </div>

          {/* Follow button */}
          <a
            href="https://www.instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative inline-flex items-center gap-3 rounded-full font-sans text-[11px] tracking-[0.2em] uppercase font-medium text-white transition-all duration-400 hover:-translate-y-0.5 overflow-hidden"
            style={{
              padding: "13px 36px",
              background:
                "linear-gradient(135deg, #C9A96E 0%, #B8935A 55%, #C4A96A 100%)",
              boxShadow: "0 5px 22px rgba(196,169,106,0.45)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.boxShadow =
                "0 9px 30px rgba(196,169,106,0.62)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.boxShadow =
                "0 5px 22px rgba(196,169,106,0.45)";
            }}
          >
            <span
              className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{
                background:
                  "linear-gradient(105deg, transparent 38%, rgba(255,255,255,0.22) 50%, transparent 62%)",
              }}
            />
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              className="relative z-10"
            >
              <rect x="2" y="2" width="20" height="20" rx="5" />
              <circle cx="12" cy="12" r="4" />
              <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
            </svg>
            <span className="relative z-10">Follow on Instagram</span>
          </a>
        </motion.div>
      </div>
    </section>
  );
}

// ── BOOKING CTA ─────────────────────────────────────────────────────────────

function ContactBookingCTA() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section
      id="contact-booking"
      className="relative py-32 md:py-52 overflow-hidden"
      style={{ background: "#F4EFE5" }}
    >
      {/* Lotus bloom — top right */}
      <div className="absolute -top-12 -right-12 w-72 h-72 pointer-events-none opacity-[0.065]">
        <svg viewBox="0 0 300 300" fill="none">
          {[0, 36, 72, 108, 144, 180, 216, 252, 288, 324].map((angle, i) => (
            <ellipse
              key={i}
              cx="150"
              cy="55"
              rx="16"
              ry="50"
              fill="#C4A96A"
              transform={`rotate(${angle} 150 150)`}
            />
          ))}
          <circle cx="150" cy="150" r="22" fill="#C4A96A" opacity="0.3" />
        </svg>
      </div>

      {/* Lotus bloom — bottom left */}
      <div className="absolute -bottom-12 -left-12 w-80 h-80 pointer-events-none opacity-[0.05]">
        <svg viewBox="0 0 300 300" fill="none">
          {[0, 40, 80, 120, 160, 200, 240, 280, 320].map((angle, i) => (
            <ellipse
              key={i}
              cx="150"
              cy="55"
              rx="18"
              ry="54"
              fill="#8FA68C"
              transform={`rotate(${angle} 150 150)`}
            />
          ))}
          <circle cx="150" cy="150" r="24" fill="#8FA68C" opacity="0.25" />
        </svg>
      </div>

      {/* Water ripple */}
      <svg
        className="absolute bottom-0 left-0 w-full pointer-events-none"
        viewBox="0 0 1440 80"
        fill="none"
        preserveAspectRatio="none"
        style={{ opacity: 0.045 }}
      >
        <path
          d="M0 40 Q240 10 480 40 Q720 70 960 40 Q1200 10 1440 40 L1440 80 L0 80Z"
          fill="#8FA68C"
        />
        <path
          d="M0 55 Q240 30 480 55 Q720 80 960 55 Q1200 30 1440 55 L1440 80 L0 80Z"
          fill="#C4A96A"
          opacity="0.5"
        />
      </svg>

      <div
        ref={ref}
        className="relative z-10 max-w-2xl mx-auto px-6 md:px-12 text-center"
      >
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={isInView ? { scaleX: 1, opacity: 1 } : {}}
          transition={{ duration: 1.1, ease: EASE }}
          className="w-14 h-px mx-auto mb-9 origin-center"
          style={{
            background:
              "linear-gradient(90deg, transparent, #C4A96A, transparent)",
          }}
        />

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.12 }}
          className="font-sans text-[#8FA68C] text-[10px] tracking-[0.35em] uppercase font-medium mb-5"
        >
          Reserve Your Visit
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 28 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, ease: EASE, delay: 0.22 }}
          className="font-serif text-[#556B2F] leading-[1.08] mb-5"
          style={{ fontSize: "clamp(2.2rem, 5vw, 4rem)", fontWeight: 300 }}
        >
          Ready for Your
          <br />
          <em>Next Appointment?</em>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, ease: EASE, delay: 0.35 }}
          className="font-sans text-[#3A3832]/58 text-[0.92rem] leading-[1.9] mb-12 max-w-md mx-auto"
        >
          Book your visit and experience Shear Madness in person — a salon
          designed around balance, beauty, and care.
        </motion.p>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, delay: 0.48 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14"
        >
          {/* Book Now */}
          <a
            href="/booking"
            className="group relative inline-flex items-center justify-center gap-2.5 rounded-full font-sans text-[11px] tracking-[0.2em] uppercase font-medium text-white transition-all duration-400 hover:-translate-y-0.5 overflow-hidden"
            style={{
              padding: "15px 36px",
              background:
                "linear-gradient(135deg, #C9A96E 0%, #B8935A 55%, #C4A96A 100%)",
              boxShadow:
                "0 5px 24px rgba(196,169,106,0.48), inset 0 1px 0 rgba(255,255,255,0.18)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.boxShadow =
                "0 9px 32px rgba(196,169,106,0.62), inset 0 1px 0 rgba(255,255,255,0.22)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.boxShadow =
                "0 5px 24px rgba(196,169,106,0.48), inset 0 1px 0 rgba(255,255,255,0.18)";
            }}
          >
            <span
              className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{
                background:
                  "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.18) 50%, transparent 60%)",
              }}
            />
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              className="relative z-10"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M16 2v4 M8 2v4 M3 10h18" />
            </svg>
            <span className="relative z-10">Book Now</span>
          </a>

          {/* Call Us */}
          <a
            href="tel:+12012222102"
            className="inline-flex items-center justify-center gap-2.5 rounded-full font-sans text-[11px] tracking-[0.2em] uppercase font-medium text-[#2C2A25] transition-all duration-400 hover:-translate-y-0.5"
            style={{
              padding: "15px 36px",
              border: "1px solid rgba(58,56,50,0.25)",
              background: "transparent",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.borderColor =
                "rgba(196,169,106,0.55)";
              (e.currentTarget as HTMLAnchorElement).style.color = "#C4A96A";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.borderColor =
                "rgba(58,56,50,0.25)";
              (e.currentTarget as HTMLAnchorElement).style.color = "#2C2A25";
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
            >
              <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.4 21 3 13.6 3 4.5c0-.6.4-1 1-1H8c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z" />
            </svg>
            Call Us
          </a>
        </motion.div>

        {/* Trust signals */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.72 }}
          className="flex items-center gap-6 flex-wrap justify-center"
        >
          {["Walk-ins Welcome", "Online Booking", "Gift Cards"].map((item) => (
            <div key={item} className="flex items-center gap-1.5 text-[#3A3832]/38">
              <div className="w-1 h-1 rounded-full bg-[#C4A96A]/60" />
              <span className="font-sans text-[10px] tracking-wider uppercase">
                {item}
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ── PAGE ─────────────────────────────────────────────────────────────────────

export default function ContactPageClient() {
  return (
    <main className="min-h-screen">
      <CustomCursor />
      <Navbar />
      <ContactHero />
      <ContactInfoMap />
      <SocialSection />
      <ContactBookingCTA />
      <Footer />
    </main>
  );
}
