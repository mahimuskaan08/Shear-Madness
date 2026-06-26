"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

// Above-fold + page background images to preload
const PRELOAD_IMAGES = [
  "/hero-bg.png",
  "/hero-bg-mobile.png",
  "/shear-madness-logo.png",
  "/about-bg.png",
  "/about-bg-mobile.png",
  "/artist-bg.png",
  "/services-koi-bg.png",
  "/services-koi-bg-mobile.png",
  "/contact-koi-bg.png",
  "/gallery-bg.png",
  "/booking-bg.jpg",
];

const PETALS = [
  { id:  0, left:  5, size: 10, delay:   0, dur: 12, rot:  20, drift:  30 },
  { id:  1, left: 18, size:  8, delay:  -4, dur: 16, rot: 130, drift: -22 },
  { id:  2, left: 33, size: 11, delay:  -8, dur: 14, rot:  65, drift:  42 },
  { id:  3, left: 52, size:  9, delay:  -5, dur: 18, rot: 210, drift: -32 },
  { id:  4, left: 67, size: 10, delay: -11, dur: 15, rot:  88, drift:  26 },
  { id:  5, left: 80, size:  8, delay:  -3, dur: 13, rot:  50, drift: -28 },
  { id:  6, left: 91, size: 11, delay:  -7, dur: 17, rot: 170, drift:  34 },
  { id:  7, left: 44, size:  9, delay: -10, dur: 20, rot: 290, drift: -20 },
  { id:  8, left: 63, size: 10, delay:  -6, dur: 16, rot: 330, drift:  40 },
  { id:  9, left: 13, size:  8, delay: -13, dur: 22, rot:  42, drift: -16 },
  { id: 10, left: 76, size: 11, delay:  -9, dur: 14, rot: 155, drift:  30 },
  { id: 11, left: 27, size:  9, delay:  -2, dur: 19, rot: 245, drift: -44 },
];

const PETAL_COLORS = [
  "rgba(222,120,145,0.90)",
  "rgba(235,145,165,0.82)",
  "rgba(210,110,135,0.78)",
  "rgba(245,160,178,0.74)",
  "rgba(228,132,150,0.86)",
];

const PETAL_KF = PETALS.map(
  ({ id, rot, drift }) => `
@keyframes ldr-p${id} {
  0%   { transform: translateY(-70px) translateX(0px) rotate(${rot}deg); opacity: 0; }
  10%  { opacity: 0.88; }
  88%  { opacity: 0.68; }
  100% { transform: translateY(calc(100vh + 70px)) translateX(${drift}px) rotate(${rot + 420}deg); opacity: 0; }
}`
).join("");

function PetalSVG({ size, color }: { size: number; color: string }) {
  return (
    <svg
      width={size}
      height={Math.round(size * 1.3)}
      viewBox="0 0 20 26"
      fill="none"
      style={{ display: "block" }}
    >
      <path
        d="M10,1 C13.2,0.5 17.2,0 17.2,0 C15.6,4.2 17.8,9.4 16.8,14.2 C15.8,19 13.2,23.8 10,25.8 C6.8,23.8 4.2,19 3.2,14.2 C2.2,9.4 4.4,4.2 2.8,0 C2.8,0 6.8,0.5 10,1 Z"
        fill={color}
      />
      <ellipse cx="10" cy="12" rx="3.5" ry="6.5" fill="rgba(255,230,235,0.18)" />
      <path
        d="M10,3 Q10,14 10,25"
        stroke="rgba(180,100,120,0.20)"
        strokeWidth="0.6"
        fill="none"
      />
    </svg>
  );
}

