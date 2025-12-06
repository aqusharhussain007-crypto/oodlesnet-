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

  if (!product) return <p className="text-white p-4">Loading...</p>;

  // Store Logos (Option 2 → Infinite Loop Animation)
  const stores = [
    { name: "Amazon", logo: "/logos/amazon.png" },
    { name: "Meesho", logo: "/logos/meesho.png" },
    { name: "Ajio", logo: "/logos/ajio.png" },
  ];

  // Duplicate list for infinite loop
  const loopLogos = [...stores, ...stores, ...stores];

  return (
    <div className="p-4 pb-20">
      {/* PRODUCT NAME */}
      <h1 className="text-4xl font-bold text-blue-400 leading-tight">
        {product.name}
      </h1>
      <p className="text-gray-700 mt-1">{product.description}</p>

      {/* PRODUCT IMAGE */}
      <div className="mt-4">
        <Image
          src={product.imageUrl}
          width={800}
          height={500}
          alt={product.name}
          className="rounded-2xl shadow-lg border border-blue-200"
        />
      </div>

      {/* ⭐ AVAILABLE ON */}
      <h2 className="text-3xl font-bold text-blue-400 mt-6">Available On</h2>

      {/* ⭐ INFINITE SLIDING LOGO STRIP */}
      <div className="relative overflow-hidden mt-4">
        <div
          className="flex gap-6 animate-slideSlow"
          style={{ width: "max-content" }}
        >
          {loopLogos.map((s, i) => (
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
              <p className="mt-1 font-semibold text-gray-700">
                {s.name}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* COMPARE PRICES */}
      <h2 className="text-3xl font-bold text-blue-400 mt-8">
        Compare Prices
      </h2>

      const priceCards = [
  {
    name: "Amazon",
    price: product.amazonPrice,
    offer: product.amazonOffer,
    url: product.amazonUrl,
    logo: "/logos/amazon.png"
  },
  {
    name: "Meesho",
    price: product.meeshoPrice,
    offer: product.meeshoOffer,
    url: product.meeshoUrl,
    logo: "/logos/meesho.png"
  },
  {
    name: "Ajio",
    price: product.ajioPrice,
    offer: product.ajioOffer,
    url: product.ajioUrl,
    logo: "/logos/ajio.png"
  },
];

{/* ⭐ FIXED — PERFECT VERTICAL RECTANGLE PRICE CARDS */}
<div className="mt-6 flex gap-4 overflow-x-scroll no-scrollbar pb-2">

  {priceCards.map((s, i) => (
    <div
      key={i}
      className="
        min-w-[65%] 
        bg-white 
        rounded-3xl 
        p-5 
        border border-blue-200 
        shadow-[0_4px_18px_rgba(0,0,0,0.12)]
        flex flex-col
      "
    >

      {/* TOP: Logo + Name + Price */}
      <div className="flex items-center justify-between">
        
        <div className="flex items-center gap-3">
          <Image 
            src={s.logo} 
            width={40} 
            height={40} 
            alt={s.name}
            className="rounded-full border border-gray-200"
          />
          <h3 className="text-xl font-bold text-blue-500">
            {s.name}
          </h3>
        </div>

        <p className="text-2xl font-bold text-blue-500">
          ₹{s.price}
        </p>

      </div>

      <p className="text-gray-600 text-lg mt-2">{s.offer}</p>

      <a
        href={s.url}
        target="_blank"
        className="
          mt-4 
          py-2 px-6 
          rounded-full 
          font-semibold 
          text-black 
          text-lg 
          shadow-md 
          inline-block
        "
        style={{
          background: "linear-gradient(to right, #00c6ff, #00ff99)"
        }}
      >
        Buy →
      </a>

    </div>
  ))}

</div>
              
            {/* BUY BUTTON */}
            <a
              href={s.url}
              target="_blank"
              className="mt-4 inline-block px-6 py-2 rounded-full shadow-md font-semibold text-black text-lg"
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

/* Tailwind animation (add to globals.css)
-------------------------------------------------- 
@keyframes slideSlow {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
.animate-slideSlow {
  animation: slideSlow 12s linear infinite;
}
-------------------------------------------------- 
*/
            
