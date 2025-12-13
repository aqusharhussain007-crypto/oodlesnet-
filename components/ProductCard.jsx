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
        maxWidth: compact ? 220 : 420,
        margin: compact ? 0 : "0 auto 18px auto",
        borderRadius: 22,

        /* thin gradient border */
        background: "linear-gradient(135deg,#00c6ff,#00ff99)",
        padding: "1.5px",
        boxShadow: "0 4px 12px rgba(0,200,255,0.18)",
        cursor: "pointer",
      }}
    >
      {/* INNER CARD */}
      <div
        style={{
          background: "#f0fffb",
          borderRadius: 20,
          padding: 12,
        }}
      >
        {/* IMAGE */}
        <div
          style={{
            height: compact ? 135 : 180,
            borderRadius: 16,
            overflow: "hidden",
            background: "#e6faff",
          }}
        >
          <Image
            src={product.imageUrl || "/placeholder.png"}
            alt={product.name}
            width={500}
            height={350}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        </div>

        {/* NAME */}
        <h3
  style={{
    marginTop: 10,
    fontSize: "0.95rem",
    fontWeight: 700,
    color: "#0077b6",
    lineHeight: "1.25rem",
    height: "2.5rem",        // ✅ FIX
    overflow: "hidden",
  }}
>
  {product.name}
</h3>

        {/* PRICES */}
        
        {lowest != null && (
  <div style={{ height: 64 }}>   {/* ✅ FIX */}
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

    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        marginTop: 6,
        fontSize: 11,
      }}
    >
      <Badge text="Lowest" bg="#dcfce7" color="#166534" />
      {medium && <Badge text="Medium" bg="#e0f2fe" color="#075985" />}
      <Badge text="Highest" bg="#fee2e2" color="#7f1d1d" />
    </div>
  </div>
)}
function Badge({ text, bg, color }) {
  return (
    <span
      style={{
        background: bg,
        color,
        padding: "3px 8px",
        borderRadius: 8,
        fontWeight: 600,
      }}
    >
      {text}
    </span>
  );
        }
        
