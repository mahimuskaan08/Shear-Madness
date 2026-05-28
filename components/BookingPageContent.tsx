"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/* ─── Data ─────────────────────────────────────────────────────────────── */
const STYLISTS = ["No Preference", "George Fraggos", "Oscar Victor"];

// Grouped to match the Services page exactly
const SERVICE_GROUPS = [
  {
    group: "Women's Services",
    items: [
      "Haircut",
      "Girl Child Cut",
      "Blowout",
      "Eyebrow Wax",
      "Updo",
      "Single Process Colour",
      "Highlights Panel",
      "Highlights: Partial / Full",
      "Color Correction",
      "Color Glazing",
      "Permanent Wave",
      "Extensions",
    ],
  },
  {
    group: "Men's Services",
    items: [
      "Hair Cut",
      "Boy Child Cut",
      "Eyebrow Wax",
      "Single Process",
      "Relaxer",
      "Highlights",
    ],
  },
  {
    group: "Hair Treatments",
    items: [
      "Intensive Conditioning Treatment",
      "Tandem Texture Treatment",
      "Brazilian Keratin Treatment",
      "Japanese Relaxer",
    ],
  },
];

// Flat list kept for tag display (strip price suffix for brevity)
const SERVICES = SERVICE_GROUPS.flatMap((g) => g.items);

const TIME_SLOTS: string[] = [];
for (let h = 10; h <= 20; h++) {
  ["00", "30"].forEach((m) => {
    const hour = h > 12 ? h - 12 : h;
    const ampm = h < 12 ? "AM" : "PM";
    TIME_SLOTS.push(`${hour}:${m} ${ampm}`);
  });
}

/* ─── Sub-components ────────────────────────────────────────────────────── */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      fontFamily: "'Inter', sans-serif",
      fontSize: "0.62rem", fontWeight: 700,
      letterSpacing: "0.28em", textTransform: "uppercase",
      color: "#7A5C10", marginBottom: 6,
    }}>
      {children}
    </p>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{
      fontFamily: "'Cormorant Garamond', Georgia, serif",
      fontSize: "clamp(1.3rem, 2.2vw, 1.75rem)",
      fontWeight: 600, lineHeight: 1.1,
      color: "#556B2F", marginBottom: "clamp(18px, 3vw, 28px)",
      borderBottom: "1px solid rgba(196,169,106,0.22)",
      paddingBottom: 10,
    }}>
      {children}
    </h2>
  );
}

function FieldLabel({ htmlFor, required, children }: { htmlFor: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label
      htmlFor={htmlFor}
      style={{
        display: "block",
        fontFamily: "'Inter', sans-serif",
        fontSize: "0.72rem", fontWeight: 600,
        letterSpacing: "0.12em", textTransform: "uppercase",
        color: "#3A3832", marginBottom: 7,
      }}
    >
      {children}
      {required && <span style={{ color: "#7A5C10", marginLeft: 3 }}>*</span>}
    </label>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  fontFamily: "'Inter', sans-serif",
  fontSize: "0.88rem",
  color: "#2C2A25",
  background: "rgba(253,250,246,0.80)",
  border: "1px solid rgba(196,169,106,0.30)",
  borderRadius: 8,
  padding: "11px 14px",
  outline: "none",
  transition: "border-color 0.25s, box-shadow 0.25s",
  boxSizing: "border-box" as const,
};

function Input({ id, type = "text", required, placeholder, value, onChange, min }: {
  id: string; type?: string; required?: boolean;
  placeholder?: string; value: string;
  onChange: (v: string) => void; min?: string;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      id={id} type={type} required={required}
      placeholder={placeholder} value={value}
      min={min}
      onChange={(e) => onChange(e.target.value)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        ...inputStyle,
        borderColor: focused ? "#C4A96A" : "rgba(196,169,106,0.30)",
        boxShadow: focused ? "0 0 0 3px rgba(196,169,106,0.12)" : "none",
      }}
    />
  );
}

function Select({ id, value, onChange, children }: {
  id: string; value: string;
  onChange: (v: string) => void; children: React.ReactNode;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <select
      id={id} value={value}
      onChange={(e) => onChange(e.target.value)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        ...inputStyle,
        cursor: "pointer",
        appearance: "none" as const,
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23C4A96A' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right 14px center",
        paddingRight: 38,
        borderColor: focused ? "#C4A96A" : "rgba(196,169,106,0.30)",
        boxShadow: focused ? "0 0 0 3px rgba(196,169,106,0.12)" : "none",
      }}
    >
      {children}
    </select>
  );
}

