"use client";

import { useEffect, useState } from "react";
import {
  doc,
  getDoc,
  updateDoc,
  increment,
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
} from "firebase/firestore";
import { db } from "@/lib/firebase-app";
import Image from "next/image";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import {
  excludeProductById,
  filterByPriceRange,
} from "@/lib/productUtils";

export default function ProductPage({ params }) {
  const { id } = params;

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  const [relatedCategory, setRelatedCategory] = useState([]);
  const [relatedBrand, setRelatedBrand] = useState([]);
  const [relatedPrice, setRelatedPrice] = useState([]);

  const [expanded, setExpanded] = useState(false);

  /* ---------------- LOAD PRODUCT ---------------- */
  useEffect(() => {
    async function loadProduct() {
      try {
        const ref = doc(db, "products", id);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          setProduct({ id: snap.id, ...snap.data() });
          await updateDoc(ref, { views: increment(1) });
        }
      } catch (e) {
        console.error("Product load error:", e);
      }
      setLoading(false);
    }
    loadProduct();
  }, [id]);

  /* ---------------- LOAD RELATED ---------------- */
  useEffect(() => {
    if (!product) return;

    async function loadRelated() {
      const snap = await getDocs(collection(db, "products"));
      let all = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      all = excludeProductById(all, product.id);

      const usedIds = new Set([product.id]);

      const cat = all
        .filter((p) => p.categorySlug === product.categorySlug && !usedIds.has(p.id))
        .slice(0, 4);
      cat.forEach((p) => usedIds.add(p.id));
      setRelatedCategory(cat);

      const brand = all
        .filter((p) => p.brand === product.brand && !usedIds.has(p.id))
        .slice(0, 4);
      brand.forEach((p) => usedIds.add(p.id));
      setRelatedBrand(brand);

      const prices = product.store?.map((s) => s.price) || [];
      const base = Math.min(...prices);

      if (base) {
        const price = filterByPriceRange(
          all.filter((p) => !usedIds.has(p.id)),
          base,
          15
        ).slice(0, 4);
        setRelatedPrice(price);
      }
    }

    loadRelated();
  }, [product]);

  if (loading) return <div className="p-4">Loading…</div>;
  if (!product) return <div className="p-4 text-red-600">Product not found</div>;

  /* ---------------- SHARE ---------------- */
  function handleShare() {
    const data = {
      title: product.name,
      text: `Compare prices for ${product.name} on OodlesNet`,
      url: window.location.href,
    };
    if (navigator.share) navigator.share(data).catch(() => {});
    else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied");
    }
  }

  /* ---------------- BUY ---------------- */
  async function handleBuy(store) {
    try {
      await addDoc(collection(db, "clicks"), {
        productId: product.id,
        store: store.name.toLowerCase(),
        createdAt: serverTimestamp(),
      });
    } catch {}
    window.location.href = store.url;
  }

  return (
    <div className="p-4 pb-24 max-w-[1100px] mx-auto">
      {/* Breadcrumb */}
      <div className="text-sm mb-3">
        <Link href="/" className="text-blue-500">Home</Link> /{" "}
        <span className="text-blue-600 font-semibold">{product.categorySlug}</span> /{" "}
        <span className="font-bold">{product.name}</span>
      </div>

      {/* MAIN */}
      <div className="desktop-split" style={{ display: "flex", flexDirection: "column", gap: 22 }}>
        {/* IMAGE (FIXED, BUT SAME POSITION AS BEFORE) */}
        <div
          style={{
            width: "100%",
            borderRadius: 18,
            background: "#fff",
            overflow: "hidden",
            position: "relative",
            aspectRatio: "16 / 9",
            boxShadow: "0 6px 18px rgba(0,0,0,0.1)",
          }}
        >
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            priority
            sizes="100vw"
            style={{ objectFit: "contain" }}
          />
        </div>

        {/* DETAILS */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
            <h1 className="text-2xl font-bold text-blue-700">{product.name}</h1>

            <button
              onClick={handleShare}
              style={{
                padding: "8px 16px",
                borderRadius: 999,
                border: "none",
                fontWeight: 800,
                color: "#fff",
                background: "linear-gradient(135deg,#0f4c81,#10b981)",
              }}
            >
              Share
            </button>
          </div>

          {/* DESCRIPTION */}
          <div style={{ marginTop: 12 }}>
            <p
              style={{
                display: "-webkit-box",
                WebkitLineClamp: expanded ? "unset" : 3,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                color: "#374151",
              }}
            >
              {product.description}
            </p>

            {product.description?.length > 120 && (
              <button
                onClick={() => setExpanded((v) => !v)}
                style={{ marginTop: 6, color: "#0bbcff", fontWeight: 700, border: "none", background: "none" }}
              >
                {expanded ? "Show less" : "Read more"}
              </button>
            )}
          </div>

          {/* STORE COMPARISON (RESTORED EXACTLY) */}
          <h3 className="mt-6 text-xl font-bold text-blue-600">Compare Prices</h3>

          <div className="flex gap-4 overflow-x-auto py-4 no-scrollbar">
            {(product.store || []).map((store, i) => (
              <div
                key={i}
                className="min-w-[260px] bg-white p-5 rounded-2xl shadow-md border border-gray-200"
              >
                <div className="text-lg font-bold">{store.name}</div>
                <div className="text-2xl font-extrabold my-2">
                  ₹ {store.price.toLocaleString("en-IN")}
                </div>
                <div className="text-sm text-gray-600 mb-4">{store.offer}</div>

                <button
                  onClick={() => handleBuy(store)}
                  className="w-full text-white font-bold py-3 rounded-xl"
                  style={{
                    background:
                      store.name === "Amazon"
                        ? "linear-gradient(90deg,#ff9900,#ff6600)"
                        : store.name === "Meesho"
                        ? "linear-gradient(90deg,#ff3f8e,#ff77a9)"
                        : store.name === "Ajio"
                        ? "linear-gradient(90deg,#005bea,#00c6fb)"
                        : "linear-gradient(90deg,#00c6ff,#00ff99)",
                  }}
                >
                  Buy on {store.name}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RELATED (UNCHANGED) */}
      {relatedCategory.length > 0 && (
        <>
          <h3 className="section-title">More in {product.categorySlug}</h3>
          <div className="slider-row">
            <div className="flex gap-4 overflow-x-auto no-scrollbar">
              {relatedCategory.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        </>
      )}

      {relatedBrand.length > 0 && (
        <>
          <h3 className="section-title">More from {product.brand}</h3>
          <div className="slider-row">
            <div className="flex gap-4 overflow-x-auto no-scrollbar">
              {relatedBrand.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        </>
      )}

      {relatedPrice.length > 0 && (
        <>
          <h3 className="section-title">Similar Price Range</h3>
          <div className="slider-row">
            <div className="flex gap-4 overflow-x-auto no-scrollbar">
              {relatedPrice.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        </>
      )}

      <style>{`
        @media (min-width: 1024px) {
          .desktop-split {
            flex-direction: row;
            align-items: flex-start;
          }
        }
      `}</style>
    </div>
  );
        }
                
