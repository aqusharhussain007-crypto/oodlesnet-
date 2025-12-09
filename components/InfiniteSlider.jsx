"use client";
import { useEffect, useRef } from "react";
import Image from "next/image";

export default function InfiniteSlider({ items = [] }) {
  const containerRef = useRef(null);
  const isTouching = useRef(false);
  const timer = useRef(null);

  const doubled = [...items, ...items];

  function start() {
    stop();
    timer.current = setInterval(() => {
      if (!containerRef.current || isTouching.current) return;

      containerRef.current.scrollLeft += 0.6; // 🟢 SLOW & SMOOTH

      if (
        containerRef.current.scrollLeft >=
        containerRef.current.scrollWidth / 2
      ) {
        containerRef.current.scrollLeft = 0;
      }
    }, 10);
  }

  function stop() {
    if (timer.current) clearInterval(timer.current);
  }

  useEffect(() => {
    start();
    return () => stop();
  }, [items]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const down = () => {
      isTouching.current = true;
      stop();
    };
    const up = () => {
      isTouching.current = false;
      start();
    };

    el.addEventListener("touchstart", down);
    el.addEventListener("touchend", up);

    return () => {
      el.removeEventListener("touchstart", down);
      el.removeEventListener("touchend", up);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="no-scrollbar"
      style={{
        display: "flex",
        gap: 14,
        overflowX: "auto",
        padding: "6px 2px 14px",
        scrollBehavior: "auto",
        WebkitOverflowScrolling: "touch",
      }}
    >
      {doubled.map((item, i) => (
        <div
          key={i}
          onClick={() => (window.location = `/product/${item.id}`)}
          style={{
            padding: 2,
            borderRadius: 16,
            background: "linear-gradient(90deg,#00c6ff,#00ff99)",
            cursor: "pointer",
          }}
        >
          <div className="mini-card">
            <Image
              src={item.imageUrl}
              width={150}
              height={95}
              alt={item.name}
              style={{ borderRadius: 10, objectFit: "cover" }}
            />
            <p className="mini-title">{item.name}</p>
          </div>
        </div>
      ))}
    </div>
  );
            }
