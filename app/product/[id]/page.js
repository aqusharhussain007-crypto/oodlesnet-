"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase-app";
import ProductCard from "@/components/ProductCard";
import {
  excludeProductById,
  filterByPriceRange,
} from "@/lib/productUtils";
import { useProduct } from "./product-client";

export default function ProductPage({ params }) {
  const { id } = params;
  const { product, loading } = useProduct(id);

  const [expanded, setExpanded] = useState(false);

  const [relatedCategory, setRelatedCategory] = useState([]);
  const [relatedBrand, setRelatedBrand] = useState([]);
  const [relatedPrice, setRelatedPrice] = useState([]);

  useEffect(() => {
    if (!product) return;

    async function loadRelated() {
      const snap = await getDocs(collection(db, "products"));
      let all = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      all = excludeProductById(all, product.id);

      const usedIds = new Set([product.id]);

      const categoryItems = all
        .filter(
          (p) =>
            p.categorySlug === product.categorySlug &&
            !usedIds.has(p.id)
        )
        .slice(0, 4);
      categoryItems.forEach((p) => usedIds.add(p.id));
      setRelatedCategory(categoryItems);

      const brandItems = all
        .filter(
          (p) =>
            p.brand === product.brand &&
            !usedIds.has(p.id)
        )
        .slice(0, 4);
      brandItems.forEach((p) => usedIds.add(p.id));
      setRelatedBrand(brandItems);

      const prices =
        product.store
          ?.map((s) => Number(s.price))
          .filter((p) => Number.isFinite(p)) || [];

      if (prices.length) {
        const base = Math.min(...prices);
        const priceItems = filterByPriceRange(
          all.filter((p) => !usedIds.has(p.id)),
          base,
          15
        ).slice(0, 4);
        setRelatedPrice(priceItems);
      }
    }

    loadRelated();
  }, [product]);

  if (loading) return <div style={{ padding: 16 }}>Loading…</div>;
  if (!product)
    return <div style={{ padding: 16, color: "red" }}>Product not found</div>;

  const stores = product.store || [];

  const sortedStores = [...stores].sort(
    (a, b) => Number(a.price) - Number(b.price)
  );

  const prices = sortedStores
    .map((s) => Number(s.price))
    .filter((p) => Number.isFinite(p));

  const cheapest = prices.length ? Math.min(...prices) : null;

  function handleBuy(store) {
    window.location.href = `/out/${store.name.toLowerCase()}?pid=${product.id}`;
  }

  function handleShare() {
    const url = window.location.href;
    if (navigator.share) {
      navigator
        .share({
          title: product.name,
          text: `Compare prices for ${product.name}`,
          url,
        })
        .catch(() => {});
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
        <img
          src={product.imageUrl || "/placeholder.png"}
          alt={product.name}
          loading="lazy"
          referrerPolicy="no-referrer"
          style={{ width: "100%", height: 520, objectFit: "cover" }}
          onError={(e) => {
            e.currentTarget.src = "/placeholder.png";
          }}
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
        {sortedStores.map((store, index) => (
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

      {/* RELATED SECTIONS */}
      {relatedCategory.length > 0 && (
        <>
          <h3 className="section-title">
            More in {product.categorySlug}
          </h3>
          <div className="slider-row">
            <div className="flex gap-4 overflow-x-auto no-scrollbar">
              {relatedCategory.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </>
      )}

      {relatedBrand.length > 0 && (
        <>
          <h3 className="section-title">
            More from {product.brand}
          </h3>
          <div className="slider-row">
            <div className="flex gap-4 overflow-x-auto no-scrollbar">
              {relatedBrand.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </>
      )}

      {relatedPrice.length > 0 && (
        <>
          <h3 className="section-title">
            Similar Price Range
          </h3>
          <div className="slider-row">
            <div className="flex gap-4 overflow-x-auto no-scrollbar">
              {relatedPrice.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
                                  }
    
