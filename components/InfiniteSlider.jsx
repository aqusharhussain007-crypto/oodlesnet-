"use client";

import { useEffect, useRef } from "react";
import ProductCard from "./ProductCard";

export default function InfiniteSlider({ items = [] }) {
  const ref = useRef(null);

  // duplicate for infinite loop
  const loopItems = [...items, ...items];

  // slow infinite auto scroll
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let raf;
    const scroll = () => {
      el.scrollLeft += 0.3; // very slow

      if (el.scrollLeft >= el.scrollWidth / 2) {
        el.scrollLeft = 0;
      }
      raf = requestAnimationFrame(scroll);
    };

    raf = requestAnimationFrame(scroll);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div
      ref={ref}
      className="no-scrollbar"
      style={{
        display: "flex",
        gap: 14,
        overflowX: "auto",
        WebkitOverflowScrolling: "touch",
        paddingBottom: 10,
      }}
    >
      {loopItems.map((item, i) => (
        <div
          key={i}
          style={{
            width: 240,          // ✅ FORCE SAME CARD WIDTH
            flexShrink: 0,
          }}
        >
          {/* inner wrapper fixes height illusion */}
          <div style={{ width: "100%" }}>
            <ProductCard product={item} compact />
          </div>
        </div>
      ))}
    </div>
  );
          }
