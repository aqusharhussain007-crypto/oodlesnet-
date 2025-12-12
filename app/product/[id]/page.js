"use client";

import { useEffect, useState } from "react";
import { doc, getDoc, updateDoc, increment } from "firebase/firestore";
import { db } from "@/lib/firebase-app";
import Image from "next/image";
import Link from "next/link";

export default function ProductPage({ params }) {
  const { id } = params;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProduct() {
      try {
        const ref = doc(db, "products", id);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          const data = snap.data();
          setProduct({ id: snap.id, ...data });

          // Increment views
          updateDoc(ref, { views: increment(1) });

          // Store in Recently Viewed
          if (typeof window !== "undefined") {
            let recent = JSON.parse(localStorage.getItem("recent") || "[]");
            recent = recent.filter((p) => p.id !== snap.id);
            recent.unshift({
              id: snap.id,
              name: data.name,
              imageUrl: data.imageUrl
            });
            if (recent.length > 12) recent = recent.slice(0, 12);
            localStorage.setItem("recent", JSON.stringify(recent));
          }
        }
      } catch (err) {
        console.error("Error loading product:", err);
      }
      setLoading(false);
    }

    loadProduct();
  }, [id]);

  if (loading) return <div className="p-4">Loading…</div>;
  if (!product) return <div className="p-4 text-red-600">Product not found.</div>;

  const stores = product.store || [];

  /* --------------------------
     ⭐ STORE PRICES
  -------------------------- */
  const prices = stores.map((s) => Number(s.price));
  const lowest = Math.min(...prices);
  const highest = Math.max(...prices);

  let medium = null;
  if (prices.length >= 3) {
    const sorted = [...prices].sort((a, b) => a - b);
    medium = sorted[Math.floor(sorted.length / 2)];
  } else if (prices.length === 2) {
    medium = Math.round((prices[0] + prices[1]) / 2);
  } else {
    medium = prices[0];
  }

  return (
    <div className="p-4 pb-24 max-w-[700px] mx-auto">
      {/* Breadcrumb */}
      <div className="text-sm mb-3">
        <Link href="/" className="text-blue-500">Home</Link> /{" "}
        <span className="text-blue-600 font-semibold">{product.categorySlug}</span> /{" "}
        <span className="font-bold">{product.name}</span>
      </div>

      {/* Product Image */}
      <div className="rounded-2xl overflow-hidden shadow-md mb-4 bg-white">
        <Image
          src={product.imageUrl}
          alt={product.name}
          width={800}
          height={600}
          className="w-full object-cover"
        />
      </div>

      {/* Title */}
      <h1 className="text-2xl font-bold text-blue-700">{product.name}</h1>

      {/* ⭐ PRICE SUMMARY */}
      <div className="mt-3 p-3 rounded-xl bg-white shadow-sm border">
        <div className="flex justify-between font-bold text-lg">
          <span className="text-green-600">
            ₹{lowest.toLocaleString("en-IN")}
          </span>
          <span className="text-blue-600">
            ₹{medium.toLocaleString("en-IN")}
          </span>
          <span className="text-red-600">
            ₹{highest.toLocaleString("en-IN")}
          </span>
        </div>

        <div className="flex justify-between text-xs mt-1 text-gray-500">
          <span className="bg-green-100 text-green-700 px-2 py-1 rounded-md">Lowest</span>
          <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-md">Medium</span>
          <span className="bg-red-100 text-red-700 px-2 py-1 rounded-md">Highest</span>
        </div>
      </div>

      {/* Description */}
      <h3 className="mt-4 text-lg font-bold text-blue-600">Description</h3>
      <p className="text-gray-700">{product.description}</p>

      {/* Share Button */}
      <button
        onClick={() =>
          navigator.share?.({
            title: product.name,
            url: window.location.href
          })
        }
        className="mt-4 px-4 py-2 bg-gradient-to-r from-blue-400 to-cyan-400 text-white font-bold rounded-xl shadow"
      >
        Share
      </button>

      {/* Compare Prices */}
      <h3 className="mt-6 text-xl font-bold text-blue-600">Compare Prices</h3>

      <div className="flex gap-4 overflow-x-auto py-3 no-scrollbar">
        {stores.map((store, index) => (
          <div
            key={index}
            className="min-w-[260px] bg-white p-4 rounded-2xl shadow-md border border-gray-200 flex-shrink-0"
          >
            <div className="text-lg font-bold">
              {store.name}: ₹{Number(store.price).toLocaleString("en-IN")}
            </div>
            <div className="text-gray-600 text-sm mb-3">{store.offer}</div>

            {/* Buy Button */}
            <a
              href={store.url}
              target="_blank"
              className="block text-center text-white font-bold py-3 rounded-xl shadow-md"
              style={{
                background:
                  store.name.toLowerCase().includes("amazon")
                    ? "linear-gradient(90deg,#ff9900,#ff6600)"
                    : store.name.toLowerCase().includes("meesho")
                    ? "linear-gradient(90deg,#ff3f8e,#ff77a9)"
                    : store.name.toLowerCase().includes("ajio")
                    ? "linear-gradient(90deg,#005bea,#00c6fb)"
                    : "linear-gradient(90deg,#00c6ff,#00ff99)"
              }}
            >
              Buy on {store.name}
            </a>
          </div>
        ))}
      </div>
    </div>
  );
      }
    
