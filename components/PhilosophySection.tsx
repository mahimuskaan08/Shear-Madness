"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

// Lotus petal SVG — reused as decorative element
function LotusPetal({ className, style }: { className?: string; style?: React.CSSProperties }) {
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

const pillars = [
  {
    number: "01",
    title: "Craft Over Speed",
    body: "Every cut, color, and treatment is performed with deliberate care. We take the time to do it right — because your hair deserves nothing less.",
  },
  {
    number: "02",
    title: "Style Rooted in Calm",
    body: "The moment you walk in, the outside world quiets. Our space is designed to slow you down, so you leave feeling as restored as you look.",
  },
  {
    number: "03",
    title: "Your Visit as Ritual",
    body: "An appointment here is more than a service — it's time set aside for you. We honor that by making every detail intentional.",
  },
  {
    number: "04",
    title: "Beauty in Balance",
    body: "We believe true style comes from harmony — between what you want, what suits you, and the health of your hair. That balance is our art.",
  },
];

export default function PhilosophySection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  const fadeUp = (delay: number) => ({
    initial: { opacity: 0, y: 28 },
    animate: isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 28 },
    transition: { duration: 0.9, ease: EASE, delay },
  });

  return (
    <section
      id="philosophy"
      className="relative py-28 md:py-44 bg-[#FAF6EF] overflow-hidden"
    >
      {/* ── DECORATIVE LOTUS BG ───────────────────────────────────────────── */}
      {/* Top-right cluster */}
      <div className="absolute -top-10 -right-10 w-72 h-72 pointer-events-none opacity-[0.07]"
        style={{ color: "#C4A96A" }}
      >
        {[0, 40, 80, 120, 160, 200, 240, 280, 320].map((angle) => (
          <LotusPetal
            key={angle}
            className="absolute w-16 h-24 top-1/2 left-1/2 -translate-x-1/2 origin-bottom"
            style={{ transform: `rotate(${angle}deg) translateY(-50%)` } as React.CSSProperties}
          />
        ))}
      </div>

      {/* Bottom-left single petal */}
      <div className="absolute -bottom-6 -left-6 w-48 h-48 pointer-events-none opacity-[0.05]"
        style={{ color: "#8FA68C" }}
      >
        {[0, 60, 120, 180, 240, 300].map((angle) => (
          <LotusPetal
            key={angle}
            className="absolute w-12 h-20 top-1/2 left-1/2 origin-bottom"
            style={{ transform: `rotate(${angle}deg) translateY(-50%)` } as React.CSSProperties}
          />
        ))}
      </div>

      <div ref={ref} className="max-w-7xl mx-auto px-6 md:px-12">

        {/* Header */}
        <div className="text-center mb-20 md:mb-28">
          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            animate={isInView ? { scaleX: 1, opacity: 1 } : {}}
            transition={{ duration: 1.1, ease: EASE }}
            className="w-14 h-px mx-auto mb-8 origin-center"
            style={{ background: "linear-gradient(90deg, transparent, #C4A96A, transparent)" }}
          />
          <motion.p
            {...fadeUp(0.1)}
            className="font-sans text-[#8FA68C] text-[10px] tracking-[0.38em] uppercase font-medium mb-5"
          >
            Our Approach
          </motion.p>
          <motion.h2
            {...fadeUp(0.22)}
            className="font-serif text-[#2C2A25] leading-[1.06]"
            style={{ fontSize: "clamp(2.2rem, 5vw, 4.2rem)", fontWeight: 300 }}
          >
            A Philosophy of
            <br />
            <em>Intentional Beauty</em>
          </motion.h2>
          <motion.p
            {...fadeUp(0.36)}
            className="font-serif text-[#3A3832]/55 italic mt-5 max-w-lg mx-auto"
            style={{ fontSize: "clamp(0.98rem, 2vw, 1.2rem)", lineHeight: 1.75 }}
          >
            We built Shear Madness around four guiding principles — the beliefs
            that shape every appointment, every interaction, every result.
          </motion.p>
        </div>

        {/* Pillars grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10">
          {pillars.map((pillar, i) => (
            <motion.div
              key={pillar.number}
              initial={{ opacity: 0, y: 32 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.85, ease: EASE, delay: 0.18 + i * 0.12 }}
              className="group relative flex flex-col gap-5 p-8 rounded-sm transition-all duration-400 hover:-translate-y-1"
              style={{
                background: "rgba(253,250,246,0.9)",
                border: "1px solid rgba(196,169,106,0.14)",
                boxShadow: "0 2px 18px rgba(58,56,50,0.05)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.boxShadow =
                  "0 10px 40px rgba(196,169,106,0.14)";
                (e.currentTarget as HTMLDivElement).style.borderColor =
                  "rgba(196,169,106,0.32)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.boxShadow =
                  "0 2px 18px rgba(58,56,50,0.05)";
                (e.currentTarget as HTMLDivElement).style.borderColor =
                  "rgba(196,169,106,0.14)";
              }}
            >
              {/* Number */}
              <span
                className="font-sans text-[#C4A96A] font-medium"
                style={{ fontSize: "0.72rem", letterSpacing: "0.22em" }}
              >
                {pillar.number}
              </span>

              {/* Gold rule */}
              <div
                className="w-8 h-px"
                style={{ background: "linear-gradient(to right, #C4A96A, transparent)" }}
              />

              {/* Title */}
              <h3
                className="font-serif text-[#2C2A25]"
                style={{ fontSize: "1.18rem", fontWeight: 400, lineHeight: 1.3 }}
              >
                {pillar.title}
              </h3>

              {/* Body */}
              <p
                className="font-sans text-[#3A3832]/60 leading-[1.85]"
                style={{ fontSize: "0.875rem" }}
              >
                {pillar.body}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Bottom quote */}
        <motion.div
          {...fadeUp(0.7)}
          className="mt-20 text-center"
        >
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="h-px w-12" style={{ background: "linear-gradient(to right, transparent, rgba(196,169,106,0.6))" }} />
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#C4A96A", opacity: 0.7 }} />
            <div className="h-px w-12" style={{ background: "linear-gradient(to left, transparent, rgba(196,169,106,0.6))" }} />
          </div>
          <p
            className="font-serif text-[#3A3832]/50 italic"
            style={{ fontSize: "clamp(1rem, 2.2vw, 1.35rem)" }}
          >
            &ldquo;Style is not what you wear — it is how you carry yourself leaving our chair.&rdquo;
          </p>
        </motion.div>
      </div>
    </section>
  );
}
