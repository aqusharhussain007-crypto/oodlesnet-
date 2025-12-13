"use client";

import { useEffect, useRef } from "react";
import ProductCard from "./ProductCard";

export default function InfiniteSlider({ items = [] }) {
  const ref = useRef(null);
  const list = [...items, ...items];

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let raf;
    const loop = () => {
      el.scrollLeft += 0.25; // slow
      if (el.scrollLeft >= el.scrollWidth / 2) el.scrollLeft = 0;
      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
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
        paddingBottom: 10,
        WebkitOverflowScrolling: "touch",
      }}
    >
      {list.map((item, i) => (
        <div key={i} style={{ width: 240, flexShrink: 0 }}>
          <ProductCard product={item} compact />
        </div>
      ))}
    </div>
  );
}
