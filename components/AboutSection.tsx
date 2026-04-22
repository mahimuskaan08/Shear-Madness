"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { motion, useInView } from "framer-motion";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const SLIDE: [number, number, number, number] = [0.32, 0.72, 0, 1];

const STATS = [
  { number: "30+", label: "Years of Craft" },
  { number: "4K+", label: "Styles Perfected" },
  { number: "5★", label: "Client Trust" },
];

// Replace src values with real image paths when available
const GALLERY = [
  { id: 0, src: "/about/about-1.png", alt: "Salon interior",   bg: "rgba(180,177,173,0.22)" },
  { id: 1, src: "/about/about-2.png", alt: "Hair styling",     bg: "rgba(172,168,164,0.20)" },
  { id: 2, src: "/about/about-3.png", alt: "Color treatment",  bg: "rgba(165,161,157,0.22)" },
  { id: 3, src: "/about/about-4.png", alt: "Precision cut",    bg: "rgba(178,174,170,0.20)" },
  { id: 4, src: "/about/about-5.png", alt: "Blowout finish",   bg: "rgba(170,166,162,0.22)" },
  { id: 5, src: "/about/about-6.png", alt: "Elegant updo",     bg: "rgba(162,158,154,0.20)" },
];

const ABOUT_PETALS = [
  { id: 0, left:  3, size: 13, delay:   0, dur: 15, rot:  22, drift:  36, blur: 0 },
  { id: 1, left: 12, size: 10, delay:  -7, dur: 19, rot: 140, drift: -30, blur: 0 },
  { id: 2, left: 22, size: 12, delay: -12, dur: 17, rot:  68, drift:  50, blur: 0 },
  { id: 3, left: 35, size:  9, delay:  -4, dur: 23, rot: 210, drift: -40, blur: 0 },
  { id: 4, left: 50, size: 14, delay:  -9, dur: 20, rot:  85, drift:  28, blur: 0 },
  { id: 5, left: 63, size: 11, delay:  -2, dur: 16, rot:  52, drift: -32, blur: 0 },
  { id: 6, left: 74, size: 13, delay: -15, dur: 22, rot: 175, drift:  44, blur: 0 },
  { id: 7, left: 84, size: 10, delay:  -6, dur: 18, rot: 295, drift: -26, blur: 0 },
  { id: 8, left: 93, size: 12, delay: -18, dur: 24, rot: 335, drift:  42, blur: 0 },
  { id: 9, left: 44, size:  9, delay: -10, dur: 14, rot: 120, drift: -20, blur: 0 },
];

const ABOUT_PETAL_COLORS = [
  "rgba(222,120,145,1.0)",
  "rgba(235,145,165,1.0)",
  "rgba(210,110,135,1.0)",
  "rgba(245,160,178,1.0)",
];

const ABOUT_CSS = `
  /* ── PREMIUM SCROLLBAR ───────────────────────────────────────────────── */
  .dict-scroll { scrollbar-width: thin; scrollbar-color: rgba(198,167,107,0.45) transparent; }
  .dict-scroll::-webkit-scrollbar { width: 4px; }
  .dict-scroll::-webkit-scrollbar-track { background: transparent; border-radius: 4px; }
  .dict-scroll::-webkit-scrollbar-thumb { background: rgba(198,167,107,0.40); border-radius: 4px; transition: background 0.3s ease; }
  .dict-scroll::-webkit-scrollbar-thumb:hover { background: rgba(198,167,107,0.70); }

  /* ── ABOUT PETALS ────────────────────────────────────────────────────── */
  ${ABOUT_PETALS.map(({ id, rot, drift }) => `
  @keyframes about-petal-${id} {
    0%   { transform: translateY(-60px) translateX(0px) rotate(${rot}deg); opacity: 0; }
    8%   { opacity: 1; }
    88%  { opacity: 0.80; }
    100% { transform: translateY(calc(100svh + 60px)) translateX(${drift}px) rotate(${rot + 480}deg); opacity: 0; }
  }`).join("")}

`;

