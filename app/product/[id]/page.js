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
   DETAILS CARD – BENEFITS + SPECS
   ===================================== */
function renderDescription(description, expanded) {
  if (!description) return null;

  const rawPoints = description
    .replace(/\n+/g, "\n")
    .split(/[\n•\-–]/)
    .map((p) => p.trim())
    .filter((p) => p.length > 10);

  const specKeywords =
    /(w|mah|gb|tb|mp|hz|inch|cm|mm|kg|motor|battery|camera|display|storage|warranty|voltage|power)/i;

  const specs = [];
  const benefits = [];

  rawPoints.forEach((point) => {
    if (specKeywords.test(point)) specs.push(point);
    else benefits.push(point);
  });

  const visibleBenefits = expanded ? benefits : benefits.slice(0, 3);

  const StarIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="#10b981">
      <path d="M12 17.3l6.18 3.7-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
    </svg>
  );

  const GearIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="#2563eb">
      <path d="M19.14 12.94c.04-.3.06-.61.06-.94s-.02-.64-.06-.94l2.03-1.58a.5.5 0 0 0 .12-.64l-1.92-3.32a.5.5 0 0 0-.6-.22l-2.39.96a7.03 7.03 0 0 0-1.63-.94l-.36-2.54a.5.5 0 0 0-.5-.42h-3.84a.5.5 0 0 0-.5.42l-.36 2.54c-.58.23-1.13.53-1.63.94l-2.39-.96a.5.5 0 0 0-.6.22L2.71 8.84a.5.5 0 0 0 .12.64l2.03 1.58c-.04.3-.06.61-.06.94s.02.64.06.94L2.83 14.52a.5.5 0 0 0-.12.64l1.92 3.32c.13.23.4.32.6.22l2.39-.96c.5.41 1.05.71 1.63.94l.36 2.54c.05.24.26.42.5.42h3.84c.24 0 .45-.18.5-.42l.36-2.54c.58-.23 1.13-.53 1.63-.94l2.39.96c.23.1.5 0 .6-.22l1.92-3.32a.5.5 0 0 0-.12-.64l-2.03-1.58zM12 15.6A3.6 3.6 0 1 1 12 8.4a3.6 3.6 0 0 1 0 7.2z" />
    </svg>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {benefits.length > 0 && (
        <>
          <div style={{ fontWeight: 800, fontSize: 15, color: "#065f46" }}>
            Why you’ll like it
          </div>

          {visibleBenefits.map((b, i) => (
            <div
              key={i}
              style={{ display: "flex", gap: 10, fontSize: 15 }}
            >
              <StarIcon />
              <span>{b}</span>
            </div>
          ))}
        </>
      )}

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
              style={{ display: "flex", gap: 10, fontSize: 15 }}
            >
              <GearIcon />
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
    return <div style={{ padding: 16, color: "red" }}>Product not found</div>;

  const stores = product.store || [];

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
              background: "#fff",
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
              padding: 0,
            }}
          >
            {expanded ? "Show less" : "Read more"}
          </button>
        )}

        <div style={{ height: 16 }} />

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
          {sortedStores.map((store, index) => {
            const offers = Array.isArray(store.offers)
              ? store.offers
              : store.offer
              ? [store.offer]
              : [];

            return (
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
                  {Number(store.price) === cheapest && (
                    <span
                      style={{
                        display: "inline-block",
                        width: 8,
                        height: 8,
                        marginRight: 8,
                        borderRadius: "50%",
                        backgroundColor: "#22c55e",
                        animation: "blink 1.2s infinite",
                      }}
                    />
                  )}
                  Buy on {store.name}
                </button>

                {offers.length > 0 && (
                  <div style={{ marginTop: 10 }}>
                    <button
                      onClick={() =>
                        setOpenOffer(openOffer === index ? null : index)
                      }
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        borderRadius: 12,
                        border: "1px dashed #10b981",
                        background: "#ecfdf5",
                        fontWeight: 700,
                        color: "#065f46",
                      }}
                    >
                      🎁 View available offers
                    </button>

                    <div
                      style={{
                        marginTop: 8,
                        padding: 12,
                        borderRadius: 12,
                        background:
                          openOffer === index ? "#f8fffc" : "#fff",
                        border: "1px solid #e5e7eb",
                        maxHeight:
                          openOffer === index ? 180 : 0,
                        overflowY: "auto",
                        boxShadow:
                          openOffer === index
                            ? "0 10px 24px rgba(0,0,0,0.18)"
                            : "0 4px 10px rgba(0,0,0,0.08)",
                        opacity:
                          openOffer === index ? 1 : 0,
                        transform:
                          openOffer === index
                            ? "translateY(0)"
                            : "translateY(-8px)",
                        transition:
                          "max-height 320ms cubic-bezier(0.16,1,0.3,1), " +
                          "opacity 220ms ease, " +
                          "transform 320ms cubic-bezier(0.16,1,0.3,1), " +
                          "background 220ms ease",
                        pointerEvents:
                          openOffer === index ? "auto" : "none",
                      }}
                    >
                      {offers.map((offer, i) => (
                        <div
                          key={i}
                          style={{
                            marginBottom: 10,
                            fontSize: 14,
                            color: "#374151",
                            lineHeight: 1.4,
                          }}
                        >
                          {typeof offer === "string"
                            ? offer
                            : Object.values(offer).join(" • ")}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* RELATED BY CATEGORY */}
        {relatedCategory.length > 0 && (
          <>
            <h3 className="section-title">
              More in {product.categorySlug}
            </h3>
            <div className="slider-row">
              <div className="flex gap-4 overflow-x-auto no-scrollbar">
                {relatedCategory.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    variant="related"
                  />
                ))}
              </div>
            </div>
          </>
        )}

        {/* RELATED BRAND */}
        {relatedBrand.length > 0 && (
          <>
            <h3 className="section-title">
              More from {product.brand}
            </h3>
            <div className="slider-row">
              <div className="flex gap-4 overflow-x-auto no-scrollbar">
                {relatedBrand.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    variant="related"
                  />
                ))}
              </div>
            </div>
          </>
        )}

        {/* RELATED PRICE */}
        {relatedPrice.length > 0 && (
          <>
            <h3 className="section-title">
              Similar Price Range
            </h3>
            <div className="slider-row">
              <div className="flex gap-4 overflow-x-auto no-scrollbar">
                {relatedPrice.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    variant="related"
                  />
                ))}
              </div>
            </div>
          </>
        )}

        {/* SEE ALL */}
        {product?.categorySlug && (
          <div
            onClick={() =>
              router.push(`/category/${product.categorySlug}`)
            }
            style={{
              marginTop: 28,
              padding: "18px 20px",
              borderRadius: 20,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              fontWeight: 900,
              fontSize: 16,
              color: "#fff",
              cursor: "pointer",
              background: "linear-gradient(135deg,#0099cc,#009966)",
              boxShadow: "0 10px 24px rgba(0,0,0,0.25)",
            }}
          >
            See all in {product.categorySlug}
            <ArrowIcon />
          </div>
        )}
      </div>

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
