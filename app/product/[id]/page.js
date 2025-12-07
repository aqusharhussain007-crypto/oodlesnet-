"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase-app";
import { doc, getDoc, updateDoc, increment } from "firebase/firestore";
import Image from "next/image";

export default function ProductDetail({ params }) {
  const { id } = params;
  const [product, setProduct] = useState(null);

  // 🚀 STEP 1 — Fetch product
  useEffect(() => {
    async function loadProduct() {
      const snap = await getDoc(doc(db, "products", id));
      if (snap.exists()) {
        setProduct(snap.data());
      }
    }
    loadProduct();
  }, [id]);

  // 🚀 STEP 2 — Increase VIEWS (only once per product per session)
  useEffect(() => {
    if (!product) return;

    const viewedKey = `viewed_${id}`;

    // Prevent double-increment on refresh
    if (sessionStorage.getItem(viewedKey)) return;

    sessionStorage.setItem(viewedKey, "true");

    const productRef = doc(db, "products", id);
    updateDoc(productRef, { views: increment(1) });
  }, [product, id]);

  if (!product) return <p className="p-4 text-gray-600">Loading...</p>;

  // ⭐ STORE LOGOS (unchanged)
  const stores = [
    { name: "Amazon", logo: "/logos/amazon.png" },
    { name: "Meesho", logo: "/logos/meesho.png" },
    { name: "Ajio", logo: "/logos/ajio.png" }
  ];

  return (
    <div className="p-4 pb-20">
      {/* TITLE */}
      <h1 className="text-4xl font-bold text-blue-400 leading-tight">
        {product.name}
      </h1>

      <p className="text-gray-700 mt-1">{product.description}</p>

      {/* IMAGE */}
      <div className="mt-4">
        <Image
          src={product.imageUrl}
          width={800}
          height={500}
          alt={product.name}
          className="rounded-2xl border border-blue-200 shadow-lg"
        />
      </div>

      {/* ⭐ AVAILABLE ON — (UNCHANGED UI BELOW THIS LINE) */}
      <h2 className="text-3xl font-bold text-blue-400 mt-6">Available On</h2>

      <div className="relative overflow-hidden mt-4">
        <div className="flex gap-6 animate-slideSlow" style={{ width: "max-content" }}>
          {stores.map((s, i) => (
            <div key={i} className="flex flex-col items-center">
              <div className="w-[90px] h-[90px] rounded-full bg-white shadow-lg border border-blue-100 flex items-center justify-center">
                <Image
                  src={s.logo}
                  width={60}
                  height={60}
                  alt={s.name}
                  className="object-contain"
                />
              </div>
              <p className="mt-1 font-semibold text-gray-700">{s.name}</p>
            </div>
          ))}
        </div>
      </div>

      {/* COMPARE PRICES (unchanged) */}
      <h2 className="text-3xl font-bold text-blue-400 mt-8">Compare Prices</h2>

      <div className="mt-4 flex overflow-x-scroll gap-4 no-scrollbar pb-4">
        {[
          {
            name: "Amazon",
            price: product.amazonPrice,
            offer: product.amazonOffer,
            url: product.amazonUrl,
          },
          {
            name: "Meesho",
            price: product.meeshoPrice,
            offer: product.meeshoOffer,
            url: product.meeshoUrl,
          },
          {
            name: "Ajio",
            price: product.ajioPrice,
            offer: product.ajioOffer,
            url: product.ajioUrl,
          }
        ].map((s, i) => (
          <div
            key={i}
            className="min-w-[63%] bg-white rounded-3xl p-4 border border-blue-200 shadow-xl"
          >
            <h3 className="text-2xl font-bold text-blue-500">{s.name}</h3>
            <p className="text-3xl font-bold text-blue-600 mt-1">₹{s.price}</p>
            <p className="text-gray-600 mt-1">{s.offer}</p>

            <a
              href={s.url}
              target="_blank"
              className="mt-4 inline-block px-6 py-2 rounded-full shadow-md font-semibold text-black text-lg"
              style={{ background: "linear-gradient(to right, #00c6ff, #00ff99)" }}
            >
              Buy →
            </a>
          </div>
        ))}
      </div>
    </div>
  );
        }
        
