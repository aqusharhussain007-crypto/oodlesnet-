"use client";

import { useEffect, useRef } from "react";
import ProductCard from "./ProductCard";

export default function InfiniteSlider({ items = [] }) {
  const sliderRef = useRef(null);

  // Duplicate items for infinite illusion
  const loopItems = [...items, ...items];

  // Slow infinite auto-scroll
  useEffect(() => {
    const el = sliderRef.current;
    if (!el) return;

    let animation;

    const scroll = () => {
      el.scrollLeft += 0.35; // 🔥 very slow speed

      // Reset seamlessly at halfway
      if (el.scrollLeft >= el.scrollWidth / 2) {
        el.scrollLeft = 0;
      }

      animation = requestAnimationFrame(scroll);
    };

    animation = requestAnimationFrame(scroll);

    return () => cancelAnimationFrame(animation);
  }, []);

  return (
    <div
      ref={sliderRef}
      className="no-scrollbar"
      style={{
        display: "flex",
        overflowX: "auto",
        gap: 14,
        paddingBottom: 6,
        WebkitOverflowScrolling: "touch",
      }}
    >
      {loopItems.map((item, i) => (
        <div
          key={i}
          style={{
            minWidth: 220,     // ✅ fixed card width
            maxWidth: 220,
            flexShrink: 0,
          }}
        >
          <ProductCard product={item} />
        </div>
      ))}
    </div>
  );
}
