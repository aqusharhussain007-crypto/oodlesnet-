"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import "./imageSwiper.css"; // we will create this next

export default function ImageSwiper({ images = [] }) {
  const [index, setIndex] = useState(0);
  const startX = useRef(0);
  const swiperRef = useRef(null);
  const lastTap = useRef(0);
  const [zoom, setZoom] = useState(false);

  function handleTouchStart(e) {
    startX.current = e.touches[0].clientX;
  }

  function handleTouchEnd(e) {
    const endX = e.changedTouches[0].clientX;
    const diff = startX.current - endX;

    if (Math.abs(diff) > 40) {
      if (diff > 0 && index < images.length - 1) setIndex(index + 1);
      if (diff < 0 && index > 0) setIndex(index - 1);
    }
  }

  function handleDoubleTap() {
    const now = Date.now();
    if (now - lastTap.current < 300) {
      setZoom((z) => !z);
    }
    lastTap.current = now;
  }

  return (
    <div className={`swiper-container ${zoom ? "zoomed" : ""}`}>
      <div
        className="swiper-inner"
        ref={swiperRef}
        style={{ transform: `translateX(-${index * 100}%)` }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onClick={handleDoubleTap}
      >
        {images.map((img, i) => (
          <div className="swiper-item" key={i}>
            <Image
              src={img}
              width={600}
              height={600}
              alt="product"
              className="swiper-image"
            />
          </div>
        ))}
      </div>

      {/* Dots */}
      <div className="swiper-dots">
        {images.map((_, i) => (
          <div
            key={i}
            className={`dot ${i === index ? "active" : ""}`}
            onClick={() => setIndex(i)}
          />
        ))}
      </div>
    </div>
  );
            }
