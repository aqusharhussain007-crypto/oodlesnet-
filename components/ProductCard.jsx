"use client";

import Image from "next/image";
import Link from "next/link";

export default function ProductCard({ product }) {
  // extract & sort prices safely
  const prices =
    product.store?.map((s) => Number(s.price)).filter(Boolean) || [];

  const sorted = [...prices].sort((a, b) => a - b);
  const lowest = sorted[0];
  const second = sorted[1];
  const third = sorted[2];

  // save to Recently Viewed
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

  return (
    <Link
      href={`/product/${product.id}`}
      onClick={saveRecent}
      style={{ textDecoration: "none" }}
    >
      <div
        style={{
          display: "flex",
          gap: 14,
          borderRadius: 18,
          padding: 12,
          background: "#ecfffb",
          border: "1px solid #6ee7d8",
          alignItems: "stretch",
        }}
      >
        {/* LEFT: IMAGE */}
        <div
          style={{
            width: 120,
            minWidth: 120,
            height: 120,
            position: "relative",
            borderRadius: 14,
            overflow: "hidden",
            background: "#f3f4f6",
          }}
        >
          <Image
            src={product.imageUrl || "/placeholder.png"}
            alt={product.name}
            fill
            sizes="120px"
            style={{ objectFit: "cover" }}
          />
        </div>

        {/* RIGHT: DETAILS */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          {/* NAME */}
          <h3
            style={{
              color: "#0077aa",
              fontWeight: 700,
              fontSize: "1rem",
              lineHeight: 1.3,
              marginBottom: 6,
            }}
          >
            {product.name}
          </h3>

          {/* DESCRIPTION (short) */}
          {product.description && (
            <div
              style={{
                fontSize: "0.85rem",
                color: "#334155",
                lineHeight: 1.4,
                marginBottom: 8,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {product.description}
            </div>
          )}

          {/* PRICES */}
          <div
            style={{
              display: "flex",
              gap: 14,
              marginTop: "auto",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            {lowest !== undefined && (
              <span style={{ color: "#16a34a", fontWeight: 800 }}>
                ₹{lowest.toLocaleString("en-IN")}
              </span>
            )}

            {second !== undefined && (
              <span style={{ color: "#2563eb", fontWeight: 700 }}>
                ₹{second.toLocaleString("en-IN")}
              </span>
            )}

            {third !== undefined && (
              <span style={{ color: "#2563eb", fontWeight: 700 }}>
                ₹{third.toLocaleString("en-IN")}
              </span>
            )}
          </div>

          {/* LABELS */}
          <div
            style={{
              display: "flex",
              gap: 14,
              marginTop: 4,
              fontSize: 11,
              fontWeight: 700,
            }}
          >
            {lowest !== undefined && (
              <span style={{ color: "#16a34a" }}>Lowest</span>
            )}
            {second !== undefined && (
              <span style={{ color: "#2563eb" }}>2nd</span>
            )}
            {third !== undefined && (
              <span style={{ color: "#2563eb" }}>3rd</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
            }
          
