"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

// ── PETAL DATA ────────────────────────────────────────────────────────────────
// left = starting x position (vw). drift = horizontal wander by end (px).
// Negative delays = petals already mid-fall on load, no blank wait.
const PETALS = [
  { id:  0, left:  5, size: 15, delay:    0, dur: 14, rot:  20, drift:  38, blur: 0   },
  { id:  1, left: 15, size: 12, delay:   -6, dur: 18, rot: 130, drift: -28, blur: 0   },
  { id:  2, left: 25, size: 14, delay:  -11, dur: 16, rot:  65, drift:  52, blur: 0   },
  { id:  3, left: 38, size: 11, delay:   -4, dur: 22, rot: 210, drift: -42, blur: 0   },
  { id:  4, left:  8, size: 17, delay:   -9, dur: 19, rot:  88, drift: -30, blur: 0   },
  { id:  5, left: 62, size: 13, delay:   -2, dur: 15, rot:  50, drift:  30, blur: 0   },
  { id:  6, left: 72, size: 15, delay:  -14, dur: 21, rot: 170, drift: -46, blur: 0   },
  { id:  7, left: 85, size: 12, delay:   -7, dur: 17, rot: 290, drift:  24, blur: 0   },
  { id:  8, left: 92, size: 14, delay:  -16, dur: 23, rot: 330, drift:  44, blur: 0   },
  { id:  9, left: 78, size: 11, delay:   -3, dur: 13, rot:  42, drift: -22, blur: 0   },
  { id: 10, left: 48, size: 13, delay:  -18, dur: 20, rot: 155, drift:  36, blur: 0   },
  { id: 11, left: 55, size: 10, delay:   -8, dur: 25, rot: 245, drift: -34, blur: 0   },
  { id: 12, left: 32, size: 16, delay:  -12, dur: 18, rot:  72, drift:  60, blur: 0   },
  { id: 13, left: 19, size: 11, delay:  -20, dur: 16, rot: 310, drift: -20, blur: 0   },
  { id: 14, left: 68, size: 13, delay:   -5, dur: 19, rot: 115, drift:  28, blur: 0   },
  { id: 15, left: 42, size: 14, delay:   -3, dur: 17, rot:  33, drift:  44, blur: 0   },
  { id: 16, left: 11, size: 12, delay:  -15, dur: 20, rot: 200, drift: -38, blur: 0   },
  { id: 17, left: 58, size: 15, delay:  -10, dur: 15, rot:  85, drift:  26, blur: 0   },
  { id: 18, left: 88, size: 11, delay:   -1, dur: 22, rot: 140, drift: -50, blur: 0   },
  { id: 19, left: 30, size: 13, delay:  -17, dur: 24, rot: 260, drift:  32, blur: 0   },
  { id: 20, left: 50, size: 16, delay:   -6, dur: 18, rot:  48, drift: -24, blur: 0   },
  { id: 21, left: 70, size: 12, delay:  -22, dur: 16, rot: 190, drift:  46, blur: 0   },
  { id: 22, left: 20, size: 14, delay:   -9, dur: 21, rot: 320, drift: -30, blur: 0   },
  { id: 23, left: 95, size: 10, delay:  -13, dur: 19, rot:  75, drift:  20, blur: 0   },
  { id: 24, left: 44, size: 15, delay:  -24, dur: 23, rot: 230, drift: -42, blur: 0   },
  { id: 25, left: 82, size: 13, delay:   -4, dur: 17, rot: 100, drift:  54, blur: 0   },
];

// Petal colours sampled from the hero image sakura blossoms
const PETAL_COLORS = [
  "rgba(222,120,145,1.0)",
  "rgba(235,145,165,1.0)",
  "rgba(210,110,135,1.0)",
  "rgba(245,160,178,1.0)",
];

function getPetalColor(id: number) {
  return PETAL_COLORS[id % PETAL_COLORS.length];
}

// ── CSS KEYFRAMES ─────────────────────────────────────────────────────────────
const PETAL_KF = PETALS.map(({ id, rot, drift }) => `
@keyframes petal-fall-${id} {
  0%   { transform: translateY(-80px) translateX(0px)       rotate(${rot}deg);       opacity: 0; }
  8%   { opacity: 1; }
  88%  { opacity: 0.82; }
  100% { transform: translateY(calc(100vh + 80px)) translateX(${drift}px) rotate(${rot + 480}deg); opacity: 0; }
}`).join("");

