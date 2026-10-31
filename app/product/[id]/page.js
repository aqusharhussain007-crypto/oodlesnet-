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
  const [openOffer, setOpenOffer] = useState(null);
  const [loadingStore, setLoadingStore] = useState("");
  const [loadingCategory, setLoadingCategory] = useState(false);

  const [relatedCategory, setRelatedCategory] = useState([]);
  const [relatedBrand, setRelatedBrand] = useState([]);
  const [relatedPrice, setRelatedPrice] = useState([]);

  useEffect(() => {
    if (!product) return;

    async function loadRelated() {
      try {
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
  all.filter(
    (p) =>
      !usedIds.has(p.id) &&
      p.categorySlug === product.categorySlug
  ),
  base,
  15
).slice(0, 4);
        
          setRelatedPrice(priceItems);
        }
      } catch (error) {
        console.error("Failed to load related products:", error);
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
    .filter((s) => Number.isFinite(Number(s.price)) && Number(s.price) > 0)
    .sort((a, b) => Number(a.price) - Number(b.price));

  const prices = sortedStores
    .map((s) => Number(s.price))
    .filter((p) => Number.isFinite(p));

  const cheapest = prices.length ? Math.min(...prices) : null;

  function handleBuy(store) {
    if (loadingStore) return;
    setLoadingStore(store.name);
    window.setTimeout(() => {
      window.location.href = `/out/${store.name.toLowerCase()}?pid=${product.id}`;
    }, 180);
  }

  function getStoreMark(name) {
    const key = String(name || "").toLowerCase();
    if (key.includes("flipkart")) return "F";
    if (key.includes("amazon")) return "a";
    if (key.includes("boat")) return "boAt";
    if (key.includes("meesho")) return "M";
    if (key.includes("ajio")) return "AJ";
    if (key.includes("croma")) return "C";
    return String(name || "S").slice(0, 2).toUpperCase();
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
      <div style={{ padding: 16, paddingBottom: 96, maxWidth: 720, margin: "0 auto" }}>
        {/* Breadcrumb */}
        <div style={{ fontSize: 14, marginBottom: 12 }}>
          <Link href="/" style={{ color: "#3b82f6" }}>Home</Link> /{" "}
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
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
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

        {/* BUYING CONFIDENCE */}
        <section style={{ marginTop: 10 }}>
          <strong>{confidence.title}</strong>
          <p style={{ fontSize: 14, color: "#555", marginTop: 4 }}>
            {confidence.message}
          </p>
        </section>

        {/* DETAILS */}
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

        {/* Compare Prices */}
        <h3 style={{ marginTop: 24, fontSize: 20, fontWeight: 800, color: "#2563eb" }}>
          Compare Prices
        </h3>

        <div style={{ display: "flex", gap: 16, overflowX: "auto", padding: "16px 0" }}>
          {sortedStores.map((store, index) => {
            const rawOffers = Array.isArray(store.offers)
              ? store.offers
              : store.offer
              ? [store.offer]
              : [];

            const normalizeOffers = (offer) => {
              if (Array.isArray(offer)) return offer;

              if (typeof offer === "string") {
                return offer
                  .replace(/•/g, "|")
                  .replace(/Save upto/g, "|Save upto")
                  .replace(/Exchange/g, "|Exchange")
                  .replace(/Add/g, "|Add")
                  .replace(/Amazon/g, "|Amazon")
                  .split("|")
                  .map((s) => s.trim())
                  .filter(Boolean);
              }

              if (typeof offer === "object") {
                return Object.values(offer)
                  .map((s) => String(s).trim())
                  .filter(Boolean);
              }

              return [];
            };

            const offers = rawOffers.flatMap(normalizeOffers);

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
                  
                {/* CONSTRAINED ACTION COLUMN */}
                <div
                  style={{
                    maxWidth: 220,
                    margin: "0 auto",
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                  }}
                >
                  {/* BUY BUTTON */}
                  <button
                    type="button"
                    disabled={Boolean(loadingStore)}
                    onClick={() => handleBuy(store)}
                    aria-label={loadingStore === store.name ? `Redirecting to ${store.name}` : `Buy on ${store.name}`}
                    style={{
                      width: "100%",
                      minHeight: 58,
                      padding: "8px 10px",
                      display: "flex",
                      alignItems: "center",
                      gap: 9,
                      borderRadius: 16,
                      border: "1px solid rgba(91, 174, 255, 0.72)",
                      color: "#f4fffe",
                      background: "linear-gradient(115deg, rgba(5, 24, 55, 0.98), rgba(0, 74, 145, 0.94))",
                      boxShadow: "0 0 0 1px rgba(0,198,255,0.12), 0 7px 20px rgba(0,105,255,0.24), inset 0 1px 0 rgba(255,255,255,0.18)",
                      backdropFilter: "blur(12px)",
                      WebkitBackdropFilter: "blur(12px)",
                      cursor: loadingStore ? "wait" : "pointer",
                      opacity: loadingStore && loadingStore !== store.name ? 0.65 : 1,
                      transition: "transform 180ms ease, box-shadow 180ms ease, opacity 180ms ease",
                    }}
                  >
                    <span
                      aria-hidden="true"
                      style={{
                        width: 34,
                        height: 34,
                        flexShrink: 0,
                        display: "grid",
                        placeItems: "center",
                        borderRadius: 11,
                        color: store.name.toLowerCase().includes("flipkart") ? "#1769e8" : store.name.toLowerCase().includes("amazon") ? "#111827" : "#00a982",
                        background: "linear-gradient(145deg, #ffffff, #dceff1)",
                        fontSize: getStoreMark(store.name) === "boAt" ? 10 : 16,
                        fontWeight: 900,
                        letterSpacing: "-0.5px",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.22)",
                      }}
                    >
                      {getStoreMark(store.name)}
                    </span>
                    <span style={{ flex: 1, minWidth: 0, textAlign: "center", fontSize: 14, fontWeight: 800, letterSpacing: 0.1 }}>
                      {loadingStore === store.name ? "Redirecting…" : `Buy on ${store.name}`}
                    </span>
                    <span
                      aria-hidden="true"
                      style={{
                        width: 34,
                        height: 34,
                        flexShrink: 0,
                        display: "grid",
                        placeItems: "center",
                        borderRadius: "50%",
                        border: "1px solid rgba(115,190,255,0.78)",
                        background: "linear-gradient(145deg, rgba(0,145,255,0.32), rgba(35,105,255,0.24))",
                        boxShadow: "0 0 12px rgba(0,145,255,0.3)",
                      }}
                    >
                      {loadingStore === store.name ? (
                        <span className="button-spinner" />
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M5 12h14M13 6l6 6-6 6" />
                        </svg>
                      )}
                    </span>
                  </button>

                  {offers.length > 0 && (
                    <>
                      {/* VIEW OFFERS */}
                      <button
                        type="button"
                        aria-expanded={openOffer?.index === index}
                        onClick={(event) => {
                          if (openOffer?.index === index) {
                            setOpenOffer(null);
                            return;
                          }
                          const rect = event.currentTarget.getBoundingClientRect();
                          setOpenOffer({
                            index,
                            offers,
                            top: rect.bottom + 8,
                            left: Math.max(12, Math.min(rect.left, window.innerWidth - rect.width - 12)),
                            width: rect.width,
                            maxHeight: Math.max(100, Math.min(260, window.innerHeight - rect.bottom - 24)),
                          });
                        }}
                        style={{
                          width: "100%",
                          minHeight: 58,
                          padding: "9px 11px",
                          borderRadius: 15,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 9,
                          border: "1px solid rgba(52,211,170,0.78)",
                          background: "linear-gradient(115deg, rgba(5,45,48,0.98), rgba(0,112,100,0.95))",
                          color: "#f4f9ff",
                          fontWeight: 800,
                          fontSize: 13,
                          textAlign: "left",
                          boxShadow: "0 0 0 1px rgba(20,184,140,0.14), 0 6px 16px rgba(0,170,135,0.2), inset 0 1px 0 rgba(255,255,255,0.16)",
                          cursor: "pointer",
                          transition: "transform 180ms ease, box-shadow 180ms ease",
                        }}
                      >
                        <span
                          aria-hidden="true"
                          style={{
                            width: 34,
                            height: 34,
                            flexShrink: 0,
                            display: "grid",
                            placeItems: "center",
                            borderRadius: 11,
                            background: "linear-gradient(145deg,#f0f7ff,#cfe5ff)",
                            color: "#1769d2",
                            boxShadow: "0 2px 9px rgba(0,0,0,0.2)",
                            fontSize: 18,
                          }}
                        >
                          🎁
                        </span>
                        <span style={{ flex: 1, minWidth: 0, textAlign: "center" }}>
                          View available offers
                        </span>
                        <span
                          aria-hidden="true"
                          style={{
                            width: 34,
                            height: 34,
                            flexShrink: 0,
                            display: "grid",
                            placeItems: "center",
                            borderRadius: "50%",
                            border: "1px solid rgba(115,190,255,0.82)",
                            background: "linear-gradient(145deg,rgba(16,185,150,0.36),rgba(5,150,130,0.28))",
                            boxShadow: "0 0 12px rgba(16,185,150,0.3)",
                            transform: openOffer?.index === index ? "rotate(180deg)" : "rotate(0deg)",
                            transition: "transform 220ms ease",
                          }}
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="m6 9 6 6 6-6" />
                          </svg>
                        </span>
                      </button>


                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {openOffer && (
          <>
            <button
              type="button"
              aria-label="Close available offers"
              onClick={() => setOpenOffer(null)}
              style={{
                position: "fixed",
                inset: 0,
                zIndex: 9998,
                border: "none",
                padding: 0,
                background: "transparent",
                cursor: "default",
              }}
            />
            <div
              role="region"
              aria-label="Available retailer offers"
              style={{
                position: "fixed",
                top: openOffer.top,
                left: openOffer.left,
                width: openOffer.width,
                maxHeight: openOffer.maxHeight,
                overflowY: "auto",
                zIndex: 9999,
                padding: 12,
                borderRadius: 16,
                border: "1px solid rgba(52,211,170,0.72)",
                background: "linear-gradient(145deg,#f0fdfa,#ffffff)",
                boxShadow: "0 16px 38px rgba(0,35,45,0.28), 0 0 0 1px rgba(16,185,150,0.12)",
                display: "flex",
                flexDirection: "column",
                gap: 10,
                animation: "offerOverlayIn 180ms ease-out",
              }}
            >
              {openOffer.offers.map((line, i) => (
                <div
                  key={i}
                  style={{
                    padding: "10px 12px",
                    borderRadius: 10,
                    background: "#ffffff",
                    border: "1px solid #b7eadc",
                    fontSize: 14,
                    color: "#174b45",
                    lineHeight: 1.4,
                    whiteSpace: "normal",
                    wordBreak: "break-word",
                    overflowWrap: "anywhere",
                  }}
                >
                  {line}
                </div>
              ))}
            </div>
          </>
        )}
            
        {/* Related sections */}
        {relatedCategory.length > 0 && (
          <>
            <h3 className="section-title">More in {product.categorySlug}</h3>
            <div className="slider-row">
              <div className="flex gap-4 overflow-x-auto no-scrollbar">
                {relatedCategory.map((p) => (
                  <ProductCard key={p.id} product={p} variant="related" />
                ))}
              </div>
            </div>
          </>
        )}

        {relatedBrand.length > 0 && (
          <>
            <h3 className="section-title">More from {product.brand}</h3>
            <div className="slider-row">
              <div className="flex gap-4 overflow-x-auto no-scrollbar">
                {relatedBrand.map((p) => (
                  <ProductCard key={p.id} product={p} variant="related" />
                ))}
              </div>
            </div>
          </>
        )}

        {relatedPrice.length > 0 && (
          <>
            <h3 className="section-title">Similar Price Range</h3>
            <div className="slider-row">
              <div className="flex gap-4 overflow-x-auto no-scrollbar">
                {relatedPrice.map((p) => (
                  <ProductCard key={p.id} product={p} variant="related" />
                ))}
              </div>
            </div>
          </>
        )}

        {/* See all CTA */}
        {product?.categorySlug && (
          <button
            type="button"
            disabled={loadingCategory}
            onClick={() => {
              if (loadingCategory) return;
              setLoadingCategory(true);
              window.setTimeout(() => router.push(`/category/${product.categorySlug}`), 160);
            }}
            style={{
              width: "100%",
              marginTop: 28,
              padding: "15px 18px 15px 22px",
              borderRadius: 20,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              fontWeight: 900,
              fontSize: 16,
              color: "#f4fffe",
              cursor: loadingCategory ? "wait" : "pointer",
              border: "1px solid rgba(91,174,255,0.72)",
              background: "linear-gradient(115deg, rgba(5,24,55,0.98), rgba(0,74,145,0.94))",
              boxShadow: "0 0 0 1px rgba(0,198,255,0.12), 0 10px 26px rgba(0,105,255,0.24), inset 0 1px 0 rgba(255,255,255,0.2)",
              backdropFilter: "blur(14px)",
              WebkitBackdropFilter: "blur(14px)",
              transition: "transform 180ms ease, box-shadow 180ms ease",
            }}
          >
            <span>{loadingCategory ? "Loading category…" : `See all in ${product.categorySlug}`}</span>
            <span
              aria-hidden="true"
              style={{
                width: 38,
                height: 38,
                flexShrink: 0,
                display: "grid",
                placeItems: "center",
                borderRadius: "50%",
                border: "1px solid rgba(115,190,255,0.82)",
                background: "linear-gradient(145deg, rgba(0,145,255,0.34), rgba(35,105,255,0.26))",
                boxShadow: "0 0 14px rgba(0,145,255,0.32)",
              }}
            >
              {loadingCategory ? <span className="button-spinner" /> : (
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              )}
            </span>
          </button>
        )}
      </div>

      {/* Animations */}
      <style jsx>{`
        .button-spinner {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255,255,255,0.35);
          border-top-color: #ffffff;
          border-right-color: #65b8ff;
          border-radius: 50%;
          display: inline-block;
          animation: buttonSpin 0.7s linear infinite;
        }
        @keyframes buttonSpin { to { transform: rotate(360deg); } }
        @keyframes offerOverlayIn { from { opacity: 0; transform: translateY(-6px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
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