export default function AboutSection() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section
      ref={ref}
      id="our-story"
      style={{
        height: "100svh",
        minHeight: 700,
        display: "flex",
        flexDirection: "column",
        background: "#EDE5D8",
        position: "relative",
        overflow: "hidden",
        marginTop: "-2px",
        padding: "clamp(20px, 3vh, 36px) clamp(20px, 5vw, 72px) clamp(16px, 2.5vh, 28px)",
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: ABOUT_CSS }} />

      {/* ── LAYER 1: BAMBOO PARCHMENT BACKGROUND ───────────────────────────── */}
      <div aria-hidden="true" style={{ position: "absolute", inset: 0, zIndex: 0 }}>
        <Image
          src="/about-bg.png"
          alt=""
          fill
          sizes="100vw"
          style={{ objectFit: "cover", objectPosition: "center" }}
        />
      </div>

      {/* ── LAYER 2: SEAM COVER — fully opaque at top to match hero, fades out ─── */}
      <div aria-hidden="true" style={{
        position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none",
        background: "linear-gradient(to bottom, rgba(232,230,228,1.0) 0%, rgba(232,230,228,0.50) 8%, rgba(232,230,228,0) 18%, rgba(230,226,220,0.18) 45%, rgba(200,196,190,0.08) 100%)",
      }} />



      {/* ── FALLING PETALS ─────────────────────────────────────────────────── */}
      <div aria-hidden="true" style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 4 }}>
        {ABOUT_PETALS.map(p => (
          <div
            key={p.id}
            style={{
              position: "absolute",
              left: `${p.left}vw`,
              top: 0,
              animation: `about-petal-${p.id} ${p.dur}s ${p.delay}s linear infinite`,
              willChange: "transform, opacity",
            }}
          >
            <AboutPetal size={p.size} color={ABOUT_PETAL_COLORS[p.id % ABOUT_PETAL_COLORS.length]} />
          </div>
        ))}
      </div>


      {/* ── MAIN 2-COLUMN GRID ──────────────────────────────────────────────── */}
      <div
        id="about-main-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "54% 1fr",
          gap: "clamp(20px, 2.5vw, 36px)",
          flex: 1,
          minHeight: 0,
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* ════════════════════════════════════════════════════════════════════
            LEFT COLUMN
            ════════════════════════════════════════════════════════════════════ */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "clamp(10px, 1.6vh, 18px)",
            minHeight: 0,
            overflow: "hidden",
          }}
        >
          {/* ── HEADING ─────────────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1.0, ease: EASE, delay: 0.15 }}
            style={{ flexShrink: 0 }}
          >
            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "0.62rem",
                fontWeight: 500,
                letterSpacing: "0.28em",
                textTransform: "uppercase",
                color: "#7A5C10",
                marginBottom: 8,
              }}
            >
              Our Story
            </p>
            <h2
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: "clamp(2.0rem, 3.2vw, 2.75rem)",
                fontWeight: 600,
                lineHeight: 1.15,
                letterSpacing: "0.02em",
                color: "#556B2F",
              }}
            >
              About{" "}
              <span style={{ fontStyle: "italic", fontWeight: 700 }}>
                Shear Madness
              </span>
            </h2>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#C6A76B", flexShrink: 0 }} />
              <div style={{ height: 1, width: 72, background: "linear-gradient(to right, rgba(198,167,107,0.6), transparent)" }} />
            </div>
          </motion.div>

          {/* ── PARAGRAPH ───────────────────────────────────────────────────── */}
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1.0, ease: EASE, delay: 0.28 }}
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "clamp(1.0rem, 1.1vw, 1.06rem)",
              fontWeight: 400,
              lineHeight: 1.78,
              color: "#111111",
              textShadow: "0 1px 2px rgba(255,255,255,0.35)",
              letterSpacing: "0.014em",
              maxWidth: "100%",
              textAlign: "justify",
              flexShrink: 0,
            }}
          >
            We are Hoboken&apos;s top-rated beauty salon for professional haircuts, waxes, hair coloring,
            straightening, extensions and much more. Tucked away just three blocks behind Hoboken City
            Hall, Shear Madness was born in 2003 with one simple mission – recreate the professional
            salon experience by providing top notch beauty services for men and women; without the
            pretense of other fine salons, in a warm and inviting atmosphere, atypical from the rest.
            Staffed with top notch artists/stylists from many backgrounds, using the finest quality
            products available, in a comfortable Asian inspired setting, the Shear Madness team can help
            find and interpret the vision of even the most discerning client. Once you are here, you&apos;re
            not just a client but a member of the Shear Madness family. Trust me, relaxing in one of our
            chairs, it will feel like a second home! Whether you&apos;re looking for a dramatic change – a new
            hair color perhaps – or just maintaining your current style, from avant guarde to traditional,
            you owe it to yourself to call us today and FEEL THE MADNESS!
          </motion.p>

          {/* ── DICTIONARY BLOCK ────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1.0, ease: EASE, delay: 0.42 }}
            className="dict-scroll"
            style={{
              background: "#F3EADF",
              border: "1px solid rgba(180,148,100,0.28)",
              borderRadius: 8,
              padding: "clamp(14px, 1.8vh, 22px) clamp(16px, 2.0vw, 28px)",
              flex: 1,
              minHeight: 0,
              overflowY: "auto",
              boxShadow: "0 2px 12px rgba(120,88,44,0.07), inset 0 1px 2px rgba(140,110,70,0.06)",
            }}
          >
            <DictEntry
              word="SHEAR"
              phonetic="\ˈshir\"
              pos="noun"
              defs={[
                "A pair of scissors. Often used in the plural.",
                "Any of various implements or machines that cut with a scissor like action. verb tr.",
                "To remove (hair) by cutting or clipping verb intr.",
                "To use cutting tool such as shears.",
              ]}
            />
            <div style={{ height: 1, background: "rgba(180,155,110,0.22)", margin: "8px 0" }} />
            <DictEntry
              word="MADNESS"
              phonetic="\ˈmad-nəs\"
              pos="noun"
              defs={[
                "The state of being mad.",
                "Intense excitement, enthusiasm or passion.",
              ]}
            />
            <div style={{ height: 1, background: "rgba(180,155,110,0.22)", margin: "8px 0" }} />
            <DictEntry
              word="SHEAR MADNESS"
              phonetic="\ˈshir ˈmad-nəs\"
              pos="noun"
              defs={[
                "Where passion and excitement combine with shears and various implements to achieve beautiful hair.",
                "Where beauty and passion intersect.",
                "Where skilled artists achieve great beauty through creativity using great products.",
                "A place for really great head.",
                "A Salon for Men & Women.",
              ]}
            />
          </motion.div>
        </div>

        {/* ════════════════════════════════════════════════════════════════════
            RIGHT COLUMN — CAROUSEL + STATS
            ════════════════════════════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1.1, ease: EASE, delay: 0.22 }}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "clamp(12px, 1.8vh, 20px)",
            minHeight: 0,
            alignSelf: "stretch",
          }}
        >
          {/* Carousel fills right column */}
          <div id="about-carousel-wrap" style={{ position: "relative", flex: 1, minHeight: 0, width: "100%", alignSelf: "stretch" }}>
            <PremiumCarousel />
          </div>

          {/* ── STATS ROW ──────────────────────────────────────────────── */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 0,
              flexShrink: 0,
              borderTop: "1px solid rgba(198,167,107,0.20)",
              paddingTop: "clamp(10px, 1.4vh, 16px)",
            }}
          >
            {STATS.map((s, i) => (
              <div key={s.label} style={{ display: "flex", alignItems: "center", flex: 1, justifyContent: "center" }}>
                <div style={{ textAlign: "center" }}>
                  <p style={{
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    fontSize: "clamp(1.7rem, 2.6vw, 2.4rem)",
                    fontWeight: 700,
                    lineHeight: 1,
                    color: "#0A0A0A",
                    letterSpacing: "-0.02em",
                  }}>
                    {s.number}
                  </p>
                  <p style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "0.57rem",
                    fontWeight: 500,
                    letterSpacing: "0.20em",
                    textTransform: "uppercase",
                    color: "#0A0A0A",
                    marginTop: 5,
                  }}>
                    {s.label}
                  </p>
                </div>
                {i < STATS.length - 1 && (
                  <div style={{
                    width: 1,
                    height: 32,
                    background: "linear-gradient(to bottom, transparent, rgba(198,167,107,0.40), transparent)",
                    marginLeft: "clamp(16px, 3vw, 36px)",
                    marginRight: "clamp(16px, 3vw, 36px)",
                    flexShrink: 0,
                  }} />
                )}
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── BOTTOM FADE into Services ───────────────────────────────────────── */}
      <div aria-hidden="true" style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: "14%",
        background: "linear-gradient(to bottom, transparent, #ECEAE7)",
        pointerEvents: "none", zIndex: 5,
      }} />

      {/* ── RESPONSIVE ──────────────────────────────────────────────────────── */}
      <style>{`
        @media (max-width: 860px) {
          #our-story {
            height: auto !important;
            min-height: 100svh;
          }
          #about-main-grid {
            grid-template-columns: 1fr !important;
            overflow-y: auto;
            height: auto !important;
          }
          #about-carousel-wrap {
            min-height: 300px;
            height: 300px;
            flex: none !important;
          }
        }

        /* ── Premium thin scrollbar — dictionary block only ── */
        .dict-scroll::-webkit-scrollbar {
          width: 3px;
        }
        .dict-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .dict-scroll::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #C9A96E, #B8935A);
          border-radius: 999px;
        }
        .dict-scroll::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #D4B87E, #C9A96E);
        }
        /* Firefox */
        .dict-scroll {
          scrollbar-width: thin;
          scrollbar-color: #C9A96E transparent;
        }
      `}</style>
    </section>
  );
}

