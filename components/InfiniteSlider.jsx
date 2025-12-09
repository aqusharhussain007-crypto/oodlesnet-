"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";

export default function InfiniteSlider({ items = [] }) {
  const containerRef = useRef(null);
  const isUserTouching = useRef(false);
  const autoScrollTimer = useRef(null);

  // Clone items so we can scroll endlessly without jump
  const doubled = [...items, ...items];

  // --- AUTO SCROLL FUNCTION ---
  function startAutoScroll() {
    stopAutoScroll(); // reset if already running

    autoScrollTimer.current = setInterval(() => {
      if (!containerRef.current || isUserTouching.current) return;

      containerRef.current.scrollLeft += 1.4; // smooth slow movement

      // Reset seamlessly when nearing the end of first copy
      if (
        containerRef.current.scrollLeft >=
        containerRef.current.scrollWidth / 2
      ) {
        containerRef.current.scrollLeft = 0;
      }
    }, 12); // 12ms ≈ smooth 60fps motion
  }

  function stopAutoScroll() {
    if (autoScrollTimer.current) clearInterval(autoScrollTimer.current);
  }

  // --- START AUTO SCROLL ON MOUNT ---
  useEffect(() => {
    startAutoScroll();
    return () => stopAutoScroll();
  }, [items]);

  // --- TOUCH HANDLERS ---
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleTouchStart = () => {
      isUserTouching.current = true;
      stopAutoScroll();
    };

    const handleTouchEnd = () => {
      isUserTouching.current = false;
      startAutoScroll();
    };

    el.addEventListener("touchstart", handleTouchStart);
    el.addEventListener("touchend", handleTouchEnd);

    return () => {
      el.removeEventListener("touchstart", handleTouchStart);
      el.removeEventListener("touchend", handleTouchEnd);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="no-scrollbar"
      style={{
        display: "flex",
        gap: 14,
        overflowX: "auto",
        padding: "6px 2px 14px",
        scrollBehavior: "auto", // IMPORTANT: no smooth scroll, ensures fluid motion
        WebkitOverflowScrolling: "touch",
      }}
    >
      {doubled.map((item, i) => (
        <div
          key={i}
          onClick={() => (window.location = `/product/${item.id}`)}
          style={{
            padding: 2,
            borderRadius: 16,
            background: "linear-gradient(90deg,#00c6ff,#00ff99)",
            cursor: "pointer",
          }}
        >
          <div
            className="mini-card"
            style={{
              width: 150,
              minWidth: 150,
            }}
          >
            <Image
              src={item.imageUrl}
              width={150}
              height={95}
              alt={item.name}
              style={{ borderRadius: 10, objectFit: "cover" }}
            />
            <p className="mini-title">{item.name}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
