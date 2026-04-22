"use client";

import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";

export interface SliderImage {
  src: string;
  alt: string;
  onClick?: () => void;
}

interface ImageAutoSliderProps {
  images: SliderImage[];
  /** Number of fully visible cards (default 3) */
  visibleCount?: number;
  /** Gap between cards in px (default 16) */
  gap?: number;
  /** Seconds to scroll through one full set (default 60 = slow) */
  speed?: number;
}

export function ImageAutoSlider({
  images,
  visibleCount = 3,
  gap = 16,
  speed = 60,
}: ImageAutoSliderProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [cardWidth, setCardWidth] = useState(0);

  useEffect(() => {
    const update = () => {
      if (!viewportRef.current) return;
      const w = viewportRef.current.offsetWidth;
      setCardWidth((w - gap * (visibleCount - 1)) / visibleCount);
    };
    update();
    const ro = new ResizeObserver(update);
    if (viewportRef.current) ro.observe(viewportRef.current);
    return () => ro.disconnect();
  }, [visibleCount, gap]);

  // One full set width (px): used as the CSS keyframe endpoint
  const oneSetWidth = cardWidth > 0
    ? images.length * (cardWidth + gap)
    : 0;

  // Triple images for seamless loop
  const looped = [...images, ...images, ...images];

  return (
    <div
      ref={viewportRef}
      className="w-full overflow-hidden relative"
      style={{
        mask: "linear-gradient(90deg, transparent 0%, black 6%, black 94%, transparent 100%)",
        WebkitMask: "linear-gradient(90deg, transparent 0%, black 6%, black 94%, transparent 100%)",
      }}
    >
      {oneSetWidth > 0 && (
        <>
          <style>{`
            @keyframes auto-slide-${Math.round(oneSetWidth)} {
              0%   { transform: translateX(0px); }
              100% { transform: translateX(-${oneSetWidth}px); }
            }
            .auto-slider-inner-${Math.round(oneSetWidth)} {
              animation: auto-slide-${Math.round(oneSetWidth)} ${speed}s linear infinite;
              will-change: transform;
            }
            .auto-slider-inner-${Math.round(oneSetWidth)}:hover {
              animation-play-state: paused;
            }
          `}</style>

          <div
            className={`auto-slider-inner-${Math.round(oneSetWidth)} flex py-2`}
            style={{ gap, width: "max-content" }}
          >
            {looped.map((img, i) => (
              <div
                key={i}
                onClick={img.onClick}
                className="relative flex-shrink-0 overflow-hidden rounded-2xl shadow-md cursor-zoom-in"
                style={{
                  width: cardWidth,
                  height: Math.min(cardWidth * 1.15, 320),
                  transition: "transform 0.3s ease, box-shadow 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLDivElement;
                  el.style.transform = "scale(1.04)";
                  el.style.boxShadow = "0 14px 36px rgba(58,56,50,0.20)";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLDivElement;
                  el.style.transform = "scale(1)";
                  el.style.boxShadow = "";
                }}
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  className="object-cover"
                  sizes="33vw"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
