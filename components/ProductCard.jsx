"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export default function ProductCard({ product }) {
  const [open, setOpen] = useState(false);
  const boxRef = useRef(null);

  const prices =
    product.store
      ?.map((s) => Number(s.price))
      .filter((p) => Number.isFinite(p)) || [];

  const sorted = [...prices].sort((a, b) => a - b);

  const lowest = sorted[0];
  const second = sorted[1];
  const third = sorted[2];

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

  // close when clicking outside description box
  useEffect(() => {
    function handleClickOutside(e) {
      if (boxRef.current && !boxRef.current.contains(e.target)) {
        setOpen(false);
      }
    }

    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <Link
      href={`/product/${product.id}`}
      onClick={saveRecent}
      style={{ textDecoration: "none" }}
    >
      <div
        style={{
          borderRadius: 18,
          padding: 14,
          background: "#ecfffb",
          border: "1px solid #6ee7d8",
          display: "flex",
          flexDirection: "column",
          gap: 12,
          position: "relative",
        }}
      >
        <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
          {/* IMAGE */}
          <div
            style={{
              width: 140,
              height: 170,
              position: "relative",
              borderRadius: 14,
              overflow: "hidden",
              background: "#f3f4f6",
              flexShrink: 0,
            }}
          >
            <img
              src={product.imageUrl || "/placeholder.png"}
              alt={product.name}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                background: "#fff",
              }}
            />
          </div>

          <div style={{ flex: 1 }}>
            <h3
              style={{
                color: "#0077aa",
                fontWeight: 800,
                fontSize: "1rem",
                marginBottom: 6,
                lineHeight: 1.25,
              }}
            >
              {product.name}
            </h3>

            {product.description && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setOpen(true);
                }}
                style={{
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  color: "#0bbcff",
                  background: "none",
                  border: "none",
                  padding: 0,
                  cursor: "pointer",
                }}
              >
                View details ▾
              </button>
            )}
          </div>
        </div>

        {/* DESCRIPTION BOX */}
        {open && (
          <div
            ref={boxRef}
            style={{
              position: "absolute",
              top: 190,
              left: 70,
              right: 12,
              zIndex: 30,
              background: "#ffffff",
              borderRadius: 14,
              boxShadow: "0 15px 35px rgba(0,0,0,0.18)",
              border: "1px solid #e5e7eb",
              padding: 14,
              height: 220,          // ✅ fixed height
              overflow: "hidden",   // ✅ prevents card stretching
            }}
          >
            <div
              style={{
                height: "100%",
                overflowY: "auto",   // ✅ only content scrolls
                fontSize: "0.9rem",
                color: "#374151",
                lineHeight: 1.5,
                paddingRight: 6,
              }}
            >
              {product.description}
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setOpen(false);
              }}
              style={{
                position: "absolute",
                bottom: 8,
                right: 12,
                fontSize: "0.8rem",
                fontWeight: 700,
                color: "#ef4444",
                background: "none",
                border: "none",
                cursor: "pointer",
              }}
            >
              Close ✕
            </button>
          </div>
        )}

        {/* PRICES */}
        <div style={{ display: "flex", gap: 18, paddingLeft: 4 }}>
          {Number.isFinite(lowest) && (
            <div>
              <div style={{ color: "#16a34a", fontWeight: 800 }}>
                ₹{lowest.toLocaleString("en-IN")}
              </div>
              <div style={{ fontSize: 12 }}>Lowest</div>
            </div>
          )}

          {Number.isFinite(second) && (
            <div>
              <div style={{ color: "#2563eb", fontWeight: 700 }}>
                ₹{second.toLocaleString("en-IN")}
              </div>
              <div style={{ fontSize: 12 }}>2nd</div>
            </div>
          )}

          {Number.isFinite(third) && (
            <div>
              <div style={{ color: "#2563eb", fontWeight: 700 }}>
                ₹{third.toLocaleString("en-IN")}
              </div>
              <div style={{ fontSize: 12 }}>3rd</div>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
      }
      
