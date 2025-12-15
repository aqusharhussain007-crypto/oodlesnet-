"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";

export default function InfiniteSlider({ items = [] }) {
  const rowRef = useRef(null);
  const isTouching = useRef(false);

  // duplicate items for seamless loop
  const list = [...items, ...items];

  useEffect(() => {
    const el = rowRef.current;
    if (!el) return;

    let raf;
    const speed = 0.35; // ⭐ very slow

    function loop() {
      if (!isTouching.current) {
        el.scrollLeft += speed;

        if (el.scrollLeft >= el.scrollWidth / 2) {
          el.scrollLeft = 0;
        }
      }
      raf = requestAnimationFrame(loop);
    }

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div
      ref={rowRef}
      className="slider-row no-scrollbar"
      onTouchStart={() => (isTouching.current = true)}
      onTouchEnd={() => (isTouching.current = false)}
      onMouseEnter={() => (isTouching.current = true)}
      onMouseLeave={() => (isTouching.current = false)}
      style={{
        display: "flex",
        gap: 12,
        overflowX: "auto",
        paddingBottom: 6,
      }}
    >
      {list.map((item, i) => (
        <Link
          key={`${item.id}-${i}`}
          href={`/product/${item.id}`}
          style={{ textDecoration: "none" }}
        >
          <div className="slider-card-frame">
            <div className="slider-card-inner">
              <div className="slider-image-wrap">
                <Image
                  src={item.imageUrl || "/placeholder.png"}
                  alt={item.name || "product"}
                  fill
                  sizes="150px"
                  style={{ objectFit: "cover" }}
                />
              </div>

              <div className="slider-title">
                {item.name}
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
            }
                
