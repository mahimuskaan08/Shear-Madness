"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export default function BookingCTA() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section
      id="booking"
      className="relative py-32 md:py-52 overflow-hidden"
      style={{ background: "#FAF6EF" }}
    >
      {/* ── DECORATIVE BACKGROUND ─────────────────────────────────────── */}
      {/* Lotus bloom — top left */}
      <div className="absolute -top-12 -left-12 w-72 h-72 pointer-events-none opacity-[0.065]">
        <svg viewBox="0 0 300 300" fill="none">
          {[0, 36, 72, 108, 144, 180, 216, 252, 288, 324].map((angle, i) => (
            <ellipse key={i} cx="150" cy="55" rx="16" ry="50"
              fill="#C4A96A" transform={`rotate(${angle} 150 150)`}
            />
          ))}
          <circle cx="150" cy="150" r="22" fill="#C4A96A" opacity="0.3" />
        </svg>
      </div>

      {/* Lotus bloom — bottom right */}
      <div className="absolute -bottom-12 -right-12 w-96 h-96 pointer-events-none opacity-[0.05]">
        <svg viewBox="0 0 400 400" fill="none">
          {[0, 40, 80, 120, 160, 200, 240, 280, 320].map((angle, i) => (
            <ellipse key={i} cx="200" cy="68" rx="20" ry="66"
              fill="#8FA68C" transform={`rotate(${angle} 200 200)`}
            />
          ))}
          <circle cx="200" cy="200" r="28" fill="#8FA68C" opacity="0.25" />
        </svg>
      </div>

      {/* Water ripple lines */}
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

      {/* ── CONTENT ───────────────────────────────────────────────────── */}
      <div
        ref={ref}
        className="relative z-10 max-w-2xl mx-auto px-6 md:px-12 text-center"
      >
        {/* Gold rule */}
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
          transition={{ duration: 0.8, delay: 0.12 }}
          className="font-sans text-[#8FA68C] text-[10px] tracking-[0.35em] uppercase font-medium mb-5"
        >
          Reserve Your Visit
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 28 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, ease: EASE, delay: 0.22 }}
          className="font-serif text-[#2C2A25] leading-[1.08] mb-5"
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
          Book your visit and experience a salon atmosphere designed around balance,
          beauty, and care. We look forward to welcoming you.
        </motion.p>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, delay: 0.48 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14"
        >
          {/* Primary — gold pill */}
          <a
            href="#"
            className="group relative inline-flex items-center justify-center gap-2.5 rounded-full font-sans text-[11px] tracking-[0.2em] uppercase font-medium text-white transition-all duration-400 hover:-translate-y-0.5 overflow-hidden"
            style={{
              padding: "15px 36px",
              background: "linear-gradient(135deg, #C9A96E 0%, #B8935A 55%, #C4A96A 100%)",
              boxShadow: "0 5px 24px rgba(196,169,106,0.48), inset 0 1px 0 rgba(255,255,255,0.18)",
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
            <span className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{ background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.18) 50%, transparent 60%)" }}
            />
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M16 2v4 M8 2v4 M3 10h18" />
            </svg>
            <span className="relative z-10">Book Online</span>
          </a>

          {/* Secondary — outlined pill */}
          <a
            href="tel:+12015551234"
            className="inline-flex items-center justify-center gap-2.5 rounded-full font-sans text-[11px] tracking-[0.2em] uppercase font-medium text-[#2C2A25] transition-all duration-400 hover:-translate-y-0.5 hover:border-[#C4A96A]/55"
            style={{
              padding: "15px 36px",
              border: "1px solid rgba(58,56,50,0.28)",
              background: "transparent",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.borderColor =
                "rgba(196,169,106,0.55)";
              (e.currentTarget as HTMLAnchorElement).style.color = "#C4A96A";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.borderColor =
                "rgba(58,56,50,0.28)";
              (e.currentTarget as HTMLAnchorElement).style.color = "#2C2A25";
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.4 21 3 13.6 3 4.5c0-.6.4-1 1-1H8c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z" />
            </svg>
            Call the Salon
          </a>
        </motion.div>

        {/* Address + trust signals */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.72 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="flex items-center gap-2 text-[#3A3832]/42">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
            </svg>
            <span className="font-sans text-xs tracking-wider">
              80 Park Ave, Hoboken, NJ 07030
            </span>
          </div>

          <div className="flex items-center gap-6 flex-wrap justify-center">
            {["Walk-ins Welcome", "Online Booking", "Gift Cards"].map((item) => (
              <div key={item} className="flex items-center gap-1.5 text-[#3A3832]/38">
                <div className="w-1 h-1 rounded-full bg-[#C4A96A]/60" />
                <span className="font-sans text-[10px] tracking-wider uppercase">
                  {item}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
