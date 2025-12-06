"use client";

import { useEffect, useState, useRef } from "react";
import { db } from "@/lib/firebase-app";
import { doc, getDoc } from "firebase/firestore";
import Image from "next/image";

export default function ProductDetail({ params }) {
  const { id } = params;
  const [product, setProduct] = useState(null);

  /* LOAD PRODUCT */
  useEffect(() => {
    const load = async () => {
      const snap = await getDoc(doc(db, "products", id));
      if (snap.exists()) setProduct(snap.data());
    };
    load();
  }, [id]);

  if (!product) return <p className="p-4 text-gray-700">Loading...</p>;

  /* STORE LOGOS */
  const stores = [
    { name: "Amazon", logo: "/logos/amazon.png" },
    { name: "Meesho", logo: "/logos/meesho.png" },
    { name: "Ajio", logo: "/logos/ajio.png" },
  ];

  /* Duplicate list for smooth infinite animation */
  const loopLogos = [...stores, ...stores];

  return (
    <div className="p-4 pb-20">
      {/* PRODUCT NAME */}
      <h1 className="text-4xl font-bold leading-tight text-blue-400">
        {product.name}
      </h1>

      <p className="mt-1 text-gray-600">{product.description}</p>

      {/* PRODUCT IMAGE */}
      <div className="mt-4">
        <Image
          src={product.imageUrl}
          width={900}
          height={600}
          alt={product.name}
          className="rounded-3xl border border-blue-200 shadow-lg"
        />
      </div>

      {/* AVAILABLE ON */}
      <h2 className="mt-8 text-3xl font-bold text-blue-400">Available On</h2>

      {/* LOGO TRACK (infinite sliding) */}
      <div className="relative mt-4 overflow-hidden">
        <div
          className="flex gap-6 animate-slideSlow"
          style={{ width: "max-content" }}
        >
          {loopLogos.map((store, i) => (
            <div
              key={i}
              className="flex flex-col items-center justify-center"
            >
              <div className="flex h-[90px] w-[90px] items-center justify-center rounded-full border border-blue-100 bg-white shadow-lg overflow-hidden">
                <Image
                  src={store.logo}
                  alt={store.name}
                  width={55}
                  height={55}
                  className="object-contain"
                />
              </div>

              <p className="mt-1 text-sm font-semibold text-gray-700">
                {store.name}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* COMPARE PRICES */}
      <h2 className="mt-10 text-3xl font-bold text-blue-400">
        Compare Prices
      </h2>

      {/* PRICE CARDS — Tall 2.5 visible */}
      <div className="mt-4 flex gap-4 overflow-x-scroll no-scrollbar pb-6">
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
          },
        ].map((store, index) => (
          <div
            key={index}
            className="min-w-[62%] rounded-3xl border border-blue-200 bg-white p-5 shadow-xl"
          >
            <h3 className="text-2xl font-bold text-blue-500">
              {store.name}
            </h3>

            <p className="mt-1 text-3xl font-bold text-blue-600">
              ₹{store.price}
            </p>

            <p className="mt-1 text-gray-600">{store.offer}</p>

            {/* BUY BUTTON */}
            <a
              href={store.url}
              target="_blank"
              className="mt-4 inline-flex items-center justify-center rounded-full px-6 py-2 text-lg font-semibold text-black shadow-md"
              style={{
                background: "linear-gradient(to right, #00c6ff, #00ff99)",
              }}
            >
              Buy →
            </a>
          </div>
        ))}
      </div>
    </div>
  );
        }
    
