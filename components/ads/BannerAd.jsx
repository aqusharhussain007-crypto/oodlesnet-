"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

export default function BannerAd({ ads = [] }) {
  if (!ads.length) {
    return (
      <div
        style={{
          width: "100%",
          height: 110,
          borderRadius: 14,
          background: "#f4fefe",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 700,
          color: "#0077aa",
          margin: "12px 0",
        }}
      >
        Ad space
      </div>
    );
  }

  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const i = setInterval(
      () => setCurrent((p) => (p + 1) % ads.length),
      5000
    );
    return () => clearInterval(i);
  }, [ads.length]);

  const ad = ads[current];

  return (
    <a
      href={ad.link}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: "block",
        width: "100%",
        margin: "12px 0",
      }}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          height: 110,                 // ✅ smaller height
          borderRadius: 14,
          overflow: "hidden",
          background: "#e9faff",
          border: "1px solid rgba(0,198,255,0.35)", // ✅ thin border
        }}
      >
        <Image
          src={ad.imageUrl}
          alt={ad.title || "Advertisement"}
          fill
          sizes="100vw"
          style={{ objectFit: "cover" }}
          priority={false}
        />
      </div>
    </a>
  );
}
