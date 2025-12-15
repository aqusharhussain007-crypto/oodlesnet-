"use client";
import Image from "next/image";
import { useState, useEffect } from "react";

export default function BannerAd({ ads }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!ads || ads.length === 0) return;
    const t = setInterval(
      () => setCurrent((c) => (c + 1) % ads.length),
      5000
    );
    return () => clearInterval(t);
  }, [ads]);

  if (!ads || ads.length === 0) {
    return (
      <div
        style={{
          width: "100%",
          height: 160,
          borderRadius: 16,
          background: "#e5e7eb",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 700,
        }}
      >
        No ads yet
      </div>
    );
  }

  const ad = ads[current];

  return (
    <a
      href={ad.link}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: "block",
        width: "100%",
        height: 160,
        borderRadius: 16,
        overflow: "hidden",
        position: "relative",   // 🔴 KEY FIX
      }}
    >
      <Image
        src={ad.imageUrl}
        alt="Ad"
        fill
        sizes="100vw"
        style={{ objectFit: "cover" }}
        priority
      />
    </a>
  );
  }
        