// ── ABOUT PETAL SVG ──────────────────────────────────────────────────────────
function AboutPetal({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={Math.round(size * 1.3)} viewBox="0 0 20 26" fill="none" style={{ display: "block" }}>
      <path
        d="M10,1 C13.2,0.5 17.2,0 17.2,0 C15.6,4.2 17.8,9.4 16.8,14.2 C15.8,19 13.2,23.8 10,25.8 C6.8,23.8 4.2,19 3.2,14.2 C2.2,9.4 4.4,4.2 2.8,0 C2.8,0 6.8,0.5 10,1 Z"
        fill={color}
      />
      <ellipse cx="10" cy="12" rx="3.5" ry="6.5" fill="rgba(255,230,235,0.20)" />
      <path d="M10,3 Q10,14 10,25" stroke="rgba(180,100,120,0.22)" strokeWidth="0.6" fill="none" />
    </svg>
  );
}

// ── BAMBOO LEAF SVG ──────────────────────────────────────────────────────────
// Slim elongated leaf matching the hand-painted bamboo in the background.
function BambooLeaf({ rotation, opacity, size }: { rotation: number; opacity: number; size: number }) {
  const h = Math.round(size * 3.2);
  return (
    <svg width={size} height={h} viewBox="0 0 18 58" fill="none" style={{ display: "block", opacity }}>
      {/* Leaf body — tapered ellipse */}
      <path
        d="M9,1 C13,1 17,8 17,20 C17,34 13,52 9,57 C5,52 1,34 1,20 C1,8 5,1 9,1 Z"
        fill={`rgba(${60 + rotation},${72 + rotation},${38},0.78)`}
        style={{ transform: `rotate(${rotation}deg)`, transformOrigin: "50% 50%" }}
      />
      {/* Center vein */}
      <path
        d="M9,3 Q9,28 9,56"
        stroke="rgba(40,52,22,0.30)"
        strokeWidth="0.7"
        fill="none"
      />
    </svg>
  );
}

