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
  getTopPrices,
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

  /* ---------------- LOAD PRODUCT ---------------- */
  useEffect(() => {
    async function loadProduct() {
      try {
        const ref = doc(db, "products", id);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          setProduct({ id: snap.id, ...snap.data() });

          await updateDoc(ref, {
            views: increment(1),
          });
        }
      } catch (e) {
        console.error("Product load error:", e);
      }

      setLoading(false);
    }

    loadProduct();
  }, [id]);

  /* ---------------- LOAD RELATED PRODUCTS ---------------- */
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

        const { lowest } = getTopPrices(product.store);
        if (lowest) {
          const priceItems = filterByPriceRange(
            all.filter((p) => !usedIds.has(p.id)),
            lowest.price,
            15
          ).slice(0, 4);
          priceItems.forEach((p) => usedIds.add(p.id));
          setRelatedPrice(priceItems);
        }
      } catch (e) {
        console.error("Related products load error:", e);
      }
    }

    loadRelated();
  }, [product]);

  if (loading) return <div className="p-4">Loading…</div>;
  if (!product)
    return <div className="p-4 text-red-600">Product not found</div>;

  const { lowest, second, third } = getTopPrices(product.store);

  /* ---------------- SHARE HANDLER ---------------- */
  function handleShare() {
    const shareData = {
      title: product.name,
      text: `Compare prices for ${product.name} on OodlesNet`,
      url: window.location.href,
    };

    if (navigator.share) {
      navigator.share(shareData).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard");
    }
  }

  /* ---------------- BUY HANDLER ---------------- */
  async function handleBuy(store) {
    try {
      await addDoc(collection(db, "clicks"), {
        productId: product.id,
        store: store.name.toLowerCase(),
        createdAt: serverTimestamp(),
      });
    } catch (e) {
      console.error("Click tracking failed:", e);
    }

    window.location.href = store.url;
  }

  return (
    <div className="p-4 pb-24 max-w-[720px] mx-auto">
      {/* Breadcrumb */}
      <div className="text-sm mb-3">
        <Link href="/" className="text-blue-500">Home</Link> /{" "}
        <span className="text-blue-600 font-semibold">
          {product.categorySlug}
        </span>{" "}
        / <span className="font-bold">{product.name}</span>
      </div>

      {/* Product Image */}
      <div className="rounded-2xl overflow-hidden shadow-md mb-4 bg-white">
        <Image
          src={product.imageUrl}
          alt={product.name}
          width={900}
          height={600}
          className="w-full object-cover"
        />
      </div>

      {/* Title + Share */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <h1 className="text-2xl font-bold text-blue-700">
          {product.name}
        </h1>

        <button
          onClick={handleShare}
          style={{
            padding: "8px 14px",
            borderRadius: 999,
            border: "none",
            fontWeight: 700,
            color: "#fff",
            background:
              "linear-gradient(135deg,#0f4c81,#10b981)",
            boxShadow: "0 6px 16px rgba(16,185,129,0.35)",
            cursor: "pointer",
          }}
        >
          Share
        </button>
      </div>

      {/* Description */}
      <p className="mt-3 text-gray-700">
        {product.description}
      </p>

      {/* Compare Prices */}
      <h3 className="mt-6 text-xl font-bold text-blue-600">
        Compare Prices
      </h3>

      <div className="flex gap-4 overflow-x-auto py-4 no-scrollbar">
        {[lowest, second, third]
          .filter(Boolean)
          .map((store, index) => (
            <div
              key={index}
              className="min-w-[260px] bg-white p-4 rounded-2xl shadow-md border border-gray-200 flex-shrink-0"
            >
              <div className="text-lg font-bold">
                {store.name}
              </div>

              <div
                className="text-xl font-extrabold my-1"
                style={{
                  color:
                    index === 0 ? "#16a34a" : "#2563eb",
                }}
              >
                ₹ {store.price.toLocaleString("en-IN")}
              </div>

              <div className="text-sm text-gray-600 mb-3">
                {store.offer}
              </div>

              <button
                onClick={() => handleBuy(store)}
                className="w-full text-white font-bold py-3 rounded-xl shadow-md"
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

      {/* RELATED SECTIONS (unchanged, already implemented) */}
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
