"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

export default function ProductCard({ product, compact = false }) {
  const router = useRouter();

  // ------------------------------
  // Save to Recently Viewed
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
  // Price helpers
  // ------------------------------
  const prices = product.store?.map((s) => Number(s.price)) || [];
  const lowest = prices.length ? Math.min(...prices) : null;
  const highest = prices.length ? Math.max(...prices) : null;
  const medium =
    prices.length >= 2
      ? prices.slice().sort((a, b) => a - b)[Math.floor(prices.length / 2)]
      : null;

  return (
    <div
      onClick={openProduct}
      style={{
        width: compact ? 220 : "100%",
        maxWidth: compact ? 220 : 420,
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
          flex: 1, // ✅ IMPORTANT: prevents thick bottom block
        }}
      >
        {/* IMAGE */}
        <div
          style={{
            width: "100%",
            aspectRatio: "4 / 3",
            borderRadius: 14,
            overflow: "hidden",
            background: "#fff",
          }}
        >
          <Image
            src={product.imageUrl || "/placeholder.png"}
            alt={product.name}
            width={400}
            height={300}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>

        {/* NAME */}
        <div
          style={{
            marginTop: 8,
            fontWeight: 700,
            fontSize: compact ? 14 : 16,
            color: "#0077b6",
            lineHeight: 1.3,
          }}
        >
          {product.name}
        </div>

        {/* PRICES */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 6,
            fontWeight: 700,
            fontSize: 14,
          }}
        >
          <div className="flex gap-2 mt-2">
  <span className="px-3 py-1 text-xs rounded-full bg-green-100 text-green-700 font-semibold">
    Lowest
  </span>
  <span className="px-3 py-1 text-xs rounded-full bg-blue-100 text-blue-700 font-semibold">
    Medium
  </span>
  <span className="px-3 py-1 text-xs rounded-full bg-red-100 text-red-700 font-semibold">
    Highest
  </span>
</div>

        {/* BADGES */}
        <div
          style={{
            display: "flex",
            gap: 6,
            marginTop: 6,
            flexWrap: "wrap",
          }}
        >
          {lowest !== null && (
            <span className="badge badge-low">Lowest</span>
          )}
          {medium !== null && (
            <span className="badge badge-mid">Medium</span>
          )}
          {highest !== null && (
            <span className="badge badge-high">Highest</span>
          )}
        </div>
      </div>
    </div>
  );
        }
            
