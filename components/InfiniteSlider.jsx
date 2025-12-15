"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";

export default function InfiniteSlider({ items = [] }) {
  const rowRef = useRef(null);

  // duplicate items for infinite effect
  const data = [...items, ...items];

  /* -------- AUTO SCROLL (SLOW & INFINITE) -------- */
  useEffect(() => {
    const el = rowRef.current;
    if (!el) return;

    let raf;
    const speed = 0.35; // 👈 slow speed

    function scroll() {
      el.scrollLeft += speed;

      // reset seamlessly
      if (el.scrollLeft >= el.scrollWidth / 2) {
        el.scrollLeft = 0;
      }
      raf = requestAnimationFrame(scroll);
    }

    raf = requestAnimationFrame(scroll);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div
      ref={rowRef}
      className="slider-row no-scrollbar"
      style={{
        display: "flex",
        gap: 12,
        overflowX: "auto",
        scrollBehavior: "smooth",
      }}
    >
      {data.map((item, i) => (
        <Link
          key={i}
          href={`/product/${item.id}`}
          style={{ textDecoration: "none", flex: "0 0 auto" }}
        >
          {/* OUTER GRADIENT FRAME */}
          <div
            className="slider-card-frame"
            style={{
              padding: 2,               // 👈 thin border
              borderRadius: 16,
              background:
                "linear-gradient(135deg,#00c6ff,#00ff99)",
            }}
          >
            {/* INNER CARD */}
            <div
              className="slider-card-inner"
              style={{
                width: 140,             // 👈 smaller card
                height: 190,
                background: "#fff",
                borderRadius: 14,
                padding: 8,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              {/* IMAGE */}
              <div
                style={{
                  width: "100%",
                  height: 110,
                  borderRadius: 10,
                  overflow: "hidden",
                  background: "#f2f2f2",
                }}
              >
                <Image
                  src={item.imageUrl || "/placeholder.png"}
                  alt={item.name}
                  width={200}
                  height={200}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              </div>

              {/* TITLE */}
              <div
                style={{
                  marginTop: 8,
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  color: "#0077b6",
                  textAlign: "center",
                  lineHeight: 1.2,
                }}
              >
                {item.name}
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
      }
        
