"use client";

import Image from "next/image";
import Link from "next/link";

export default function ProductCard({ product }) {
  if (!product) return null;

  const prices =
    product.store?.map((s) => Number(s.price)).filter(Boolean) || [];

  const lowest = prices.length ? Math.min(...prices) : null;
  const highest = prices.length ? Math.max(...prices) : null;
  const medium =
    prices.length === 3 ? prices.sort((a, b) => a - b)[1] : null;

  return (
    <div
      className="product-card"
      style={{
        borderRadius: 16,
        padding: 12,
        background: "#f6fffd",
        border: "1px solid #9ef0e6",
        boxShadow: "0 6px 16px rgba(0,0,0,0.06)",
      }}
    >
      {/* IMAGE */}
      <Link href={`/product/${product.id}`}>
        <div style={{ borderRadius: 12, overflow: "hidden" }}>
          <Image
            src={product.imageUrl || "/placeholder.png"}
            alt={product.name}
            width={400}
            height={300}
            style={{
              width: "100%",
              height: 180,
              objectFit: "cover",
            }}
          />
        </div>
      </Link>

      {/* TITLE */}
      <h3
        style={{
          fontSize: 15,
          fontWeight: 700,
          marginTop: 10,
          color: "#0077aa",
        }}
      >
        {product.name}
      </h3>

      {/* PRICE ROW */}
      {prices.length > 0 && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 8,
            fontWeight: 800,
          }}
        >
          <span style={{ color: "#1aa64b" }}>
            ₹{lowest?.toLocaleString("en-IN")}
          </span>
          <span style={{ color: "#0077cc" }}>
            ₹{medium?.toLocaleString("en-IN")}
          </span>
          <span style={{ color: "#d9534f" }}>
            ₹{highest?.toLocaleString("en-IN")}
          </span>
        </div>
      )}

      {/* BADGES */}
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

      {/* BUY BUTTONS */}
      <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
        {product.store?.map((s, i) => (
          <a
            key={i}
            href={s.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              textAlign: "center",
              padding: "10px 12px",
              borderRadius: 10,
              fontWeight: 700,
              background:
                s.name === "Amazon"
                  ? "#ff9900"
                  : s.name === "Meesho"
                  ? "#ff4da6"
                  : "#1769ff",
              color: "#fff",
              textDecoration: "none",
            }}
          >
            Buy on {s.name}
          </a>
        ))}
      </div>
    </div>
  );
        }
        
