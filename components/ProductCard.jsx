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
    prices.length >= 3
      ? prices.sort((a, b) => a - b)[Math.floor(prices.length / 2)]
      : null;

  return (
    <Link
      href={`/product/${product.id}`}
      style={{ textDecoration: "none" }}
    >
      <div
        style={{
          background: "#f6fffc",
          borderRadius: 20,
          padding: 12,
          border: "1.5px solid #6fe7dd",
          boxShadow: "0 8px 20px rgba(0,0,0,0.06)",
        }}
      >
        {/* IMAGE */}
        <div
          style={{
            background: "#eee",
            borderRadius: 14,
            overflow: "hidden",
          }}
        >
          <Image
            src={product.imageUrl || "/placeholder.png"}
            alt={product.name}
            width={400}
            height={300}
            style={{
              width: "100%",
              height: "auto",
              objectFit: "cover",
            }}
          />
        </div>

        {/* NAME */}
        <div
          style={{
            marginTop: 10,
            fontWeight: 700,
            color: "#0077aa",
            fontSize: 15,
          }}
        >
          {product.name || product.brand}
        </div>

        {/* PRICES */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 10,
            fontSize: 14,
            fontWeight: 800,
          }}
        >
          <span style={{ color: "#16a34a" }}>
            ₹{lowest?.toLocaleString("en-IN")}
          </span>
          <span style={{ color: "#2563eb" }}>
            ₹{medium?.toLocaleString("en-IN")}
          </span>
          <span style={{ color: "#dc2626" }}>
            ₹{highest?.toLocaleString("en-IN")}
          </span>
        </div>

        {/* LABELS */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 6,
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          <span style={{ color: "#16a34a" }}>Lowest</span>
          <span style={{ color: "#2563eb" }}>Medium</span>
          <span style={{ color: "#dc2626" }}>Highest</span>
        </div>
      </div>
    </Link>
  );
      }
          
