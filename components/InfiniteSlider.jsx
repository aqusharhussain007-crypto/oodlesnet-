"use client";

import ProductCard from "./ProductCard";

export default function InfiniteSlider({ items = [] }) {
  // duplicate items to fake infinite loop
  const loopItems = [...items, ...items];

  return (
    <div
      className="no-scrollbar"
      style={{
        display: "flex",
        overflowX: "auto",
        gap: 12,
        scrollBehavior: "smooth",
      }}
    >
      {loopItems.map((item, i) => (
        <div key={i} style={{ minWidth: 260 }}>
          <ProductCard product={item} />
        </div>
      ))}
    </div>
  );
}
