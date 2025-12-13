"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

export default function ProductCard({ product, compact = false }) {
  const router = useRouter();

  // ------------------------------
  // 🔥 Add to Recently Viewed
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
  // 🔥 Price calculations
  // ------------------------------
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
        display: "block",
        width: compact ? "100%" : "92%",
        maxWidth: compact ? "240px" : "420px",
        margin: compact ? "0" : "0 auto 18px auto",
        background: "linear-gradient(135deg, #e6faff, #e4ffee)",
        borderRadius: "22px",
        padding: "16px",
        boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
        cursor: "pointer",
        transition: "transform 0.2s ease",
      }}
    >
      {/* IMAGE */}
      <div style={{ width: "100%", borderRadius: "16px", overflow: "hidden" }}>
        <Image
          src={product.imageUrl || "/placeholder.png"}
          alt={`${product.name} price comparison`}
          width={500}
          height={350}
          style={{
            width: "100%",
            height: "auto",
            objectFit: "cover",
            borderRadius: "16px",
          }}
        />
      </div>

      {/* NAME */}
      <h3
        style={{
          marginTop: "10px",
          fontSize: "1.05rem",
          fontWeight: 700,
          color: "#0094d9",
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
              marginTop: 8,
              fontWeight: 800,
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
            <span
              style={{
                background: "#dcfce7",
                color: "#166534",
                padding: "4px 8px",
                borderRadius: 8,
              }}
            >
              Lowest
            </span>

            {medium && (
              <span
                style={{
                  background: "#e0f2fe",
                  color: "#075985",
                  padding: "4px 8px",
                  borderRadius: 8,
                }}
              >
                Medium
              </span>
            )}

            <span
              style={{
                background: "#fee2e2",
                color: "#7f1d1d",
                padding: "4px 8px",
                borderRadius: 8,
              }}
            >
              Highest
            </span>
          </div>
        </>
      )}
    </div>
  );
    }
      