const HERO_FADE = `
@keyframes hero-fade-in {
  from { opacity: 0; }
  to   { opacity: 1; }
}

.sm-letter {
  font-family: 'Times New Roman', Times, serif;
  font-weight: 900;
  text-transform: uppercase;
  color: #111111;
  /* white halo behind ensures black text pops on any bg; subtle dark shadow adds depth */
  text-shadow:
    0 0 18px rgba(255,255,255,0.92),
    0 0 40px rgba(255,255,255,0.60),
    2px 2px 0 rgba(0,0,0,.22),
    4px 4px 10px rgba(0,0,0,.12);
  line-height: 1;
  display: inline;
  vertical-align: baseline;
  letter-spacing: -0.01em;
}
/* fluid scale: xs=22px → lg=105px; never overflows on any viewport */
.sm-letter-normal { font-size: clamp(22px, 6.5vw, 105px); }
.sm-letter-large  { font-size: clamp(28px, 8.5vw, 135px); margin-right: -3px; }
/* word gap between SHEAR and MADNESS — scales with viewport */
.sm-word-gap { display: inline-block; width: clamp(6px, 1.8vw, 28px); }
@media (max-width: 480px) {
  .sm-letter-large { margin-right: -2px; }
}
`;

// ── PETAL SVG ─────────────────────────────────────────────────────────────────
function PetalSVG({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={Math.round(size * 1.3)} viewBox="0 0 20 26" fill="none" style={{ display: "block" }}>
      <path
        d="M10,1 C13.2,0.5 17.2,0 17.2,0
           C15.6,4.2 17.8,9.4 16.8,14.2
           C15.8,19 13.2,23.8 10,25.8
           C6.8,23.8 4.2,19 3.2,14.2
           C2.2,9.4 4.4,4.2 2.8,0
           C2.8,0 6.8,0.5 10,1 Z"
        fill={color}
      />
      {/* Soft inner highlight for depth */}
      <ellipse cx="10" cy="12" rx="3.5" ry="6.5" fill="rgba(255,230,235,0.20)" />
      {/* Center vein */}
      <path d="M10,3 Q10,14 10,25" stroke="rgba(180,100,120,0.22)" strokeWidth="0.6" fill="none" />
    </svg>
  );
}

