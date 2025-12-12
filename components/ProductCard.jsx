"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

export default function ProductCard({ product }) {
  const router = useRouter();

  function saveRecent() {
    if (typeof window === "undefined") return;
    let recent = JSON.parse(localStorage.getItem("recent") || "[]");
    recent = recent.filter((p) => p.id !== product.id);
    recent.unshift({ id: product.id, name: product.name, imageUrl: product.imageUrl });
    if (recent.length > 12) recent = recent.slice(0, 12);
    localStorage.setItem("recent", JSON.stringify(recent));
  }

  function openProduct() {
    saveRecent();
    router.push(`/product/${product.id}`);
  }

  const prices = product.store?.length > 0 ? product.store.map((s) => Number(s.price)) : [];
  const lowest = prices.length ? Math.min(...prices) : null;
  const highest = prices.length ? Math.max(...prices) : null;
  let medium = null;
  if (prices.length >= 3) {
    const sorted = [...prices].sort((a, b) => a - b);
    medium = sorted[Math.floor(sorted.length / 2)];
  } else if (prices.length === 2) {
    medium = Math.round((prices[0] + prices[1]) / 2);
  } else {
    medium = prices[0] || null;
  }

  return (
    <div
      onClick={openProduct}
      style={{
        display: "block",
        width: "92%",
        maxWidth: "420px",
        margin: "0 auto 18px auto",
        background: "linear-gradient(135deg, #e6faff, #e4ffee)",
        borderRadius: "22px",
        padding: "16px",
        boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
        cursor: "pointer",
        transition: "transform 0.2s ease",
      }}
    >
      <div style={{ width: "100%", borderRadius: "16px", overflow: "hidden" }}>
        <Image
          src={product.imageUrl}
          alt={product.name}
          width={500}
          height={350}
          style={{ width: "100%", height: "auto", objectFit: "cover", borderRadius: "16px" }}
        />
      </div>

      <h3 style={{ marginTop: "10px", fontSize: "1.15rem", fontWeight: 700, color: "#0094d9" }}>
        {product.name}
      </h3>

      {lowest !== null ? (
        <div style={{ marginTop: "8px" }} className="shimmer">
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", fontWeight: 700, padding: "6px 8px" }}>
            <span style={{ color: "#0a9d4a" }}>₹{lowest.toLocaleString("en-IN")}</span>
            <span style={{ color: "#0077b6" }}>₹{medium?.toLocaleString("en-IN")}</span>
            <span style={{ color: "#d93742" }}>₹{highest.toLocaleString("en-IN")}</span>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "4px", padding: "0 8px 6px 8px", fontSize: "0.7rem" }}>
            <span className="flip" style={{ background: "#e3f9e8", padding: "2px 6px", borderRadius: "6px", color: "#0a9d4a" }}>Lowest</span>
            <span className="flip" style={{ background: "#e8f4ff", padding: "2px 6px", borderRadius: "6px", color: "#0077b6" }}>Medium</span>
            <span className="flip" style={{ background: "#ffe7e8", padding: "2px 6px", borderRadius: "6px", color: "#d93742" }}>Highest</span>
          </div>
        </div>
      ) : (
        <p style={{ marginTop: "6px", fontSize: "0.9rem", color: "#666" }}>No price data</p>
      )}
    </div>
  );
}
  