export default function LoadingScreen() {
  const [progress, setProgress]   = useState(0);
  const [isExiting, setIsExiting] = useState(false);
  const [isDone, setIsDone]       = useState(false);
  const progressRef = useRef(0);
  const doneRef     = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    document.getElementById("shear-instant-loader")?.remove();
    document.documentElement.style.overflow = "hidden";
    document.body.classList.add("shear-loading");

    let cancelled = false;
    const vidHandlers: Array<[HTMLVideoElement, () => void]> = [];

    function bump(amount: number) {
      if (cancelled) return;
      progressRef.current = Math.min(98, progressRef.current + amount);
      setProgress(Math.round(progressRef.current));
    }

    const tasks: Promise<void>[] = [];

    // Fonts — 15 %
    tasks.push(document.fonts.ready.then(() => bump(15)));

    // Images — 65 %
    const perImg = 65 / PRELOAD_IMAGES.length;
    PRELOAD_IMAGES.forEach(src => {
      tasks.push(
        new Promise<void>(res => {
          const img = new window.Image();
          img.onload  = () => { bump(perImg); res(); };
          img.onerror = () => { bump(perImg); res(); };
          img.src = src;
        })
      );
    });

    // Videos — 10 % (deferred; components may not be in DOM at mount)
    tasks.push(
      new Promise<void>(res => {
        setTimeout(() => {
          const vids = document.querySelectorAll<HTMLVideoElement>("video");
          if (!vids.length) { bump(10); res(); return; }
          let done = 0;
          const perV = 10 / vids.length;
          const finish = () => { bump(perV); if (++done === vids.length) res(); };
          vids.forEach(v => {
            if (v.readyState >= 3) {
              finish();
            } else {
              v.addEventListener("canplay", finish, { once: true });
              vidHandlers.push([v, finish]);
            }
          });
          // Hard timeout for very slow connections
          setTimeout(() => { if (done < vids.length) res(); }, 4000);
        }, 800);
      })
    );

    // Minimum display time — ensures the experience feels intentional
    tasks.push(new Promise<void>(res => setTimeout(res, 1100)));

    // Simulation fill — nudges the bar forward on slow connections
    intervalRef.current = setInterval(() => {
      if (cancelled) return;
      if (progressRef.current < 82) {
        progressRef.current += 0.35;
        setProgress(Math.round(progressRef.current));
      }
    }, 60);

    Promise.all(tasks).then(() => {
      if (doneRef.current || cancelled) return;
      doneRef.current = true;
      if (intervalRef.current) clearInterval(intervalRef.current);

      progressRef.current = 100;
      setProgress(100);

      // Resume paused CSS animations before the loader fades so the hero
      // entrance animation begins playing underneath the fade-out overlay.
      document.body.classList.remove("shear-loading");

      setTimeout(() => { if (!cancelled) setIsExiting(true); }, 300);
    });

    return () => {
      cancelled = true;
      if (intervalRef.current) clearInterval(intervalRef.current);
      vidHandlers.forEach(([v, h]) => v.removeEventListener("canplay", h));
      document.documentElement.style.overflow = "";
      document.body.classList.remove("shear-loading");
    };
  }, []);

  if (isDone) return null;

  return (
    <motion.div
      className="shear-loader fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden select-none"
      initial={{ opacity: 1 }}
      animate={{ opacity: isExiting ? 0 : 1 }}
      transition={{ duration: isExiting ? 0.7 : 0, ease: EASE }}
      onAnimationComplete={() => {
        if (isExiting) {
          setIsDone(true);
          document.documentElement.style.overflow = "";
        }
      }}
      style={{
        background:
          "linear-gradient(160deg, #FAF5EE 0%, #F4EBE0 30%, #EDE3D6 55%, #F2EBE0 80%, #FAF5EE 100%)",
        cursor: "default",
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: PETAL_KF }} />

      {/* Soft warm glow at center */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 75% 65% at 50% 48%, rgba(235,200,170,0.30) 0%, rgba(210,175,145,0.10) 50%, transparent 70%)",
        }}
      />

      {/* Watercolor bloom — top left */}
      <div
        aria-hidden="true"
        className="absolute pointer-events-none"
        style={{
          top: "-10%",
          left: "-8%",
          width: "50%",
          height: "55%",
          background:
            "radial-gradient(ellipse, rgba(218,172,178,0.16) 0%, transparent 65%)",
          transform: "rotate(-18deg)",
        }}
      />

      {/* Watercolor bloom — bottom right */}
      <div
        aria-hidden="true"
        className="absolute pointer-events-none"
        style={{
          bottom: "-12%",
          right: "-6%",
          width: "45%",
          height: "50%",
          background:
            "radial-gradient(ellipse, rgba(196,169,106,0.13) 0%, transparent 62%)",
          transform: "rotate(14deg)",
        }}
      />

      {/* Floating sakura petals */}
      <div
        aria-hidden="true"
        className="absolute inset-0 overflow-hidden pointer-events-none"
      >
        {PETALS.map(p => (
          <div
            key={p.id}
            style={{
              position: "absolute",
              left: `${p.left}vw`,
              top: 0,
              animation: `ldr-p${p.id} ${p.dur}s ${p.delay}s linear infinite`,
              willChange: "transform, opacity",
            }}
          >
            <PetalSVG
              size={p.size}
              color={PETAL_COLORS[p.id % PETAL_COLORS.length]}
            />
          </div>
        ))}
      </div>

      {/* ── Center content ────────────────────────────────────────────────── */}
      <div
        className="relative z-10 flex flex-col items-center"
        style={{ gap: 0 }}
      >
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.93 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1.4, ease: EASE }}
          style={{ marginBottom: "clamp(14px, 3vh, 28px)" }}
        >
          <Image
            src="/hero-logo.webp"
            alt="Shear Madness"
            width={612}
            height={408}
            priority
            unoptimized
            style={{
              width: "clamp(220px, 45vw, 380px)",
              maxWidth: "80vw",
              height: "auto",
              filter:
                "drop-shadow(0 2px 20px rgba(196,169,106,0.32)) drop-shadow(0 0 44px rgba(230,200,170,0.18))",
            }}
          />
        </motion.div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, ease: EASE, delay: 0.38 }}
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: "clamp(0.68rem, 1.6vw, 0.86rem)",
            fontWeight: 400,
            letterSpacing: "0.26em",
            textTransform: "uppercase",
            color: "rgba(58,56,50,0.56)",
            marginBottom: "clamp(30px, 5.5vh, 52px)",
          }}
        >
          Beauty&nbsp;&bull;&nbsp;Passion&nbsp;&bull;&nbsp;Experience
        </motion.p>

        {/* Progress bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.55 }}
          style={{ width: "clamp(160px, 26vw, 250px)" }}
        >
          {/* Track */}
          <div
            style={{
              width: "100%",
              height: "1px",
              background: "rgba(196,169,106,0.22)",
              borderRadius: "1px",
              overflow: "hidden",
              position: "relative",
            }}
          >
            {/* Gold fill */}
            <motion.div
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.35, ease: "linear" }}
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                height: "100%",
                background:
                  "linear-gradient(90deg, #B8935A 0%, #C4A96A 40%, #D9C08A 70%, #C4A96A 100%)",
                borderRadius: "1px",
                boxShadow:
                  "0 0 8px rgba(196,169,106,0.62), 0 0 18px rgba(196,169,106,0.24)",
              }}
            />
          </div>

          {/* Percentage label */}
          <p
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: "0.62rem",
              fontWeight: 300,
              letterSpacing: "0.22em",
              color: "rgba(58,56,50,0.38)",
              marginTop: "12px",
              textAlign: "center",
            }}
          >
            {progress}%
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}
