"use client";

import { useRef, useState, useEffect } from "react";

export default function AudioPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.play().then(() => setPlaying(true)).catch(() => {});
  }, []);

  function toggle() {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio.play().then(() => setPlaying(true)).catch(() => {});
    }
  }

  return (
    <>
      <audio ref={audioRef} src="/bg-audio.mp4" loop preload="auto" />
      <button
        onClick={toggle}
        aria-label={playing ? "Pause background music" : "Play background music"}
        title={playing ? "Pause music" : "Play music"}
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          zIndex: 9999,
          width: 38,
          height: 38,
          borderRadius: "50%",
          border: `1px solid ${playing ? "rgba(196,169,106,0.70)" : "rgba(196,169,106,0.40)"}`,
          background: playing
            ? "linear-gradient(135deg, #C9A96E 0%, #B8935A 100%)"
            : "rgba(252,249,244,0.78)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          boxShadow: playing
            ? "0 4px 18px rgba(196,169,106,0.45)"
            : "0 2px 10px rgba(58,56,50,0.14)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 0,
          transition: "background 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease",
        }}
      >
        {playing ? (
          /* Pause icon */
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
            <rect x="1.5" y="1.5" width="3" height="8" rx="1" fill="#fff" />
            <rect x="6.5" y="1.5" width="3" height="8" rx="1" fill="#fff" />
          </svg>
        ) : (
          /* Play icon */
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
            <path d="M2.5 1.8L9.5 5.5L2.5 9.2V1.8Z" fill="#B8935A" />
          </svg>
        )}
      </button>
    </>
  );
}
