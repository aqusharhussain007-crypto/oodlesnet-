"use client";
import { useState, useEffect } from "react";

export default function BannerAd({ ads }) {
  if (!ads || ads.length === 0) {
    return (
      <div
        style={{
          width: "100%",
          height: "150px",
          backgroundColor: "#ccc",
          borderRadius: "10px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "black",
          fontSize: "14px",
          border: "2px solid #39FF14",
        }}
      >
        No ads yet
      </div>
    );
  }

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
      style={{
        display: "block",
        width: "100%",
        height: "150px",
        borderRadius: "10px",
        backgroundImage: `url(${ad.imageUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        border: "3px solid #39FF14",
        boxShadow: "0 0 10px #39FF14",
      }}
    ></a>
  );
            }
  
