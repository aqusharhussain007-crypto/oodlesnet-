"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export default function ProductCard({ product }) {
  const [open, setOpen] = useState(false);
  const boxRef = useRef(null);
  const btnRef = useRef(null);

  const prices =
    product.store
      ?.map((s) => Number(s.price))
      .filter((p) => Number.isFinite(p)) || [];

  const sorted = [...prices].sort((a, b) => a - b);
  const [lowest, second, third] = sorted;

  function saveRecent() {
    if (typeof window === "undefined") return;
    let recent = JSON.parse(localStorage.getItem("recent") || "[]");
    recent = recent.filter((p) => p.id !== product.id);
    recent.unshift({
      id: product.id,
      name: product.name,
      imageUrl: product.imageUrl,
      store: product.store || [],
    });
    if (recent.length > 10) recent = recent.slice(0, 10);
    localStorage.setItem("recent", JSON.stringify(recent));
  }

  /* OUTSIDE CLICK CLOSE */
  useEffect(() => {
    function handleOutside(e) {
      if (
        open &&
        boxRef.current &&
        !boxRef.current.contains(e.target) &&
        btnRef.current &&
        !btnRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [open]);

  /* ESC CLOSE */
  useEffect(() => {
    function handleEsc(e) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [open]);

  return (
    <div style={{ position: "relative" }}>
      <Link
        href={`/product/${product.id}`}
        onClick={saveRecent}
        style={{ textDecoration: "none" }}
      >
        <div
          style={{
            width: 165,
            borderRadius: 16,
            padding: 12,
            background: "#ecfffb",
            border: "1px solid #6ee7d8",
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          {/* DETAILS BUTTON */}
          {product.description && (
            <button
              ref={btnRef}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setOpen((v) => !v);
              }}
              style={{
                position: "absolute",
                top: 8,
                right: 8,
                zIndex: 20,
                padding: "4px 10px",
                borderRadius: 999,
                border: "none",
                fontSize: 11,
                fontWeight: 800,
                color: "#fff",
                background: "linear-gradient(135deg,#0f4c81,#10b981)",
                boxShadow: "0 4px 10px rgba(0,0,0,0.25)",
              }}
            >
              {open ? "Close" : "Details"}
            </button>
          )}

          {/* IMAGE */}
          <div
            style={{
              width: "100%",
              height: 125,
              borderRadius: 14,
              overflow: "hidden",
              background: "#f3f4f6",
              position: "relative",
            }}
          >
            <Image
              src={product.imageUrl || "/placeholder.png"}
              alt={product.name}
              fill
              sizes="160px"
              loading="lazy"
              style={{ objectFit: "contain", background: "#fff" }}
            />
          </div>

          {/* NAME */}
          <h3
            style={{
              color: "#0077aa",
              fontWeight: 800,
              fontSize: 14,
              lineHeight: 1.25,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              minHeight: 36,
            }}
          >
            {product.name}
          </h3>

          {/* PRICES */}
          <div style={{ display: "flex", gap: 12 }}>
            {Number.isFinite(lowest) && (
              <div>
                <div style={{ color: "#16a34a", fontWeight: 800, fontSize: 14 }}>
                  ₹{lowest.toLocaleString("en-IN")}
                </div>
                <div style={{ fontSize: 11 }}>Lowest</div>
              </div>
            )}
            {Number.isFinite(second) && (
              <div>
                <div style={{ color: "#2563eb", fontWeight: 700, fontSize: 13 }}>
                  ₹{second.toLocaleString("en-IN")}
                </div>
                <div style={{ fontSize: 11 }}>2nd</div>
              </div>
            )}
            {Number.isFinite(third) && (
              <div>
                <div style={{ color: "#2563eb", fontWeight: 700, fontSize: 13 }}>
                  ₹{third.toLocaleString("en-IN")}
                </div>
                <div style={{ fontSize: 11 }}>3rd</div>
              </div>
            )}
          </div>
        </div>
      </Link>

      {/* DETAILS PANEL */}
      <div
        ref={boxRef}
        style={{
          position: "absolute",
          top: 44,
          right: 0,
          width: "92%",
          zIndex: 30,
          background: "#fff",
          borderRadius: 16,
          padding: 14,
          boxShadow: "0 12px 30px rgba(0,0,0,0.25)",
          borderLeft: "4px solid #10b981",
          transform: open ? "translateY(0)" : "translateY(-10px)",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
          transition: "all 300ms ease-out",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            maxHeight: 160,
            overflowY: "auto",
            fontSize: 13,
            color: "#374151",
            lineHeight: 1.45,
            paddingRight: 6,
          }}
        >
          {product.description}
        </div>
      </div>
    </div>
  );
}