// ── DICTIONARY ENTRY ─────────────────────────────────────────────────────────
function DictEntry({
  word, phonetic, pos, defs,
}: {
  word: string; phonetic: string; pos: string; defs: string[];
}) {
  return (
    <div style={{ marginBottom: 2 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
        <span style={{
          fontFamily: "'Inter', system-ui, sans-serif",
          fontSize: "clamp(0.74rem, 0.90vw, 0.86rem)",
          fontWeight: 700,
          letterSpacing: "0.20em",
          textTransform: "uppercase",
          color: "#0A0A0A",
        }}>
          {word}
        </span>
        <span style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: "clamp(0.70rem, 0.84vw, 0.82rem)",
          fontStyle: "italic",
          color: "#0A0A0A",
          letterSpacing: "0.02em",
        }}>
          {phonetic}
        </span>
        <span style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: "0.56rem",
          fontWeight: 500,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "#EDE5D8",
          background: "#2A1E12",
          padding: "1px 6px",
          borderRadius: 2,
        }}>
          {pos}
        </span>
      </div>
      <ol style={{ margin: "3px 0 0 0", paddingLeft: 18, listStyleType: "decimal" }}>
        {defs.map((d, i) => (
          <li key={i} style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: "clamp(0.92rem, 1.08vw, 1.05rem)",
            fontWeight: 400,
            lineHeight: 1.68,
            color: "#0A0A0A",
            letterSpacing: "0.01em",
          }}>
            {d}
          </li>
        ))}
      </ol>
    </div>
  );
}

