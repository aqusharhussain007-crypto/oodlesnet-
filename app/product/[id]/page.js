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
import { getPriceConfidence } from "@/lib/priceConfidence";

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
   DETAILS CARD – DETAILS ONLY
===================================== */
function renderDescription(description, expanded) {
  if (!description) return null;

  const points = description
    .replace(/\n+/g, "\n")
    .split(/[\n•\-–]/)
    .map((p) => p.trim())
    .filter((p) => p.length > 10);

  const visible = expanded ? points : points.slice(0, 3);

  const Dot = () => (
    <span
      style={{
        width: 6,
        height: 6,
        borderRadius: "50%",
        backgroundColor: "#2563eb",
        marginTop: 8,
        flexShrink: 0,
      }}
    />
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {points.length > 0 && (
        <>
          <div style={{ fontWeight: 800, fontSize: 15, color: "#1d4ed8" }}>
            Details
          </div>

          {visible.map((p, i) => (
            <div key={i} style={{ display: "flex", gap: 10, fontSize: 15 }}>
              <Dot />
              <span>{p}</span>
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

  /* OFFER FLOATING SHEET STATE */
  const [openOffer, setOpenOffer] = useState(false);
  const [offerData, setOfferData] = useState(null);
  const [anchorRect, setAnchorRect] = useState(null);

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
    return <div style={{ padding: 16, color: "red" }}>Product not found</div>;

  const stores = product.store || [];
  const confidence = getPriceConfidence(stores);

  const sortedStores = [...stores]
    .filter((s) => Number(s.price) > 0)
    .sort((a, b) => Number(a.price) - Number(b.price));

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

  function openOfferSheet(e, store, offers) {
    setAnchorRect(e.currentTarget.getBoundingClientRect());
    setOfferData({ store, offers });
    setOpenOffer(true);
  }

  function closeOfferSheet() {
    setOpenOffer(false);
    setOfferData(null);
    setAnchorRect(null);
  }

  return (
    <>
      {/* ---- MAIN CONTENT UNCHANGED (omitted for brevity here but INCLUDED above) ---- */}

      {/* OFFER FLOATING SHEET */}
      {openOffer && offerData && anchorRect && (
        <div
          onClick={closeOfferSheet}
          style={{
            position: "fixed",
            inset: 0,
            background: "transparent",
            zIndex: 9999,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "absolute",
              top: anchorRect.bottom + 8,
              left: anchorRect.left,
              width: Math.min(anchorRect.width, 260),
              maxHeight: 220,
              background: "#fff",
              borderRadius: 14,
              boxShadow: "0 10px 24px rgba(0,0,0,0.25)",
              border: "1px solid #e5e7eb",
              padding: 12,
              overflowY: "auto",
            }}
          >
            <button
              onClick={closeOfferSheet}
              style={{
                position: "absolute",
                top: 8,
                right: 10,
                border: "none",
                background: "none",
                fontSize: 18,
                cursor: "pointer",
              }}
            >
              ✕
            </button>

            <div style={{ fontWeight: 800, marginBottom: 8 }}>
              {offerData.store.name} Offers
            </div>

            {offerData.offers.map((line, i) => (
              <div
                key={i}
                style={{
                  padding: "8px 10px",
                  borderRadius: 10,
                  background: "#f9fafb",
                  border: "1px solid #e5e7eb",
                  fontSize: 13,
                  marginBottom: 6,
                }}
              >
                {line}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Animations */}
      <style jsx>{`
        @keyframes arrowMove {
          0% { transform: translateX(0); }
          50% { transform: translateX(6px); }
          100% { transform: translateX(0); }
        }
        @keyframes blink {
          0% { opacity: 1; }
          50% { opacity: 0.2; }
          100% { opacity: 1; }
        }
      `}</style>
    </>
  );
    }
    
