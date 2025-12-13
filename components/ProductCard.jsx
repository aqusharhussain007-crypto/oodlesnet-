"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

export default function ProductCard({ product, compact = false }) {
  const router = useRouter();

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

  // prices
  const prices = product.store?.map((s) => Number(s.price)) || [];
  const lowest = prices.length ? Math.min(...prices) : null;
  const highest = prices.length ? Math.max(...prices) : null;
  const medium =
    prices.length >= 3
      ? [...prices].sort((a, b) => a - b)[1]
      : prices.length === 2
      ? Math.round((prices[0] + prices[1]) / 2)
      : null;

  return (
    <div
      onClick={openProduct}
      style={{
        width: "100%",
        maxWidth: compact ? 240 : 420,
        margin: compact ? 0 : "0 auto 18px auto",
        minHeight: compact ? 360 : "auto", // 🔥 FIX HEIGHT
        background: "linear-gradient(135deg, #e6faff, #e4ffee)",
        borderRadius: 22,
        padding: 14,
        boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* IMAGE (LOCKED HEIGHT) */}
      <div
        style={{
          width: "100%",
          height: compact ? 150 : "auto", // 🔥 FIX IMAGE HEIGHT
          borderRadius: 16,
          overflow: "hidden",
          background: "#f1f5f9",
        }}
      >
        <Image
          src={product.imageUrl || "/placeholder.png"}
          alt={`${product.name} price comparison`}
          width={500}
          height={350}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      </div>

      {/* NAME (2 LINE CLAMP) */}
      <h3
        style={{
          marginTop: 10,
          fontSize: "1rem",
          fontWeight: 700,
          color: "#0094d9",
          display: "-webkit-box",
          WebkitLineClamp: 2,          // 🔥 FIX
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
          minHeight: 44,               // 🔥 FIX
        }}
      >
        {product.name}
      </h3>

      {/* PRICES */}
      {lowest != null && (
        <>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: 6,
              fontWeight: 800,
              fontSize: 14,
            }}
          >
            <span style={{ color: "#16a34a" }}>₹{lowest}</span>
            {medium && <span style={{ color: "#0284c7" }}>₹{medium}</span>}
            <span style={{ color: "#dc2626" }}>₹{highest}</span>
          </div>

          {/* BADGES */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: 6,
              fontSize: 12,
            }}
          >
            <span style={badge("green")}>Lowest</span>
            {medium && <span style={badge("blue")}>Medium</span>}
            <span style={badge("red")}>Highest</span>
          </div>
        </>
      )}
    </div>
  );
}

function badge(type) {
  const map = {
    green: { bg: "#dcfce7", color: "#166534" },
    blue: { bg: "#e0f2fe", color: "#075985" },
    red: { bg: "#fee2e2", color: "#7f1d1d" },
  };
  return {
    background: map[type].bg,
    color: map[type].color,
    padding: "4px 8px",
    borderRadius: 8,
    fontWeight: 600,
  };
      }
  
