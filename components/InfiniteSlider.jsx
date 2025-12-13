"use client";

import ProductCard from "./ProductCard";

export default function InfiniteSlider({ items = [] }) {
  // duplicate for infinite loop (already working)
  const loopItems = [...items, ...items];

  return (
    <div
      className="no-scrollbar"
      style={{
        display: "flex",
        overflowX: "auto",
        gap: 12,
        paddingBottom: 8,
        WebkitOverflowScrolling: "touch",
      }}
    >
      {loopItems.map((item, i) => (
        <div
          key={i}
          style={{
            width: 210,          // ✅ FIXED card size
            flexShrink: 0,
          }}
        >
          <ProductCard product={item} />
        </div>
      ))}
    </div>
  );
      }
          
