"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useProduct } from "./product-client";

export default function ProductPage({ params }) {
  const { id } = params;
  const { product, loading } = useProduct(id);

  const [expanded, setExpanded] = useState(false);

  if (loading) return <div style={{ padding: 16 }}>Loading…</div>;
  if (!product)
    return <div style={{ padding: 16, color: "red" }}>Product not found</div>;

  const stores = product.store || [];

  const prices = stores
    .map((s) => Number(s.price))
    .filter((p) => Number.isFinite(p));

  const cheapest = prices.length ? Math.min(...prices) : null;

  function handleBuy(store) {
    window.location.href = store.url;
  }

  function handleShare() {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: `Compare prices for ${product.name}`,
        url,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      alert("Link copied");
    }
  }

  return (
    <div
      style={{
        padding: 16,
        paddingBottom: 96,
        maxWidth: 720,
        margin: "0 auto",
      }}
    >
      {/* Breadcrumb */}
      <div style={{ fontSize: 14, marginBottom: 12 }}>
        <Link href="/" style={{ color: "#3b82f6" }}>
          Home
        </Link>{" "}
        /{" "}
        <span style={{ color: "#2563eb", fontWeight: 600 }}>
          {product.categorySlug}
        </span>{" "}
        / <strong>{product.name}</strong>
      </div>

      {/* Image */}
      <div
        style={{
          borderRadius: 18,
          overflow: "hidden",
          background: "#fff",
          boxShadow: "0 6px 18px rgba(0,0,0,0.1)",
          marginBottom: 16,
        }}
      >
        <Image
          src={product.imageUrl}
          alt={product.name}
          width={900}
          height={520}
          style={{ width: "100%", objectFit: "cover" }}
        />
      </div>

      {/* Title + Share */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
        }}
      >
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "#1d4ed8" }}>
          {product.name}
        </h1>

        <button
          onClick={handleShare}
          style={{
            padding: "8px 16px",
            borderRadius: 999,
            border: "none",
            fontWeight: 800,
            color: "#fff",
            background: "linear-gradient(135deg,#0f4c81,#10b981)",
            boxShadow: "0 8px 18px rgba(16,185,129,0.45)",
          }}
        >
          Share
        </button>
      </div>

      {/* Description */}
      <div style={{ marginTop: 12 }}>
        <p
          style={{
            color: "#374151",
            display: "-webkit-box",
            WebkitLineClamp: expanded ? "unset" : 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {product.description}
        </p>

        {product.description?.length > 120 && (
          <button
            onClick={() => setExpanded((v) => !v)}
            style={{
              marginTop: 6,
              color: "#0bbcff",
              fontWeight: 700,
              background: "none",
              border: "none",
              padding: 0,
            }}
          >
            {expanded ? "Show less" : "Read more"}
          </button>
        )}
      </div>

      {/* Compare Prices */}
      <h3
        style={{
          marginTop: 24,
          fontSize: 20,
          fontWeight: 800,
          color: "#2563eb",
        }}
      >
        Compare Prices
      </h3>

      <div
        style={{
          display: "flex",
          gap: 16,
          overflowX: "auto",
          padding: "16px 0",
        }}
      >
        {stores.map((store, index) => (
          <div
            key={index}
            style={{
              minWidth: 260,
              background: "#fff",
              padding: 20,
              borderRadius: 18,
              boxShadow: "0 6px 14px rgba(0,0,0,0.1)",
              border: "1px solid #e5e7eb",
              flexShrink: 0,
            }}
          >
            <div style={{ fontSize: 18, fontWeight: 800 }}>
              {store.name}
            </div>

            {Number.isFinite(Number(store.price)) && (
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 900,
                  margin: "8px 0",
                  color:
                    Number(store.price) === cheapest
                      ? "#16a34a"
                      : "#2563eb",
                }}
              >
                ₹ {Number(store.price).toLocaleString("en-IN")}
              </div>
            )}

            <div
              style={{
                fontSize: 14,
                color: "#6b7280",
                marginBottom: 14,
              }}
            >
              {store.offer}
            </div>

            <button
              onClick={() => handleBuy(store)}
              style={{
                width: "100%",
                padding: "14px 0",
                fontWeight: 800,
                borderRadius: 14,
                border: "none",
                color: "#fff",
                background:
                  store.name.toLowerCase() === "amazon"
                    ? "linear-gradient(90deg,#ff9900,#ff6600)"
                    : store.name.toLowerCase() === "meesho"
                    ? "linear-gradient(90deg,#ff3f8e,#ff77a9)"
                    : store.name.toLowerCase() === "ajio"
                    ? "linear-gradient(90deg,#005bea,#00c6fb)"
                    : "linear-gradient(90deg,#00c6ff,#00ff99)",
                boxShadow: "0 6px 14px rgba(0,0,0,0.25)",
              }}
            >
              Buy on {store.name}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
                       }
    
