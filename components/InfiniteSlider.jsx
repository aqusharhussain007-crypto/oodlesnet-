"use client";

import Image from "next/image";

export default function InfiniteSlider({ items = [], cardStyle = "rounded-img" }) {
  // cardStyle: "rounded-img" (what you chose)
  if (!Array.isArray(items)) items = [];

  return (
    <div style={{ display: "flex", gap: 12, padding: "8px 6px", alignItems: "flex-start" }}>
      {items.map((it) => (
        <a key={it.id} href={`/product/${it.id}`} style={{ minWidth: 140, textDecoration: "none" }}>
          <div className="slider-card-frame">
            <div className="slider-card-inner">
              <div className="slider-image-wrap">
                <Image src={it.imageUrl || "/placeholder.png"} alt={it.name || ""} width={220} height={140} style={{ objectFit: "cover", width: "100%", height: "100%", borderRadius: 12 }} />
              </div>
              <div className="slider-title">{it.name}</div>
            </div>
          </div>
        </a>
      ))}
    </div>
  );
}
