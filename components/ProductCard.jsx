"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

function Badge({ text, bg, color }) {
  return (
    <span
      style={{
        padding: "4px 10px",
        borderRadius: 999,
        background: bg,
        color,
        fontWeight: 700,
        fontSize: 11,
        whiteSpace: "nowrap",
      }}
    >
      {text}
    </span>
  );
}

export default function ProductCard({ product, compact = false }) {
  const router = useRouter();

  // ------------------------------
  // Save Recently Viewed
  // ------------------------------
  function saveRecent() {
    if (typeof window === "undefined") return;

    let recent = JSON.parse(localStorage.getItem("recent") || "[]");
    recent = recent.filter((p) => p.id !== product.id);
    recent.unshift({
      id: product.id,
      name: product.name,
      imageUrl: product.imageUrl,
    });
    if (recent.length > 12) recent = recent.slice(0, 12);
    localStorage.setItem("recent", JSON.stringify(recent));
  }

  function openProduct() {
    saveRecent();
    router.push(`/product/${product.id}`);
  }

  // ------------------------------
  // Prices
  // ------------------------------
  const prices = product.store?.map((s) => Number(s.price)) || [];
  if (!prices.length) return null;

  const sorted = [...prices].sort((a, b) => a - b);
  const lowest = sorted[0];
  const highest = sorted[sorted.length - 1];
  const medium =
    sorted.length > 2 ? sorted[Math.floor(sorted.length / 2)] : null;

  // ------------------------------
  // CARD
  // ------------------------------
  return (
    <div
      onClick={openProduct}
      style={{
        width: compact ? 220 : "100%",
        minHeight: compact ? 330 : 360,
        borderRadius: 22,

        /* ✅ THIN GRADIENT BORDER */
        background: "linear-gradient(135deg,#00c6ff,#00ff99)",
        padding: "1.5px",

        boxShadow: "0 4px 12px rgba(0,200,255,0.18)",
        cursor: "pointer",
        flexShrink: 0,
      }}
    >
      {/* INNER CARD */}
      <div
        style={{
          background: "#f0fffb",
          borderRadius: 20,
          padding: 12,
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* IMAGE */}
        <div
          style={{
            width: "100%",
            height: 150,
            borderRadius: 14,
            overflow: "hidden",
            background: "#fff",
          }}
        >
          <Image
            src={product.imageUrl}
            alt={product.name}
            width={300}
            height={200}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        </div>

        {/* TITLE (FIXED HEIGHT) */}
        <h3
          style={{
            marginTop: 10,
            fontSize: "0.95rem",
            fontWeight: 700,
            color: "#0077b6",
            lineHeight: "1.25rem",
            height: "2.5rem",
            overflow: "hidden",
          }}
        >
          {product.name}
        </h3>

        {/* PRICE + BADGES (FIXED HEIGHT) */}
        <div style={{ height: 64 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: 6,
              fontWeight: 800,
              fontSize: 14,
            }}
          >
            <span style={{ color: "#16a34a" }}>
              ₹{lowest.toLocaleString("en-IN")}
            </span>

            {medium && (
              <span style={{ color: "#0284c7" }}>
                ₹{medium.toLocaleString("en-IN")}
              </span>
            )}

            <span style={{ color: "#dc2626" }}>
              ₹{highest.toLocaleString("en-IN")}
            </span>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: 6,
            }}
          >
            <Badge text="Lowest" bg="#dcfce7" color="#166534" />
            {medium && (
              <Badge text="Medium" bg="#e0f2fe" color="#075985" />
            )}
            <Badge text="Highest" bg="#fee2e2" color="#7f1d1d" />
          </div>
        </div>
      </div>
    </div>
  );
}