// ── PREMIUM CAROUSEL ──────────────────────────────────────────────────────────
// Center card: full opacity, sharp, scale 1, deepest shadow.
// Side cards: scale 0.87, 52% opacity, 1.5px blur, partially clipped.
// Drag/swipe + arrow + dot navigation. Auto-advances every 5s.
function PremiumCarousel() {
  const [active, setActive] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const [cw, setCw] = useState(0);           // measured container width in px
  const dragStart = useRef<number | null>(null);
  const autoTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const N = GALLERY.length;

  // Measure container width responsively
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setCw(el.offsetWidth));
    ro.observe(el);
    setCw(el.offsetWidth);
    return () => ro.disconnect();
  }, []);

  const goTo = useCallback((i: number) => {
    setActive(((i % N) + N) % N);
  }, [N]);

  const next = useCallback(() => goTo(active + 1), [active, goTo]);
  const prev = useCallback(() => goTo(active - 1), [active, goTo]);

  // Auto-advance — resets whenever active changes
  useEffect(() => {
    autoTimer.current = setTimeout(next, 5000);
    return () => clearTimeout(autoTimer.current);
  }, [active, next]);

  // Pointer drag (works for both mouse and touch via pointer events)
  const onPointerDown = (e: React.PointerEvent) => { dragStart.current = e.clientX; };
  const onPointerUp   = (e: React.PointerEvent) => {
    if (dragStart.current === null) return;
    const dx = e.clientX - dragStart.current;
    if (dx < -36) next();
    else if (dx > 36) prev();
    dragStart.current = null;
  };

  // Layout math
  const CARD_RATIO  = 0.62;   // card is 62% of container width
  const SIDE_RATIO  = 0.525;  // distance from center to side card center (as % of cw)
  const cardW   = cw * CARD_RATIO;
  const centerX = (cw - cardW) / 2;        // x that centers the card in container
  const sideOff = cw * SIDE_RATIO;         // ±offset for prev/next cards

  // Determine slot for each gallery index
  function getSlot(i: number): "center" | "left" | "right" | "hidden" {
    const p = (active - 1 + N) % N;
    const n = (active + 1) % N;
    if (i === active) return "center";
    if (i === p)      return "left";
    if (i === n)      return "right";
    return "hidden";
  }

  // X target per slot
  function slotX(slot: "center" | "left" | "right" | "hidden", i: number): number {
    if (slot === "center") return centerX;
    if (slot === "left")   return centerX - sideOff;
    if (slot === "right")  return centerX + sideOff;
    // Hidden: push off-screen on the correct side to avoid cross-fading through center
    const fw = (i - active + N) % N;
    const bw = (active - i + N) % N;
    return fw < bw ? centerX + sideOff * 2.1 : centerX - sideOff * 2.1;
  }

  return (
    <div style={{
      position: "absolute",
      inset: 0,
      display: "flex",
      flexDirection: "column",
      gap: 10,
    }}>
      {/* ── TRACK ─────────────────────────────────────────────────────────── */}
      <div
        ref={trackRef}
        style={{ position: "relative", flex: 1, overflow: "hidden", cursor: "grab", touchAction: "pan-y" }}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerLeave={() => { dragStart.current = null; }}
      >
        {/* Edge fade masks — use transparent so no solid colour box appears over the bg */}
        <div aria-hidden style={{
          position: "absolute", left: 0, top: 0, bottom: 0, width: "18%",
          background: "linear-gradient(to right, rgba(237,229,216,0.82) 0%, rgba(237,229,216,0) 100%)",
          zIndex: 9, pointerEvents: "none",
        }} />
        <div aria-hidden style={{
          position: "absolute", right: 0, top: 0, bottom: 0, width: "18%",
          background: "linear-gradient(to left, rgba(237,229,216,0.82) 0%, rgba(237,229,216,0) 100%)",
          zIndex: 9, pointerEvents: "none",
        }} />

        {/* Cards — only render once container width is known */}
        {cw > 0 && GALLERY.map((img, i) => {
          const slot = getSlot(i);
          const isCenter  = slot === "center";
          const isSide    = slot === "left" || slot === "right";
          const targetX   = slotX(slot, i);
          const targetSc  = isCenter ? 1 : 0.87;
          const targetOp  = isCenter ? 1 : isSide ? 0.52 : 0;
          const targetBlr = isCenter ? "blur(0px)" : isSide ? "blur(1.5px)" : "blur(2px)";

          return (
            <motion.div
              key={img.id}
              initial={false}   // parent motion.div handles the section fade-in
              animate={{
                x:      targetX,
                scale:  targetSc,
                opacity: targetOp,
                filter: targetBlr,
              }}
              transition={{ duration: 0.70, ease: SLIDE }}
              whileHover={isCenter ? {
                y: -7,
                scale: 1.03,
                transition: { duration: 0.38, ease: EASE },
              } : undefined}
              onClick={isSide ? () => goTo(i) : undefined}
              style={{
                position: "absolute",
                top: "4%",
                bottom: "4%",
                left: 0,
                width: cardW,
                zIndex: isCenter ? 4 : isSide ? 2 : 0,
                cursor: isSide ? "pointer" : "default",
                background: "transparent",
                padding: "clamp(4px, 0.55vw, 7px)",
                borderRadius: 3,
                boxShadow: "none",
                transition: "box-shadow 0.55s ease",
                willChange: "transform, opacity",
              }}
            >
              {/* ── IMAGE AREA ──────────────────────────────────────────── */}
              <div style={{
                width: "100%",
                height: "100%",
                position: "relative",
                overflow: "hidden",
                borderRadius: 1,
                boxShadow: "inset 0 0 22px rgba(96,68,36,0.18)",
              }}>
                {img.src ? (
                  <Image
                    src={img.src}
                    alt={img.alt}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    style={{ objectFit: "cover" }}
                  />
                ) : (
                  /* Placeholder — replace with real src in GALLERY array */
                  <div style={{
                    width: "100%",
                    height: "100%",
                    background: img.bg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}>
                    <span style={{
                      fontFamily: "'Cormorant Garamond', Georgia, serif",
                      fontSize: "clamp(0.52rem, 0.8vw, 0.68rem)",
                      color: "rgba(255,252,248,0.48)",
                      letterSpacing: "0.18em",
                      textTransform: "uppercase",
                      userSelect: "none",
                    }}>
                      {img.alt}
                    </span>
                  </div>
                )}

              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ── NAVIGATION ────────────────────────────────────────────────────── */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 14,
        flexShrink: 0,
        paddingBottom: 2,
      }}>
        <CarouselArrow dir="left" onClick={prev} />

        {/* Dot indicators — active expands to a pill */}
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          {GALLERY.map((_, i) => (
            <motion.button
              key={i}
              onClick={() => goTo(i)}
              animate={{ width: i === active ? 20 : 5, opacity: i === active ? 1 : 0.36 }}
              transition={{ duration: 0.4, ease: EASE }}
              style={{
                height: 4,
                borderRadius: 2,
                background: "#C6A76B",
                border: "none",
                cursor: "pointer",
                padding: 0,
              }}
            />
          ))}
        </div>

        <CarouselArrow dir="right" onClick={next} />
      </div>
    </div>
  );
}

// ── CAROUSEL ARROW BUTTON ─────────────────────────────────────────────────────
function CarouselArrow({ dir, onClick }: { dir: "left" | "right"; onClick: () => void }) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.14, transition: { duration: 0.22 } }}
      whileTap={{ scale: 0.90 }}
      style={{
        width: 28,
        height: 28,
        borderRadius: "50%",
        border: "1px solid rgba(198,167,107,0.42)",
        background: "rgba(246,236,217,0.75)",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        boxShadow: "0 2px 8px rgba(80,50,20,0.08)",
      }}
    >
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
        {dir === "left"
          ? <path d="M7 1L3 5L7 9" stroke="#8A6840" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" />
          : <path d="M3 1L7 5L3 9" stroke="#8A6840" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" />
        }
      </svg>
    </motion.button>
  );
}
