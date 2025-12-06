"use client";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase-app";
import { doc, getDoc } from "firebase/firestore";
import Image from "next/image";

export default function ProductDetail({ params }) {
  const { id } = params;
  const [product, setProduct] = useState(null);

  // LOAD PRODUCT
  useEffect(() => {
    const loadProduct = async () => {
      const snap = await getDoc(doc(db, "products", id));
      if (snap.exists()) setProduct(snap.data());
    };
    loadProduct();
  }, [id]);

  if (!product) return <p className="p-4 text-gray-500">Loading...</p>;

  const stores = [
    { name: "Amazon", logo: "/logos/amazon.png" },
    { name: "Meesho", logo: "/logos/meesho.png" },
    { name: "Ajio", logo: "/logos/ajio.png" },
  ];

  const priceCards = [
    {
      name: "Amazon",
      logo: "/logos/amazon.png",
      price: product.amazonPrice,
      offer: product.amazonOffer,
      url: product.amazonUrl,
    },
    {
      name: "Meesho",
      logo: "/logos/meesho.png",
      price: product.meeshoPrice,
      offer: product.meeshoOffer,
      url: product.meeshoUrl,
    },
    {
      name: "Ajio",
      logo: "/logos/ajio.png",
      price: product.ajioPrice,
      offer: product.ajioOffer,
      url: product.ajioUrl,
    },
  ];

  return (
    <div className="p-4 pb-20">
      {/* Title */}
      <h1 className="text-4xl font-bold text-blue-400">{product.name}</h1>
      <p className="text-gray-700 mt-1">{product.description}</p>

      {/* Product Image */}
      <div className="mt-4">
        <Image
          src={product.imageUrl}
          width={800}
          height={500}
          alt={product.name}
          className="rounded-2xl shadow-lg border border-blue-200"
        />
      </div>

      {/* AVAILABLE ON */}
      <h2 className="text-3xl font-bold text-blue-400 mt-6">Available On</h2>

      {/* Store Logos EXACTLY like your screenshot */}
      <div className="mt-5 flex justify-center gap-6">
        {stores.map((s, i) => (
          <div key={i} className="flex flex-col items-center">
            <div className="w-[95px] h-[95px] rounded-full bg-white shadow-xl border border-blue-100 flex items-center justify-center overflow-hidden">
              <Image
                src={s.logo}
                width={60}
                height={60}
                alt={s.name}
                className="object-contain"
              />
            </div>
            <p className="mt-1 font-semibold text-gray-700">
              {s.name.slice(0, 5)}
            </p>
          </div>
        ))}
      </div>

      {/* COMPARE PRICES */}
      <h2 className="text-3xl font-bold text-blue-400 mt-8">Compare Prices</h2>

      {/* 2.5 TALL RECTANGLE CARDS */}
      <div className="mt-4 flex gap-4 overflow-x-scroll no-scrollbar pb-4">
        {priceCards.map((s, i) => (
          <div
            key={i}
            className="min-w-[65%] bg-white rounded-3xl p-5 border border-blue-200 shadow-lg"
          >
            <div className="flex items-center gap-3">
              <Image
                src={s.logo}
                width={40}
                height={40}
                alt={s.name}
                className="rounded-full border border-gray-200"
              />
              <h3 className="text-2xl font-bold text-blue-500">{s.name}</h3>
            </div>

            <p className="text-3xl font-bold text-blue-600 mt-2">₹{s.price}</p>
            <p className="text-gray-600 mt-1">{s.offer}</p>

            {/* BUY BUTTON */}
            <a
              href={s.url}
              target="_blank"
              className="mt-4 inline-block px-6 py-2 rounded-full font-semibold text-black text-lg shadow-md"
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
