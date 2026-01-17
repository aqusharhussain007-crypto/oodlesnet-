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

/* =====================================
   DETAILS + TECHNICAL DETAILS (NO MARKETING HEADING)
   ===================================== */
function renderDescription(description, expanded) {
  if (!description) return null;

  const cleaned = description
    .replace(/\s+/g, " ")
    .replace(/\n+/g, "\n")
    .trim();

  let parts = cleaned
    .split(/[\n•]/)
    .map((p) => p.trim())
    .filter(Boolean);

  const bullets = [];
  for (const part of parts) {
    if (part.length < 25 && bullets.length) {
      bullets[bullets.length - 1] += " " + part;
    } else {
      bullets.push(part);
    }
  }

  const specKeywords =
    /(w|mah|gb|tb|mp|hz|inch|cm|mm|kg|motor|battery|camera|display|storage|warranty|voltage|power)/i;

  const details = bullets.filter(
    (b) =>
      b.length > 25 &&
      !specKeywords.test(b)
  );

  const specs = bullets.filter((b) => specKeywords.test(b));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* DETAILS (NO HEADING) */}
      {details.map((d, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            gap: 10,
            fontSize: 15,
            lineHeight: 1.45,
            color: "#374151",
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              marginTop: 7,
              borderRadius: "50%",
              background: "#10b981",
              flexShrink: 0,
            }}
          />
          <span>{d}</span>
        </div>
      ))}

      {/* TECHNICAL DETAILS */}
      {expanded && specs.length > 0 && (
        <>
          <div
            style={{
              marginTop: 6,
              fontWeight: 800,
              fontSize: 15,
              color: "#1d4ed8",
            }}
          >
            Technical details
          </div>

          {specs.map((s, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                gap: 10,
                fontSize: 15,
                lineHeight: 1.45,
                color: "#374151",
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  marginTop: 7,
                  borderRadius: "50%",
                  background: "#2563eb",
                  flexShrink: 0,
                }}
              />
              <span>{s}</span>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

export default function ProductPage({ params }) {
  const { id } = params;
  const router = useRouter();
  const { product, loading } = useProduct(id);

  const [expanded, setExpanded] = useState(false);
  const [openOffer, setOpenOffer] = useState(null);

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

  if (loading)
    return (
      <div style={{ padding: 16, maxWidth: 720, margin: "0 auto" }}>
        <SkeletonLoader height={360} />
        <SkeletonLoader rows={3} height={18} />
        <SkeletonLoader height={220} />
      </div>
    );

  if (!product)
    return <div style={{ padding: 16 }}>Product not found</div>;

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
        {/* IMAGE, TITLE, SHARE — unchanged */}

        {/* DETAILS CARD */}
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
          {renderDescription(product.description, expanded)}
        </div>

        {product.description?.length > 120 && (
          <button
            onClick={() => setExpanded((v) => !v)}
            style={{
              marginTop: 8,
              color: "#0bbcff",
              fontWeight: 700,
              background: "none",
              border: "none",
            }}
          >
            {expanded ? "Show less" : "Read more"}
          </button>
        )}

        {/* EVERYTHING BELOW IS UNCHANGED */}
        {/* Compare Prices, Offers, Related, See All */}
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
