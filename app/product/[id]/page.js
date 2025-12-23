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
          (p) => p.brand === product.brand && !usedIds.has(p.id)
        )
        .slice(0, 4);
      brandItems.forEach((p) => usedIds.add(p.id));
      setRelatedBrand(brandItems);

      const prices = product.store?.map((s) => s.price) || [];
      const base = Math.min(...prices);

      if (base) {
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

  if (loading) return <div className="p-4">Loading…</div>;
  if (!product)
    return <div className="p-4 text-red-600">Product not found</div>;

  /* ---------------- IMAGE SAFE FALLBACK ---------------- */
  const imageSrc =
    product.imageUrl ||
    product.image ||
    product.images?.[0] ||
    "/placeholder.png";

  /* ---------------- SHARE ---------------- */
  function handleShare() {
    const data = {
      title: product.name,
      text: `Compare prices for ${product.name} on OodlesNet`,
      url: window.location.href,
    };

    if (navigator.share) {
      navigator.share(data).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied");
    }
  }

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
    <div className="p-4 pb-24 max-w-[1100px] mx-auto">
      {/* Breadcrumb */}
      <div className="text-sm mb-3">
        <Link href="/" className="text-blue-500">Home</Link> /{" "}
        <span className="text-blue-600 font-semibold">
          {product.categorySlug}
        </span>{" "}
        / <span className="font-bold">{product.name}</span>
      </div>

      {/* MAIN LAYOUT */}
      <div className="desktop-split flex flex-col lg:flex-row gap-6">
        {/* IMAGE */}
        <div className="lg:w-[45%] bg-white rounded-2xl shadow-lg overflow-hidden">
          <Image
            src={imageSrc}
            alt={product.name}
            width={900}
            height={520}
            className="w-full h-auto object-contain"
            priority
          />
        </div>

        {/* DETAILS */}
        <div className="flex-1">
          {/* TITLE + SHARE */}
          <div className="flex justify-between items-center gap-3">
            <h1 className="text-2xl font-bold text-blue-700">
              {product.name}
            </h1>

            <button
              onClick={handleShare}
              className="px-5 py-2 rounded-full font-bold text-white shadow-lg"
              style={{
                background:
                  "linear-gradient(135deg,#0f4c81,#10b981)",
              }}
            >
              Share
            </button>
          </div>

          {/* DESCRIPTION */}
          <div className="mt-3">
            <p
              className="text-gray-700"
              style={{
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
                className="mt-2 text-blue-500 font-semibold"
              >
                {expanded ? "Show less" : "Read more"}
              </button>
            )}
          </div>

          {/* STORES */}
          <h3 className="mt-6 text-xl font-bold text-blue-600">
            Compare Prices
          </h3>

          <div className="flex gap-4 overflow-x-auto py-4 no-scrollbar">
            {(product.store || []).map((store, index) => (
              <div
                key={index}
                className="min-w-[260px] bg-white p-5 rounded-2xl shadow-md border"
              >
                <div className="text-lg font-bold">{store.name}</div>

                <div
                  className="text-2xl font-extrabold my-2"
                  style={{
                    color:
                      store.price ===
                      Math.min(...product.store.map((s) => s.price))
                        ? "#16a34a"
                        : "#2563eb",
                  }}
                >
                  ₹ {store.price.toLocaleString("en-IN")}
                </div>

                <div className="text-sm text-gray-600 mb-4">
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
        </div>
      </div>

      {/* RELATED PRODUCTS */}
      {relatedCategory.length > 0 && (
        <>
          <h3 className="section-title mt-10">
            More in {product.categorySlug}
          </h3>
          <div className="flex gap-4 overflow-x-auto no-scrollbar">
            {relatedCategory.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </>
      )}

      {relatedBrand.length > 0 && (
        <>
          <h3 className="section-title mt-10">
            More from {product.brand}
          </h3>
          <div className="flex gap-4 overflow-x-auto no-scrollbar">
            {relatedBrand.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </>
      )}

      {relatedPrice.length > 0 && (
        <>
          <h3 className="section-title mt-10">
            Similar Price Range
          </h3>
          <div className="flex gap-4 overflow-x-auto no-scrollbar">
            {relatedPrice.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </>
      )}
    </div>
  );
    }
        
