"use client";
import { useState, useEffect } from "react";

export default function BannerAd({ ads }) {
  // TEMPORARY DEBUG: Show ads length
  if (!ads) {
    return (
      <div style={{
        background: "red",
        color: "white",
        padding: "10px",
        textAlign: "center",
        borderRadius: "8px"
      }}>
        ❌ ads is undefined
      </div>
    );
  }

  if (ads.length === 0) {
    return (
      <div style={{
        background: "orange",
        color: "black",
        padding: "10px",
        textAlign: "center",
        borderRadius: "8px"
      }}>
        ⚠️ No ads found (ads.length = 0)
      </div>
    );
  }

  // If ads exist, show rotating banner
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % ads.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [ads.length]);

  const ad = ads[current];

  return (
    <a
      href={ad.link}
      target="_blank"
      className="block w-full h-36 rounded-lg border-2 border-[#39FF14] shadow-lg hover:opacity-80 transition-all duration-300"
      style={{
        backgroundImage: `url(${ad.imageUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    ></a>
  );
}
