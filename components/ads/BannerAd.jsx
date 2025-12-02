"use client";
import { useState, useEffect } from "react";

export default function BannerAd({ ads }) {
  const [current, setCurrent] = useState(0);

  // Auto-rotate ads every 5 seconds
  useEffect(() => {
    if (!ads || ads.length === 0) return;

    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % ads.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [ads]);

  if (!ads || ads.length === 0) return null;

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
