"use client";

import Image from "next/image";
import Link from "next/link";

export default function ProductCard({ product }) {
  const prices = product.store?.map((s) => Number(s.price)) || [];
  const lowest = Math.min(...prices);
  const highest = Math.max(...prices);
  const medium = prices[Math.floor(prices.length / 2)] || lowest;

  // ✅ ADD: save to Recently Viewed
  function saveRecent() {
    if (typeof window === "undefined") return;

    let recent = JSON.parse(localStorage.getItem("recent") || "[]");

    // remove duplicate
    recent = recent.filter((p) => p.id !== product.id);

    // add to top
    recent.unshift({
      id: product.id,
      name: product.name,
      imageUrl: product.imageUrl,
      store: product.store || [],
    });

    // limit to 10
    if (recent.length > 10) recent = recent.slice(0, 10);

    localStorage.setItem("recent", JSON.stringify(recent));
  }

  return (
    <Link
      href={`/product/${product.id}`}
      onClick={saveRecent}   // ✅ IMPORTANT
      style={{ textDecoration: "none" }}
    >
      <div
        style={{
          borderRadius: 18,
          padding: 12,
          background: "#ecfffb",
          border: "1px solid #6ee7d8",
        }}
      >
        {/* ⭐ FIXED IMAGE WRAPPER */}
        <div
          style={{
            width: "100%",
            height: 180,
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
            sizes="100%"
            style={{ objectFit: "cover" }}
          />
        </div>

        {/* NAME */}
        <h3 style={{ color: "#0077aa", margin: "10px 0", fontWeight: 700 }}>
          {product.name}
        </h3>

        {/* PRICES */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 4,
          }}
        >
          <span style={{ color: "#16a34a", fontWeight: 700 }}>
            ₹{lowest.toLocaleString("en-IN")}
          </span>

          <span style={{ color: "#2563eb", fontWeight: 700 }}>
            ₹{medium.toLocaleString("en-IN")}
          </span>

          <span style={{ color: "#dc2626", fontWeight: 700 }}>
            ₹{highest.toLocaleString("en-IN")}
          </span>
        </div>

        {/* LABELS */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 6,
          }}
        >
          <span className="pill green">Lowest</span>
          <span className="pill blue">Medium</span>
          <span className="pill red">Highest</span>
        </div>
      </div>
    </Link>
  );
          }
              
