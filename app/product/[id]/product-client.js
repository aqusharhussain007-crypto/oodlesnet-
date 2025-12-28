"use client";

import { useEffect, useState } from "react";
import {
  doc,
  getDoc,
  updateDoc,
  increment,
} from "firebase/firestore";
import { db } from "@/lib/firebase-app";
import Image from "next/image";
import Link from "next/link";

export default function ProductClient({ params }) {
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

  // ---------------- BUY HANDLER ----------------
  function handleBuy(store) {
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
        {stores.map((store, index) => (
          <div
            key={index}
            className="min-w-[260px] bg-white p-4 rounded-2xl shadow-md border border-gray-200 flex-shrink-0"
          >
            <div className="text-lg font-bold">
              {store.name}
            </div>

            {typeof store.price === "number" && (
              <div className="text-xl font-extrabold text-blue-700 my-1">
                ₹ {store.price.toLocaleString("en-IN")}
              </div>
            )}

            <div className="text-sm text-gray-600 mb-3">
              {store.offer}
            </div>

            <button
              onClick={() => handleBuy(store)}
              className="w-full text-white font-bold py-3 rounded-xl shadow-md"
              style={{
                background:
                  store.name.toLowerCase() === "amazon"
                    ? "linear-gradient(90deg,#ff9900,#ff6600)"
                    : store.name.toLowerCase() === "meesho"
                    ? "linear-gradient(90deg,#ff3f8e,#ff77a9)"
                    : store.name.toLowerCase() === "ajio"
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
