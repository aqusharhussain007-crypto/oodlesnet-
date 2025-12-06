"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase-app";
import { doc, getDoc } from "firebase/firestore";
import Image from "next/image";

// Store logos
const storeData = [
  { key: "amazon", name: "Amazon", logo: "/stores/amazon.png" },
  { key: "meesho", name: "Meesho", logo: "/stores/meesho.png" },
  { key: "ajio", name: "Ajio", logo: "/stores/ajio.png" },
];

export default function ProductPage({ params }) {
  const { id } = params;
  const [product, setProduct] = useState(null);
  const [angle, setAngle] = useState(0);

  // Rotate logos
  useEffect(() => {
    const interval = setInterval(() => {
      setAngle((prev) => prev + 0.02); // slow smooth spin
    }, 16);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    async function load() {
      const snap = await getDoc(doc(db, "products", id));
      if (snap.exists()) setProduct(snap.data());
    }
    load();
  }, [id]);

  if (!product) return <p>Loading...</p>;

  return (
    <main className="px-4 py-6">
      {/* Product Name */}
      <h1 className="text-2xl font-bold text-sky-500">{product.name}</h1>
      <p className="text-gray-600 mt-1">{product.description}</p>

      {/* IMAGE */}
      <div className="w-full mt-4 rounded-xl overflow-hidden shadow-lg">
        <Image
          src={product.imageUrl}
          width={800}
          height={600}
          alt={product.name}
          className="w-full h-auto object-cover"
        />
      </div>

      {/* ★ Revolving Store Logos */}
      <div className="relative mx-auto mt-6 w-40 h-40 flex items-center justify-center">
        {storeData.map((store, index) => {
          const radius = 70;
          const a = angle + index * 2.1; // spread evenly
          const x = radius * Math.cos(a);
          const y = radius * Math.sin(a);

          return (
            <div
              key={store.key}
              className="absolute w-14 h-14 rounded-full bg-white shadow-xl border border-sky-200 flex items-center justify-center"
              style={{
                transform: `translate(${x}px, ${y}px)`,
              }}
            >
              <Image
                src={store.logo}
                width={40}
                height={40}
                alt={store.name}
              />
            </div>
          );
        })}
      </div>

      {/* Compare Prices Title */}
      <h2 className="text-2xl font-bold text-sky-500 mt-8">Compare Prices</h2>

      {/* ★ 2.5 Card Scrolling Row */}
      <div className="mt-4 flex gap-4 overflow-x-auto pb-4">
        {storeData.map((store) => {
          const price = product[`${store.key}Price`] || null;
          const offer = product[`${store.key}Offer`] || "No offers";
          const url = product[`${store.key}Url`] || "#";

          return (
            <div
              key={store.key}
              className="min-w-[68%] max-w-[68%] bg-white rounded-2xl shadow-md p-4 border border-sky-100 relative"
            >
              {/* Store Name + Price */}
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold">{store.name}</h3>
                <span className="text-sky-500 font-bold text-xl">
                  ₹{price || "--"}
                </span>
              </div>

              {/* Offer */}
              <p className="text-gray-500 text-sm mt-1">{offer}</p>

              {/* Buy Button */}
              <a
                href={url}
                target="_blank"
                className="block w-full mt-3 text-center text-black font-semibold py-3 rounded-xl"
                style={{
                  background:
                    "linear-gradient(to right, #00c6ff, #00ff84)",
                  boxShadow: "0 0 12px rgba(0,200,255,0.5)",
                }}
              >
                Buy Now →
              </a>
            </div>
          );
        })}

        {/* Extra half-space to show 2.5 layout */}
        <div className="min-w-[30%]"></div>
      </div>
    </main>
  );
        }
              
