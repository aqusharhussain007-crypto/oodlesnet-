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
} from "firebase/firestore";
import { db } from "@/lib/firebase-app";
import Image from "next/image";
import Link from "next/link";

// ✅ NEW: helper import
import { getTopPrices } from "@/lib/productUtils";

export default function ProductPage({ params }) {
  const { id } = params;

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  // ---------------- LOAD PRODUCT ----------------
  useEffect(() => {
    async function loadProduct() {
      try {
        const ref = doc(db, "products", id);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          setProduct({ id: snap.id, ...snap.data() });

          // increment product views
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

  if (loading) return <div className="p-4">Loading…</div>;
  if (!product)
    return <div className="p-4 text-red-600">Product not found</div>;

  const stores = product.store || [];

  // ✅ PRICE LOGIC VIA HELPER (ONLY CHANGE)
  const { lowest, second, third } = getTopPrices(stores);

  // ---------------- BUY HANDLER (TRACK + REDIRECT) ----------------
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
        <Link href="/" className="text-blue-500">
          Home
        </Link>{" "}
        /{" "}
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

      {/* Product Title */}
      <h1 className="text-2xl font-bold text-blue-700">
        {product.name}
      </h1>

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
                    index === 0
                      ? "#16a34a" // lowest
                      : "#2563eb", // 2nd / 3rd
                }}
              >
                ₹ {Number(store.price).toLocaleString("en-IN")}
              </div>

              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: index === 0 ? "#16a34a" : "#2563eb",
                  marginBottom: 6,
                }}
              >
                {index === 0
                  ? "Lowest price"
                  : index === 1
                  ? "2nd lowest"
                  : "3rd lowest"}
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
    </div>
  );
    }
    
