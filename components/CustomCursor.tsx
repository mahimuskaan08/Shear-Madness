"use client";

import { useEffect } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export default function CustomCursor() {
  const mx = useMotionValue(-100);
  const my = useMotionValue(-100);

  // Ring follows with a gentle spring lag
  const rx = useSpring(mx, { damping: 28, stiffness: 180, mass: 0.55 });
  const ry = useSpring(my, { damping: 28, stiffness: 180, mass: 0.55 });

  // Ring scale — expands on interactive elements
  const ringScale = useMotionValue(1);
  const ringScaleSpring = useSpring(ringScale, { damping: 22, stiffness: 200 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mx.set(e.clientX);
      my.set(e.clientY);
    };
    const onOver = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest("a, button")) {
        ringScale.set(1.75);
      }
    };
    const onOut = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest("a, button")) {
        ringScale.set(1);
      }
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseover", onOver);
    window.addEventListener("mouseout", onOut);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
      window.removeEventListener("mouseout", onOut);
    };
  }, [mx, my, ringScale]);

  return (
    <>
      {/* Dot — snaps instantly to pointer */}
      <motion.div
        className="fixed z-[9999] pointer-events-none hidden md:block rounded-full"
        style={{
          x: mx,
          y: my,
          translateX: "-50%",
          translateY: "-50%",
          width: 5,
          height: 5,
          background: "#C4A96A",
        }}
      />

      {/* Ring — lags with spring, expands on hover */}
      <motion.div
        className="fixed z-[9998] pointer-events-none hidden md:block rounded-full"
        style={{
          x: rx,
          y: ry,
          scale: ringScaleSpring,
          translateX: "-50%",
          translateY: "-50%",
          width: 32,
          height: 32,
          border: "1px solid rgba(196,169,106,0.52)",
        }}
      />
    </>
  );
}
