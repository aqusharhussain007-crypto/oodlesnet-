"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";

export default function InfiniteSlider({ items = [], size = "small" }) {
  const rowRef = useRef(null);

  // duplicate items for infinite feel
  const loopItems = [...items, ...items];

  /* AUTO SCROLL – smooth & infinite */
  useEffect(() => {
    const el = rowRef.current;
    if (!el || items.length === 0) return;

    let rafId;
    const speed = 0.35;

    const step = () => {
      // allow natural vertical scroll — do NOT block
      el.scrollLeft += speed;

      // seamless loop reset
      if (el.scrollLeft >= el.scrollWidth / 2) {
        el.scrollLeft = 0;
      }

      rafId = requestAnimationFrame(step);
    };

    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [items]);

  return (
    <div
      ref={rowRef}
      className="no-scrollbar"
      style={{
        display: "flex",
        gap: 12,
        overflowX: "auto",
        overflowY: "hidden",
        WebkitOverflowScrolling: "touch",
        touchAction: "pan-y pan-x", // ✅ allow vertical + horizontal
        paddingBottom: 6,
      }}
    >
      {loopItems.map((item, i) => (
        <Link
          key={`${item.id}-${i}`}
          href={`/product/${item.id}`}
          style={{ textDecoration: "none", flexShrink: 0 }}
        >
          {/* CARD */}
          <div
            style={{
              width: size === "small" ? 140 : 180,
              borderRadius: 14,
              padding: 2,
              background:
                "linear-gradient(180deg,#00c6ff,#00ff99)",
            }}
          >
            <div
              style={{
                background: "#fff",
                borderRadius: 12,
                padding: 8,
                height: size === "small" ? 200 : 230,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              {/* IMAGE */}
              <div
                style={{
                  width: "100%",
                  height: size === "small" ? 110 : 140,
                  borderRadius: 10,
                  overflow: "hidden",
                  background: "#f2f2f2",
                  position: "relative",
                }}
              >
                <Image
                  src={item.imageUrl || "/placeholder.png"}
                  alt={item.name}
                  fill
                  sizes="150px"
                  style={{ objectFit: "cover" }}
                />
              </div>

              {/* TITLE */}
              <div
                style={{
                  marginTop: 6,
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
      
