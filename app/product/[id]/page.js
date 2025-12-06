"use client";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase-app";
import { doc, getDoc } from "firebase/firestore";
import Image from "next/image";

export default function ProductDetail({ params }) {
  const { id } = params;
  const [product, setProduct] = useState(null);

  useEffect(() => {
    const load = async () => {
      const snap = await getDoc(doc(db, "products", id));
      if (snap.exists()) setProduct(snap.data());
    };
    load();
  }, [id]);

  if (!product) return <p className="text-center p-4">Loading...</p>;

  // Store logos
  const stores = [
    { name: "Amazon", logo: "/logos/amazon.png" },
    { name: "Meesho", logo: "/logos/meesho.png" },
    { name: "Ajio", logo: "/logos/ajio.png" },
  ];

  return (
    <div className="w-full max-w-[600px] mx-auto px-4 pb-24">

      {/* TITLE */}
      <h1 className="text-4xl font-bold text-blue-400 mt-4">
        {product.name}
      </h1>
      <p className="text-gray-700">{product.description}</p>

      {/* IMAGE */}
      <div className="mt-4">
        <Image
          src={product.imageUrl}
          width={800}
          height={500}
          alt={product.name}
          className="rounded-2xl shadow-lg border border-blue-200 w-full"
        />
      </div>

      {/* AVAILABLE ON */}
      <h2 className="text-3xl font-bold text-blue-400 mt-8">Available On</h2>

      {/* LOGO ROW (STATIC FOR NOW) */}
      <div className="flex flex-row justify-between mt-4 px-2">
        {stores.map((s, i) => (
          <div key={i} className="flex flex-col items-center">
            <div className="w-[90px] h-[90px] rounded-full bg-white shadow-lg border border-blue-200 flex items-center justify-center">
              <Image
                src={s.logo}
                width={55}
                height={55}
                alt={s.name}
                className="object-contain"
              />
            </div>
            <p className="mt-1 text-gray-700 font-medium">{s.name}</p>
          </div>
        ))}
      </div>

      {/* COMPARE PRICES */}
      <h2 className="text-3xl font-bold text-blue-400 mt-10">Compare Prices</h2>

      {/* 2.5 VERTICAL CARDS */}
      <div className="flex gap-4 overflow-x-auto no-scrollbar mt-4 pb-6">
        
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
        ].map((s, i) => (
          <div
            key={i}
            className="min-w-[65%] bg-white rounded-3xl p-4 border border-blue-200 shadow-lg"
          >
            <h3 className="text-2xl font-bold text-blue-500">{s.name}</h3>

            <p className="text-3xl font-bold text-blue-600 mt-1">
              ₹{s.price}
            </p>

            <p className="text-gray-600 mt-1">{s.offer}</p>

            {/* BUY BUTTON */}
            <a
              href={s.url}
              target="_blank"
              className="mt-4 inline-block px-6 py-2 rounded-full shadow-md text-black font-semibold text-lg"
              style={{
                background: "linear-gradient(to right,#00c6ff,#00ff99)",
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
            
