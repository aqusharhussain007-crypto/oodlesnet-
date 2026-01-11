"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
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
  const [detailsOpen, setDetailsOpen] = useState(false);

  const detailsRef = useRef(null);
  const buttonRef = useRef(null);

  const [relatedCategory, setRelatedCategory] = useState([]);
  const [relatedBrand, setRelatedBrand] = useState([]);
  const [relatedPrice, setRelatedPrice] = useState([]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (
        detailsOpen &&
        detailsRef.current &&
        !detailsRef.current.contains(e.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target)
      ) {
        setDetailsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, [detailsOpen]);

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

  function handleShare() {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: `Compare prices for ${product.name}`,
        url,
      });
    } else {
      navigator.clipboard.writeText(url);
      alert("Link copied");
    }
  }

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

        {/* IMAGE + DETAILS */}
        <div
          style={{
            position: "relative",
            borderRadius: 18,
            overflow: "visible",
            background: "#fff",
            boxShadow: "0 6px 18px rgba(0,0,0,0.1)",
            marginBottom: 16,
            aspectRatio: "3 / 4",
          }}
        >
          {/* IMAGE FIRST */}
          <img
            src={product.imageUrl || "/placeholder.png"}
            alt={product.name}
            loading="lazy"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              background: "#fff",
              borderRadius: 18,
            }}
            onError={(e) => {
              e.currentTarget.src = "/placeholder.png";
            }}
          />

          {/* DETAILS BUTTON */}
          <button
            ref={buttonRef}
            onClick={() => setDetailsOpen((v) => !v)}
            style={{
              position: "absolute",
              top: 12,
              right: 12,
              zIndex: 40,
              padding: "8px 14px",
              borderRadius: 999,
              border: "none",
              fontWeight: 800,
              color: "#fff",
              background: "linear-gradient(135deg,#0f4c81,#10b981)",
              boxShadow: "0 6px 14px rgba(0,0,0,0.25)",
            }}
          >
            {detailsOpen ? "Close" : "Details"}
          </button>

          {/* DETAILS PANEL */}
          <div
            ref={detailsRef}
            style={{
              position: "absolute",
              top: 52,
              right: 0,
              width: "85%",
              zIndex: 30,
              background: "#ffffff",
              borderRadius: 16,
              padding: 16,
              boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
              borderLeft: "4px solid #10b981",
              transform: detailsOpen
                ? "translateY(0)"
                : "translateY(-12px)",
              opacity: detailsOpen ? 1 : 0,
              pointerEvents: detailsOpen ? "auto" : "none",
              transition:
                "transform 320ms ease-out, opacity 320ms ease-out",
            }}
          >
            <div style={{ fontSize: 14, color: "#374151" }}>
              {product.description}
            </div>
          </div>
        </div>

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
      </div>
    </>
  );
        }
      
