"use client";

import SkeletonLoader from "@/components/SkeletonLoader";
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
import { useRouter } from "next/navigation";

/* animated arrow icon ONLY */
const ArrowIcon = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="white"
    strokeWidth="2.5"
    style={{ animation: "arrowMove 1.2s infinite ease-in-out" }}
  >
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="13 6 19 12 13 18" />
  </svg>
);

export default function ProductPage({ params }) {
  const { id } = params;
  const router = useRouter();
  const { product, loading } = useProduct(id);

  const [expanded, setExpanded] = useState(false);

  const [relatedCategory, setRelatedCategory] = useState([]);
  const [relatedBrand, setRelatedBrand] = useState([]);
  const [relatedPrice, setRelatedPrice] = [];

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

  if (loading)
    return (
      <div style={{ padding: 16, maxWidth: 720, margin: "0 auto" }}>
        <SkeletonLoader height={360} />
        <SkeletonLoader rows={3} height={18} />
        <SkeletonLoader height={220} />
      </div>
    );

  if (!product)
    return <div style={{ padding: 16, color: "red" }}>Product not found</div>;

  /* ---------- JSX-ONLY DETAILS FORMATTER ---------- */
  const detailLines =
    product.description?.split("\n").map((l) => l.trim()).filter(Boolean) || [];

  const renderDetails = () =>
    detailLines.map((line, i) => {
      if (line.startsWith("##") || line.endsWith(":")) {
        return (
          <h4
            key={i}
            style={{
              marginTop: 16,
              marginBottom: 6,
              fontWeight: 800,
              color: "#111827",
            }}
          >
            {line.replace("##", "").replace(":", "")}
          </h4>
        );
      }

      return (
        <div
          key={i}
          style={{
            display: "flex",
            gap: 8,
            marginBottom: 6,
            color: "#374151",
            lineHeight: 1.5,
          }}
        >
          <span>•</span>
          <span>{line}</span>
        </div>
      );
    });

  return (
    <>
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

        {/* IMAGE */}
        <div
          style={{
            borderRadius: 18,
            overflow: "hidden",
            background: "#fff",
            boxShadow: "0 6px 18px rgba(0,0,0,0.1)",
            marginBottom: 16,
            aspectRatio: "3 / 4",
          }}
        >
          <img
            src={product.imageUrl || "/placeholder.png"}
            alt={product.name}
            loading="lazy"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
            }}
            onError={(e) => {
              e.currentTarget.src = "/placeholder.png";
            }}
          />
        </div>

        {/* Title */}
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "#1d4ed8" }}>
          {product.name}
        </h1>

        {/* ✅ IMPROVED DETAILS CARD (JSX ONLY) */}
        <div
          style={{
            marginTop: 14,
            padding: 16,
            borderRadius: 16,
            border: "1px solid #e5e7eb",
            background: "#fff",
            maxHeight: expanded ? "unset" : 220,
            overflowY: "auto",
          }}
        >
          {renderDetails()}
        </div>

        {detailLines.length > 8 && (
          <button
            onClick={() => setExpanded((v) => !v)}
            style={{
              marginTop: 8,
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

      <style jsx>{`
        @keyframes arrowMove {
          0% { transform: translateX(0); }
          50% { transform: translateX(6px); }
          100% { transform: translateX(0); }
        }
      `}</style>
    </>
  );
    }
    