function Textarea({ id, value, onChange, placeholder }: {
  id: string; value: string;
  onChange: (v: string) => void; placeholder?: string;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <textarea
      id={id} value={value} rows={4}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        ...inputStyle,
        resize: "vertical",
        minHeight: 100,
        borderColor: focused ? "#C4A96A" : "rgba(196,169,106,0.30)",
        boxShadow: focused ? "0 0 0 3px rgba(196,169,106,0.12)" : "none",
      }}
    />
  );
}

/* Services multi-select with removable tags */
function ServicesSelect({ selected, onChange }: {
  selected: string[]; onChange: (s: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const toggle = (service: string) => {
    onChange(
      selected.includes(service)
        ? selected.filter((s) => s !== service)
        : [...selected, service]
    );
  };

  return (
    <div ref={ref} style={{ position: "relative" }}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        style={{
          ...inputStyle,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          cursor: "pointer", textAlign: "left",
          color: selected.length ? "#2C2A25" : "#9A9589",
        }}
      >
        <span>{selected.length ? `${selected.length} service${selected.length > 1 ? "s" : ""} selected` : "Select services…"}</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#C4A96A" strokeWidth="2"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s", flexShrink: 0 }}>
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }} transition={{ duration: 0.18 }}
            style={{
              position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0,
              background: "rgba(253,250,246,0.98)",
              border: "1px solid rgba(196,169,106,0.30)",
              borderRadius: 8,
              boxShadow: "0 8px 32px rgba(58,56,50,0.12)",
              zIndex: 50,
              maxHeight: 220,
              overflowY: "auto",
              padding: "6px 0",
            }}
          >
            {SERVICE_GROUPS.map((grp) => (
              <div key={grp.group}>
                {/* Group header */}
                <div style={{
                  padding: "7px 14px 4px",
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "0.60rem", fontWeight: 700,
                  letterSpacing: "0.22em", textTransform: "uppercase",
                  color: "#7A5C10",
                  borderTop: "1px solid rgba(196,169,106,0.16)",
                }}>
                  {grp.group}
                </div>
                {grp.items.map((s) => (
                  <label key={s} style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "8px 14px 8px 20px", cursor: "pointer",
                    fontFamily: "'Inter', sans-serif", fontSize: "0.82rem", color: "#2C2A25",
                    background: selected.includes(s) ? "rgba(196,169,106,0.08)" : "transparent",
                    transition: "background 0.15s",
                  }}>
                    <input
                      type="checkbox"
                      checked={selected.includes(s)}
                      onChange={() => toggle(s)}
                      style={{ accentColor: "#C4A96A", width: 14, height: 14, flexShrink: 0 }}
                    />
                    {s}
                  </label>
                ))}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tags */}
      {selected.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
          {selected.map((s) => (
            <span key={s} style={{
              display: "inline-flex", alignItems: "center", gap: 5,
              fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", fontWeight: 500,
              background: "rgba(196,169,106,0.12)",
              border: "1px solid rgba(196,169,106,0.35)",
              borderRadius: 999, padding: "4px 10px",
              color: "#3A3832",
            }}>
              {s}
              <button
                type="button"
                onClick={() => toggle(s)}
                style={{ display: "flex", alignItems: "center", background: "none", border: "none",
                  cursor: "pointer", padding: 0, color: "#7A5C10", lineHeight: 1 }}
                aria-label={`Remove ${s}`}
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Date-Time pair ────────────────────────────────────────────────────── */
function DateTimePair({ index, date, time, onDate, onTime, required }: {
  index: number; date: string; time: string;
  onDate: (v: string) => void; onTime: (v: string) => void;
  required?: boolean;
}) {
  const ordinals = ["First", "Second", "Third"];
  const label = ordinals[index];
  const today = new Date().toISOString().split("T")[0];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
      <div>
        <FieldLabel htmlFor={`date-${index}`} required={required}>
          {label} preferred date
        </FieldLabel>
        <Input id={`date-${index}`} type="date" required={required}
          value={date} onChange={onDate} min={today} />
      </div>
      <div>
        <FieldLabel htmlFor={`time-${index}`} required={required}>
          {label} preferred time
        </FieldLabel>
        <Select id={`time-${index}`} value={time} onChange={onTime}>
          <option value="">Select time…</option>
          {TIME_SLOTS.map((t) => <option key={t} value={t}>{t}</option>)}
        </Select>
      </div>
    </div>
  );
}

/* ─── Divider ───────────────────────────────────────────────────────────── */
function Divider() {
  return (
    <div style={{
      height: 1, margin: "clamp(24px, 4vw, 36px) 0",
      background: "linear-gradient(to right, transparent, rgba(196,169,106,0.30), transparent)",
    }} />
  );
}

/* ─── Falling petals & leaves ───────────────────────────────────────────── */
// Petal configs — static (no Math.random at module level) to avoid SSR mismatch.
// Colors sampled from the watercolor floral background: blush pinks, sage greens,
// dusty roses, warm creams, muted earthy tones.
const PETAL_CONFIGS = [
  { id:  1, left:  "3%",  size: 13, color: "rgba(225,171,168,0.54)", delay:  0.0, dur: 14, driftKey: "A", initRotate:  20 },
  { id:  2, left: "12%",  size:  9, color: "rgba(148,173,138,0.50)", delay:  2.2, dur: 17, driftKey: "B", initRotate: 160 },
  { id:  3, left: "22%",  size: 15, color: "rgba(245,185,185,0.52)", delay:  4.5, dur: 12, driftKey: "A", initRotate: 300 },
  { id:  4, left: "33%",  size:  8, color: "rgba(172,177,140,0.46)", delay:  1.1, dur: 15, driftKey: "C", initRotate:  85 },
  { id:  5, left: "44%",  size: 11, color: "rgba(255,193,190,0.50)", delay:  6.8, dur: 13, driftKey: "B", initRotate: 210 },
  { id:  6, left: "54%",  size: 14, color: "rgba(162,190,152,0.47)", delay:  3.3, dur: 16, driftKey: "A", initRotate: 140 },
  { id:  7, left: "64%",  size: 10, color: "rgba(232,185,170,0.52)", delay:  8.0, dur: 14, driftKey: "C", initRotate: 260 },
  { id:  8, left: "74%",  size: 12, color: "rgba(185,207,172,0.46)", delay:  5.6, dur: 18, driftKey: "B", initRotate:  50 },
  { id:  9, left: "83%",  size:  9, color: "rgba(250,180,175,0.53)", delay:  0.7, dur: 12, driftKey: "A", initRotate: 330 },
  { id: 10, left: "91%",  size: 13, color: "rgba(145,175,133,0.49)", delay:  9.4, dur: 15, driftKey: "C", initRotate:  70 },
  { id: 11, left: "40%",  size:  8, color: "rgba(215,165,148,0.46)", delay:  7.1, dur: 13, driftKey: "B", initRotate: 190 },
  { id: 12, left: "60%",  size: 11, color: "rgba(255,195,195,0.50)", delay: 10.5, dur: 16, driftKey: "A", initRotate: 110 },
] as const;

/* ─── Long slender leaf configs ──────────────────────────────────────────────
   6 leaves: scattered across the screen, slow deliberate fall (20-28s),
   minimal rotation — long leaves tumble lazily, not like light petals.
   variant 0 = classic lancet · 1 = willowy narrow · 2 = tropical blade      */
const LONG_LEAF_CONFIGS = [
  { id: "LL1", left: "10%", w: 9,  h: 96,  delay:  1.4, dur: 23, driftKey: "L", initRotate: -18, variant: 0 },
  { id: "LL2", left: "35%", w: 7,  h: 112, delay:  7.0, dur: 27, driftKey: "R", initRotate:  22, variant: 1 },
  { id: "LL3", left: "62%", w: 11, h: 88,  delay: 12.5, dur: 21, driftKey: "L", initRotate:  -6, variant: 2 },
  { id: "LL4", left: "85%", w: 8,  h: 104, delay:  4.2, dur: 25, driftKey: "R", initRotate:  15, variant: 0 },
] as const;

/* ─── Long watercolor leaf SVG ───────────────────────────────────────────────
   Three silhouette variants share the same gradient logic.
   The gradient is axial along the leaf's length: dark base → mid sage → pale tip.
   A hairline midrib and faint lateral veins give botanical depth.
   Slight feathered edges are simulated by making the path stroke semi-transparent. */
function LongLeafSVG({ id, w, h, variant }: { id: string; w: number; h: number; variant: 0 | 1 | 2 }) {
  // Unique gradient IDs keyed to this leaf so multiple leaves don't share defs
  const gBody = `llg-body-${id}`;
  const gVein = `llg-vein-${id}`;
  const gEdge = `llg-edge-${id}`;

  // Paths scaled to a normalised 10×80 viewBox — rendered at actual w×h by SVG
  // variant 0: classic symmetric lancet
  // variant 1: willowy — narrow waist, tapers strongly at both ends
  // variant 2: tropical blade — broad base that tapers quickly to a long fine tip
  const paths: Record<number, { body: string; vb: string }> = {
    0: {
      vb: "0 0 10 80",
      body: "M5,0 C8.5,6 10,18 10,28 C10,50 7.5,66 5,80 C2.5,66 0,50 0,28 C0,18 1.5,6 5,0 Z",
    },
    1: {
      vb: "0 0 8 88",
      body: "M4,0 C6,8 7.5,20 7,34 C6.5,54 5.2,72 4,88 C2.8,72 1.5,54 1,34 C0.5,20 2,8 4,0 Z",
    },
    2: {
      vb: "0 0 14 76",
      body: "M7,0 C11,5 14,16 13,28 C12,44 10,58 7,76 C4,58 2,44 1,28 C0,16 3,5 7,0 Z",
    },
  };
  const { vb, body } = paths[variant];

  // Extract viewBox numbers for vein positioning
  const [, , vbW, vbH] = vb.split(" ").map(Number);
  const cx = vbW / 2;

  return (
    <svg
      width={w} height={h}
      viewBox={vb}
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "block", filter: "blur(0.4px)" }}
    >
      <defs>
        {/* Axial body gradient: rich forest green → sage → pale mint at tip */}
        <linearGradient id={gBody} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#3B6B28" stopOpacity="0.55" />
          <stop offset="22%"  stopColor="#4E8535" stopOpacity="0.72" />
          <stop offset="55%"  stopColor="#6BA44A" stopOpacity="0.65" />
          <stop offset="82%"  stopColor="#8DC06A" stopOpacity="0.48" />
          <stop offset="100%" stopColor="#AACE85" stopOpacity="0.18" />
        </linearGradient>
        {/* Lateral gradient for the feathered-edge watercolor wash */}
        <linearGradient id={gEdge} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="#5A9240" stopOpacity="0.08" />
          <stop offset="28%"  stopColor="#5A9240" stopOpacity="0.55" />
          <stop offset="50%"  stopColor="#4A7D33" stopOpacity="0.70" />
          <stop offset="72%"  stopColor="#5A9240" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#5A9240" stopOpacity="0.08" />
        </linearGradient>
        {/* Vein colour — slightly darker, low opacity */}
        <linearGradient id={gVein} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#2A5020" stopOpacity="0.50" />
          <stop offset="100%" stopColor="#6B9A4A" stopOpacity="0.15" />
        </linearGradient>
      </defs>

      {/* ── Body — axial fill first, then lateral colour-wash on top ── */}
      <path d={body} fill={`url(#${gBody})`} />
      <path d={body} fill={`url(#${gEdge})`} />

      {/* ── Midrib ─────────────────────────────────────────────────── */}
      <line
        x1={cx} y1={vbH * 0.04}
        x2={cx} y2={vbH * 0.95}
        stroke={`url(#${gVein})`}
        strokeWidth="0.55"
        strokeLinecap="round"
      />

      {/* ── Lateral veins (3 pairs, radiating from midrib) ─────────── */}
      {[0.25, 0.45, 0.63].map((frac, i) => {
        const y  = vbH * frac;
        // How far out to the leaf edge at this fraction — approximated
        const xOut = (cx * 0.78) * (1 - Math.abs(frac - 0.4));
        return (
          <g key={i} opacity="0.40">
            <line x1={cx} y1={y} x2={cx + xOut} y2={y + vbH * 0.055}
              stroke={`url(#${gVein})`} strokeWidth="0.32" strokeLinecap="round" />
            <line x1={cx} y1={y} x2={cx - xOut} y2={y + vbH * 0.055}
              stroke={`url(#${gVein})`} strokeWidth="0.32" strokeLinecap="round" />
          </g>
        );
      })}
    </svg>
  );
}

// SVG petal shape — a soft elongated ellipse (even-numbered IDs become leaf-like)
function PetalShape({ id, color, size }: { id: number; color: string; size: number }) {
  const isLeaf = id % 3 === 0;
  if (isLeaf) {
    // Pointed leaf silhouette
    return (
      <svg
        width={size} height={Math.round(size * 1.6)}
        viewBox="0 0 20 32" xmlns="http://www.w3.org/2000/svg"
        style={{ display: "block", filter: "blur(0.3px)" }}
      >
        <path
          d="M10 1 C18 8 18 22 10 31 C2 22 2 8 10 1Z"
          fill={color}
        />
        <line x1="10" y1="3" x2="10" y2="29"
          stroke={color.replace(/[\d.]+\)$/, "0.28)")} strokeWidth="0.7" />
      </svg>
    );
  }
  // Soft rounded petal
  return (
    <svg
      width={size} height={Math.round(size * 1.4)}
      viewBox="0 0 20 28" xmlns="http://www.w3.org/2000/svg"
      style={{ display: "block", filter: "blur(0.25px)" }}
    >
      <ellipse cx="10" cy="14" rx="8" ry="12"
        fill={color} />
      <line x1="10" y1="4" x2="10" y2="24"
        stroke={color.replace(/[\d.]+\)$/, "0.22)")} strokeWidth="0.6" />
    </svg>
  );
}

function FallingPetals() {
  // Render nothing on server; mount only on client to avoid hydration mismatch
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  return (
    <>
      {/* ── CSS keyframes + reduced-motion guard ─────────────────────── */}
      <style>{`
        /* Three drift paths to add organic variety */
        @keyframes petal-drift-A {
          0%   { transform: translateY(-12vh) translateX(0px)   rotate(var(--r0)); opacity: 0; }
          6%   { opacity: var(--op); }
          28%  { transform: translateY(28vh)  translateX(38px)  rotate(calc(var(--r0) + 60deg)); }
          55%  { transform: translateY(60vh)  translateX(-22px) rotate(calc(var(--r0) + 130deg)); }
          80%  { transform: translateY(88vh)  translateX(18px)  rotate(calc(var(--r0) + 200deg)); opacity: var(--op); }
          93%  { opacity: 0; }
          100% { transform: translateY(110vh) translateX(8px)   rotate(calc(var(--r0) + 260deg)); opacity: 0; }
        }
        @keyframes petal-drift-B {
          0%   { transform: translateY(-12vh) translateX(0px)    rotate(var(--r0)); opacity: 0; }
          6%   { opacity: var(--op); }
          30%  { transform: translateY(30vh)  translateX(-44px)  rotate(calc(var(--r0) - 55deg)); }
          58%  { transform: translateY(62vh)  translateX(28px)   rotate(calc(var(--r0) - 120deg)); }
          82%  { transform: translateY(90vh)  translateX(-14px)  rotate(calc(var(--r0) - 195deg)); opacity: var(--op); }
          94%  { opacity: 0; }
          100% { transform: translateY(110vh) translateX(-5px)   rotate(calc(var(--r0) - 250deg)); opacity: 0; }
        }
        @keyframes petal-drift-C {
          0%   { transform: translateY(-12vh) translateX(0px)   rotate(var(--r0)); opacity: 0; }
          6%   { opacity: var(--op); }
          22%  { transform: translateY(22vh)  translateX(28px)  rotate(calc(var(--r0) + 45deg)); }
          44%  { transform: translateY(48vh)  translateX(-32px) rotate(calc(var(--r0) + 100deg)); }
          66%  { transform: translateY(70vh)  translateX(40px)  rotate(calc(var(--r0) + 160deg)); }
          86%  { transform: translateY(92vh)  translateX(-10px) rotate(calc(var(--r0) + 220deg)); opacity: var(--op); }
          96%  { opacity: 0; }
          100% { transform: translateY(110vh) translateX(5px)   rotate(calc(var(--r0) + 270deg)); opacity: 0; }
        }

        .falling-petal {
          position: absolute;
          top: 0;
          will-change: transform, opacity;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
          animation-fill-mode: both;
          pointer-events: none;
        }

        /* ── Long leaf keyframes ─────────────────────────────────────────
           Leaves fall slower and rotate far less than petals — they are
           heavier and longer, so they drift lazily with wide, calm sweeps. */
        @keyframes leaf-fall-L {
          0%   { transform: translateY(-16vh) translateX(0px)   rotate(var(--lr0));             opacity: 0; }
          7%   { opacity: var(--lop); }
          24%  { transform: translateY(22vh)  translateX(-34px) rotate(calc(var(--lr0) - 10deg)); }
          48%  { transform: translateY(50vh)  translateX(20px)  rotate(calc(var(--lr0) -  4deg)); }
          72%  { transform: translateY(76vh)  translateX(-28px) rotate(calc(var(--lr0) - 16deg)); opacity: var(--lop); }
          88%  { opacity: 0; }
          100% { transform: translateY(114vh) translateX(-12px) rotate(calc(var(--lr0) - 22deg)); opacity: 0; }
        }
        @keyframes leaf-fall-R {
          0%   { transform: translateY(-16vh) translateX(0px)   rotate(var(--lr0));             opacity: 0; }
          7%   { opacity: var(--lop); }
          24%  { transform: translateY(22vh)  translateX(36px)  rotate(calc(var(--lr0) + 12deg)); }
          48%  { transform: translateY(50vh)  translateX(-18px) rotate(calc(var(--lr0) +  5deg)); }
          72%  { transform: translateY(76vh)  translateX(26px)  rotate(calc(var(--lr0) + 18deg)); opacity: var(--lop); }
          88%  { opacity: 0; }
          100% { transform: translateY(114vh) translateX(10px)  rotate(calc(var(--lr0) + 24deg)); opacity: 0; }
        }

        .falling-long-leaf {
          position: absolute;
          top: 0;
          will-change: transform, opacity;
          animation-timing-function: cubic-bezier(0.37, 0, 0.63, 1);
          animation-iteration-count: infinite;
          animation-fill-mode: both;
          pointer-events: none;
        }

        /* Respect user preference — stop animation entirely */
        @media (prefers-reduced-motion: reduce) {
          .falling-petal,
          .falling-long-leaf { animation: none !important; opacity: 0 !important; }
        }
      `}</style>

      {/* ── Fixed layer — behind form (z-index 0), above background ─── */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          top: 0, left: 0, right: 0, bottom: 0,
          zIndex: 0,
          pointerEvents: "none",
          overflow: "hidden",
        }}
      >
        {/* ── Petals ──────────────────────────────────────────────── */}
        {PETAL_CONFIGS.map((p) => (
          <div
            key={p.id}
            className="falling-petal"
            style={{
              left: p.left,
              ["--r0" as string]: `${p.initRotate}deg`,
              ["--op" as string]: "1",
              animationName: `petal-drift-${p.driftKey}`,
              animationDuration: `${p.dur}s`,
              animationDelay: `${p.delay}s`,
            }}
          >
            <PetalShape id={p.id} color={p.color} size={p.size} />
          </div>
        ))}

        {/* ── Long slender green leaves ────────────────────────────── */}
        {LONG_LEAF_CONFIGS.map((l) => (
          <div
            key={l.id}
            className="falling-long-leaf"
            style={{
              left: l.left,
              /* --lr0: starting angle; kept small so leaves don't flip upside-down */
              ["--lr0" as string]: `${l.initRotate}deg`,
              ["--lop" as string]: "1",
              animationName: `leaf-fall-${l.driftKey}`,
              animationDuration: `${l.dur}s`,
              animationDelay: `${l.delay}s`,
            }}
          >
            <LongLeafSVG id={l.id} w={l.w} h={l.h} variant={l.variant} />
          </div>
        ))}
      </div>
    </>
  );
}