export default function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const contentY       = useTransform(scrollYProgress, [0, 1],    ["0%", "-14%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.55], [1, 0]);
  const bgScale        = useTransform(scrollYProgress, [0, 1],    [1, 1.04]);

  return (
    <section
      ref={sectionRef}
      className="relative flex items-center justify-center overflow-hidden"
      style={{ height: "100svh", minHeight: 680, animation: "hero-fade-in 1.8s ease-out both" }}
    >
      <style dangerouslySetInnerHTML={{ __html: PETAL_KF + HERO_FADE }} />

      {/* ── LAYER 1: BACKGROUND IMAGE ────────────────────────────────────── */}
      <motion.div style={{ scale: bgScale }} className="absolute inset-0 w-full h-full">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/hero-bg.png"
          alt=""
          aria-hidden="true"
          fetchPriority="high"
          decoding="async"
          className="hero-bg-img"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center 22%",
            display: "block",
          }}
        />
      </motion.div>

      {/* ── LAYER 2: WARM SEPIA WASH ─────────────────────────────────────── */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(168deg, rgba(237,231,225,0.26) 0%, rgba(194,182,168,0.18) 55%, rgba(178,162,144,0.14) 100%)",
          mixBlendMode: "multiply",
        }}
      />

      {/* ── LAYER 3: MOUNTAIN MIST BLOOM ─────────────────────────────────── */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 82% 40% at 50% 26%, rgba(194,182,168,0.24) 0%, transparent 68%)",
        }}
      />

      {/* ── LAYER 4: EDGE VIGNETTE ───────────────────────────────────────── */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 78% 72% at 50% 44%, transparent 0%, rgba(180,164,146,0.14) 100%)",
        }}
      />

      {/* ── LAYER 5: BOTTOM FADE — fully opaque at the seam, blends upward ──── */}
      <div
        aria-hidden="true"
        className="absolute bottom-0 left-0 right-0 pointer-events-none"
        style={{
          height: "16%",
          background:
            "linear-gradient(to top, rgba(232,230,228,1.0) 0%, rgba(232,230,228,0.55) 40%, rgba(232,230,228,0) 100%)",
        }}
      />

      {/* ── LAYER 6: PETALS ──────────────────────────────────────────────── */}
      <div
        aria-hidden="true"
        className="absolute inset-0 overflow-hidden pointer-events-none"
        style={{ zIndex: 3 }}
      >
        {PETALS.map(p => (
          <div
            key={p.id}
            style={{
              position: "absolute",
              left: `${p.left}vw`,
              top: 0,
              filter: p.blur ? `blur(${p.blur}px)` : undefined,
              animation: `petal-fall-${p.id} ${p.dur}s ${p.delay}s linear infinite`,
              willChange: "transform, opacity",
            }}
          >
            <PetalSVG size={p.size} color={getPetalColor(p.id)} />
          </div>
        ))}
      </div>

      {/* ── LAYER 7: CONTENT ─────────────────────────────────────────────── */}
      <motion.div
        style={{ y: contentY, opacity: contentOpacity, zIndex: 10, position: "relative" }}
        className="flex flex-col items-center text-center px-6"
      >
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, ease: EASE, delay: 0.4 }}
          style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: "8%", gap: 0 }}
        >
          {/* ── MAIN TITLE ───────────────────────────────────────────────── */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0 }}>
            {/*
              Inline spans keep every letter on the same baseline automatically.
              S and M use .sm-letter-large; the rest use .sm-letter-normal.
              A zero-width word gap span sits between SHEAR and MADNESS.
            */}
            <h1
              style={{
                margin: 0,
                padding: 0,
                display: "block",
                textAlign: "center",
                lineHeight: 1,
                whiteSpace: "nowrap",
              }}
            >
              <span className="sm-letter sm-letter-large">S</span>
              <span className="sm-letter sm-letter-normal">HEAR</span>
              {/* word gap — scales with viewport via CSS class */}
              <span className="sm-word-gap" />
              <span className="sm-letter sm-letter-large">M</span>
              <span className="sm-letter sm-letter-normal">ADNESS</span>
            </h1>

            {/* Ornamental rule */}
            <div
              style={{
                marginTop: "0.38em",
                width: "88%",
                height: "1px",
                background:
                  "linear-gradient(to right, transparent, rgba(0,0,0,0.55) 12%, rgba(0,0,0,0.55) 88%, transparent)",
              }}
            />
          </div>

          {/* Spacing */}
          <div style={{ height: 14 }} />

          {/* Subtitle */}
          <p style={{
            fontFamily: "'Times New Roman', Times, serif",
            fontSize: "clamp(0.95rem, 2.4vw, 1.38rem)",
            fontWeight: 700,
            fontStyle: "italic",
            letterSpacing: "0.06em",
            color: "#111111",
            textShadow: "0 0 14px rgba(255,255,255,0.85), 1px 1px 3px rgba(0,0,0,0.20)",
            marginBottom: 5,
          }}>
            A Salon For Men &amp; Women
          </p>

          <p style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: "clamp(0.78rem, 1.8vw, 1.0rem)",
            fontWeight: 500,
            letterSpacing: "0.14em",
            textTransform: "uppercase" as const,
            color: "rgba(17,17,17,0.78)",
            textShadow: "0 0 12px rgba(255,255,255,0.80)",
            marginBottom: 32,
          }}>
            Where Style Meets Balance
          </p>

          {/* Buttons */}
          <div
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <a
              href="/booking"
              className="inline-flex items-center justify-center rounded-full font-sans text-[11px] tracking-[0.22em] uppercase font-medium text-white"
              style={{
                padding: "15px 40px",
                background: "linear-gradient(135deg, #CAA96E 0%, #B8935A 55%, #C6A76B 100%)",
                boxShadow: "0 4px 20px rgba(198,167,107,0.38)",
                transition: "all 0.45s ease",
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLAnchorElement;
                el.style.background = "linear-gradient(135deg, #BD9D62 0%, #A8834A 55%, #B6976B 100%)";
                el.style.boxShadow  = "0 7px 28px rgba(198,167,107,0.52)";
                el.style.transform  = "translateY(-2px)";
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLAnchorElement;
                el.style.background = "linear-gradient(135deg, #CAA96E 0%, #B8935A 55%, #C6A76B 100%)";
                el.style.boxShadow  = "0 4px 20px rgba(198,167,107,0.38)";
                el.style.transform  = "translateY(0)";
              }}
            >
              Book Now
            </a>

            <a
              href="#contact"
              className="inline-flex items-center justify-center rounded-full font-sans text-[11px] tracking-[0.22em] uppercase font-semibold"
              style={{
                padding: "14px 39px",
                background: "transparent",
                border: "1.5px solid #2C2A28",
                color: "#2C2A28",
                transition: "all 0.45s ease",
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLAnchorElement;
                el.style.background = "rgba(44,42,40,0.06)";
                el.style.transform  = "translateY(-2px)";
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLAnchorElement;
                el.style.background = "transparent";
                el.style.transform  = "translateY(0)";
              }}
            >
              Contact Us
            </a>
          </div>
        </motion.div>
      </motion.div>

      {/* ── SCROLL INDICATOR ─────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.6, duration: 1.4 }}
        className="absolute bottom-7 left-1/2 -translate-x-1/2"
        style={{ zIndex: 10 }}
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2.3, repeat: Infinity, ease: "easeInOut" }}
          className="w-px h-10"
          style={{ background: "linear-gradient(to bottom, rgba(198,167,107,0.70), transparent)" }}
        />
      </motion.div>
    </section>
  );
}