/* ─── Main component ────────────────────────────────────────────────────── */
export default function BookingPageContent({ bgImage }: { bgImage?: string }) {
  /* form state */
  const [name,     setName]     = useState("");
  const [email,    setEmail]    = useState("");
  const [phone,    setPhone]    = useState("");
  const [stylist,  setStylist]  = useState("No Preference");
  const [services, setServices] = useState<string[]>([]);
  const [dates,    setDates]    = useState(["", "", ""]);
  const [times,    setTimes]    = useState(["", "", ""]);
  const [notes,    setNotes]    = useState("");
  const [status,   setStatus]   = useState<"idle" | "sending" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [honeypot, setHoneypot] = useState("");

  const setDate = (i: number, v: string) =>
    setDates((d) => d.map((x, j) => (j === i ? v : x)));
  const setTime = (i: number, v: string) =>
    setTimes((t) => t.map((x, j) => (j === i ? v : x)));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Client-side validation of required fields
    if (!name.trim())          { setErrorMsg("Full name is required.");                               return; }
    if (!email.trim())         { setErrorMsg("Email address is required.");                           return; }
    if (!phone.trim())         { setErrorMsg("Phone number is required.");                            return; }
    if (!dates[0] || !times[0]) { setErrorMsg("Please select your first preferred date and time."); return; }

    setStatus("sending");
    setErrorMsg("");

    try {
      const res  = await fetch("/api/booking", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ name, email, phone, stylist, services, dates, times, notes, website: honeypot }),
      });
      const data = await res.json() as { success?: boolean; error?: string };

      if (res.ok && data.success) {
        setStatus("success");
      } else {
        setStatus("error");
        setErrorMsg(data.error ?? "Something went wrong. Please try again or call us.");
      }
    } catch {
      setStatus("error");
      setErrorMsg("Could not connect. Please check your connection and try again.");
    }
  };

  return (
    <main
      className="booking-main"
      style={{
        minHeight: "100svh",
        backgroundImage: `url('${bgImage ?? "/booking-bg.jpg"}')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
        position: "relative",
        padding: "clamp(110px, 14vh, 140px) clamp(20px, 6vw, 60px) clamp(72px, 10vh, 100px)",
      }}
    >
      {/* Soft overlay — keeps form legible without fully hiding the background */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, bottom: 0, pointerEvents: "none",
        background: "rgba(253,250,246,0.78)",
        zIndex: 0,
      }} />

      {/* ── Falling petals layer (z-index 1, pointer-events: none) ─── */}
      <FallingPetals />

      {/* ── All form content sits above the petals (z-index 2) ──────── */}
      <div style={{ maxWidth: 780, margin: "0 auto", position: "relative", zIndex: 2 }}>

        {/* ── PAGE HEADER ─────────────────────────────────────────────── */}
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE }}
          style={{ textAlign: "center", marginBottom: "clamp(40px, 6vh, 60px)" }}
        >
          <p style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "0.62rem", fontWeight: 700,
            letterSpacing: "0.30em", textTransform: "uppercase",
            color: "#7A5C10", marginBottom: 10,
          }}>
            Shear Madness Hoboken
          </p>

          <h1 style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: "clamp(2.4rem, 5vw, 4rem)",
            fontWeight: 600, lineHeight: 1.05,
            letterSpacing: "0.01em", color: "#556B2F",
            marginBottom: 18,
          }}>
            Online Appointment <em style={{ fontWeight: 300 }}>Book</em>
          </h1>

          {/* Gold divider */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 22 }}>
            <div style={{ height: 1, width: 44, background: "linear-gradient(to right, transparent, rgba(196,169,106,0.65))" }} />
            <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#C6A76B", opacity: 0.78 }} />
            <div style={{ height: 1, width: 44, background: "linear-gradient(to left, transparent, rgba(196,169,106,0.65))" }} />
          </div>

          <p style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: "clamp(1.0rem, 1.6vw, 1.2rem)",
            fontStyle: "italic",
            lineHeight: 1.7, color: "#3A3832", fontWeight: 700,
            maxWidth: 520, margin: "0 auto",
          }}>
            We look forward to seeing you. Fill in the form below and we'll confirm your appointment shortly.
          </p>
        </motion.header>

        {/* ── FORM CARD ───────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: EASE, delay: 0.15 }}
          style={{
            /* ── Semi-transparent card — lets the floral bg breathe through ── */
            background: "rgba(253,250,244,0.20)",
            backdropFilter: "blur(10px) saturate(1.3)",
            WebkitBackdropFilter: "blur(10px) saturate(1.3)",
            border: "1px solid rgba(196,169,106,0.28)",
            borderRadius: 16,
            boxShadow: "0 8px 48px rgba(58,56,50,0.10), 0 2px 8px rgba(58,56,50,0.06), inset 0 1px 0 rgba(255,255,255,0.55)",
            padding: "clamp(28px, 5vw, 52px)",
          }}
        >
          <AnimatePresence mode="wait">
            {status === "success" ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: EASE }}
                style={{ textAlign: "center", padding: "clamp(32px, 6vw, 64px) 0" }}
              >
                {/* Checkmark */}
                <div style={{
                  width: 64, height: 64, borderRadius: "50%",
                  background: "linear-gradient(135deg,#C9A96E,#B8935A)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 24px",
                  boxShadow: "0 8px 24px rgba(196,169,106,0.35)",
                }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
                    stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <h2 style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)",
                  fontWeight: 600, color: "#556B2F", marginBottom: 12,
                }}>
                  Request Received
                </h2>
                <p style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "0.92rem", lineHeight: 1.7, color: "#3A3832",
                  maxWidth: 420, margin: "0 auto 28px",
                }}>
                  We will be in touch with you shortly to confirm your appointment.
                </p>
                <button
                  onClick={() => {
                    setStatus("idle");
                    setErrorMsg("");
                    setName(""); setEmail(""); setPhone(""); setStylist("No Preference");
                    setServices([]); setDates(["","",""]); setTimes(["","",""]); setNotes("");
                  }}
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "0.72rem", fontWeight: 600,
                    letterSpacing: "0.18em", textTransform: "uppercase",
                    color: "#7A5C10", background: "none", border: "none",
                    cursor: "pointer", textDecoration: "underline",
                    textDecorationColor: "rgba(196,169,106,0.4)",
                  }}
                >
                  Book another appointment
                </button>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                onSubmit={handleSubmit}
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{ display: "flex", flexDirection: "column", gap: 0 }}
              >
                {/* ── 1. PERSONAL INFORMATION ─────────────────────── */}
                <SectionLabel>Section 1</SectionLabel>
                <SectionHeading>Personal Information</SectionHeading>

                <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                  <div>
                    <FieldLabel htmlFor="name" required>Full Name</FieldLabel>
                    <Input id="name" required placeholder="Jane Smith"
                      value={name} onChange={setName} />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                    <div>
                      <FieldLabel htmlFor="email" required>Email Address</FieldLabel>
                      <Input id="email" type="email" required placeholder="jane@email.com"
                        value={email} onChange={setEmail} />
                    </div>
                    <div>
                      <FieldLabel htmlFor="phone" required>Phone Number</FieldLabel>
                      <Input id="phone" type="tel" required placeholder="(201) 555-0100"
                        value={phone} onChange={setPhone} />
                    </div>
                  </div>
                </div>

                <Divider />

                {/* ── 2. SERVICE DETAILS ───────────────────────────── */}
                <SectionLabel>Section 2</SectionLabel>
                <SectionHeading>Service Details</SectionHeading>

                <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                  <div>
                    <FieldLabel htmlFor="stylist">Preferred Stylist</FieldLabel>
                    <Select id="stylist" value={stylist} onChange={setStylist}>
                      {STYLISTS.map((s) => <option key={s} value={s}>{s}</option>)}
                    </Select>
                  </div>
                  <div>
                    <FieldLabel htmlFor="services">Service(s) Requested</FieldLabel>
                    <ServicesSelect selected={services} onChange={setServices} />
                  </div>
                </div>

                <Divider />

                {/* ── 3. APPOINTMENT PREFERENCE ────────────────────── */}
                <SectionLabel>Section 3</SectionLabel>
                <SectionHeading>Appointment Preference</SectionHeading>

                <p style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "0.80rem", color: "rgba(58,56,50,0.60)",
                  lineHeight: 1.6, marginBottom: 20, marginTop: -10,
                }}>
                  Pick up to three preferred appointment dates and times. We'll do our best to accommodate your first choice.
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                  <DateTimePair index={0} date={dates[0]} time={times[0]}
                    onDate={(v) => setDate(0, v)} onTime={(v) => setTime(0, v)} required />
                  <DateTimePair index={1} date={dates[1]} time={times[1]}
                    onDate={(v) => setDate(1, v)} onTime={(v) => setTime(1, v)} />
                  <DateTimePair index={2} date={dates[2]} time={times[2]}
                    onDate={(v) => setDate(2, v)} onTime={(v) => setTime(2, v)} />
                </div>

                <Divider />

                {/* ── 4. ADDITIONAL INFORMATION ────────────────────── */}
                <SectionLabel>Section 4</SectionLabel>
                <SectionHeading>Additional Information</SectionHeading>

                <div>
                  <FieldLabel htmlFor="notes">Other Requests or Notes</FieldLabel>
                  <Textarea id="notes" value={notes} onChange={setNotes}
                    placeholder="Allergies, accessibility needs, special requests…" />
                </div>

                {/* Honeypot — hidden from real users, catches bots */}
                <input
                  type="text" name="website" value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                  aria-hidden="true" tabIndex={-1} autoComplete="off"
                  style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }}
                />

                {/* ── REQUIRED NOTE ────────────────────────────────── */}
                <p style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "0.70rem", color: "rgba(58,56,50,0.50)",
                  marginTop: 20, marginBottom: errorMsg ? 14 : 28,
                }}>
                  <span style={{ color: "#7A5C10" }}>*</span> Required fields
                </p>

                {/* ── ERROR MESSAGE ─────────────────────────────────── */}
                {errorMsg && (
                  <p style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "0.78rem", color: "#8B2E2E",
                    background: "rgba(139,46,46,0.06)",
                    border: "1px solid rgba(139,46,46,0.18)",
                    borderRadius: 8, padding: "10px 14px",
                    marginBottom: 20, lineHeight: 1.5,
                  }}>
                    {errorMsg}
                  </p>
                )}

                {/* ── SUBMIT ───────────────────────────────────────── */}
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <button
                    type="submit"
                    disabled={status === "sending"}
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: "0.72rem", fontWeight: 600,
                      letterSpacing: "0.22em", textTransform: "uppercase",
                      color: "#fff",
                      background: status === "sending"
                        ? "rgba(196,169,106,0.55)"
                        : "linear-gradient(135deg,#C9A96E 0%,#B8935A 55%,#C4A96A 100%)",
                      border: "none", borderRadius: 999,
                      padding: "15px 52px",
                      cursor: status === "sending" ? "not-allowed" : "pointer",
                      boxShadow: "0 4px 20px rgba(196,169,106,0.38)",
                      transition: "all 0.35s ease",
                      display: "inline-flex", alignItems: "center", gap: 10,
                    }}
                    onMouseEnter={(e) => {
                      if (status === "sending") return;
                      const b = e.currentTarget;
                      b.style.boxShadow = "0 8px 28px rgba(196,169,106,0.55)";
                      b.style.transform = "translateY(-2px)";
                    }}
                    onMouseLeave={(e) => {
                      const b = e.currentTarget;
                      b.style.boxShadow = "0 4px 20px rgba(196,169,106,0.38)";
                      b.style.transform = "translateY(0)";
                    }}
                  >
                    {status === "sending" ? (
                      <>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                          stroke="#fff" strokeWidth="2.5" strokeLinecap="round"
                          style={{ animation: "spin 0.8s linear infinite" }}>
                          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4" />
                        </svg>
                        Sending…
                      </>
                    ) : "Submit Request"}
                  </button>
                </div>

                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ── FOOTER NOTE ─────────────────────────────────────────────── */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, ease: EASE, delay: 0.4 }}
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "0.72rem", color: "#0A0A0A", fontWeight: 700,
            textAlign: "center", marginTop: 28, lineHeight: 1.7,
          }}
        >
          Prefer to call? Reach us at{" "}
          <a href="tel:+12012222102" style={{ color: "#7A5C10", textDecoration: "none" }}>
            (201) 222-2102
          </a>
          {" "}— we're happy to book your appointment over the phone.
        </motion.p>

      </div>

      {/* Responsive grid collapse */}
      <style>{`
        @media (max-width: 540px) {
          .booking-grid-2 { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 1024px) {
          .booking-main { background-attachment: scroll !important; }
        }
      `}</style>
    </main>
  );
}
