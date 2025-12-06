"use client";

import { useEffect, useState, useRef } from "react";
import { db } from "@/lib/firebase-app";  // ✅ FIXED IMPORT
import { doc, getDoc } from "firebase/firestore";
import Image from "next/image";

export default function ProductDetail({ params }) {
  const { id } = params;
  const [product, setProduct] = useState(null);

  // Refs for logo animation
  const scrollRef = useRef(null);
  const isDragging = useRef(false);
  const pauseTimeout = useRef(null);

  // Load product from Firestore
  useEffect(() => {
    async function fetchProduct() {
      const snap = await getDoc(doc(db, "products", id));
      if (snap.exists()) setProduct(snap.data());
    }
    fetchProduct();
  }, [id]);

  // Auto-slide effect (Option B)
  useEffect(() => {
    if (!scrollRef.current) return;

    let interval = setInterval(() => {
      if (!isDragging.current) {
        scrollRef.current.scrollBy({ left: 120, behavior: "smooth" });
      }
    }, 1600);

    const el = scrollRef.current;

    const handleScroll = () => {
      if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 5) {
        el.scrollTo({ left: 0, behavior: "smooth" });
      }
    };

    el.addEventListener("scroll", handleScroll);

    return () => {
      clearInterval(interval);
      el.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Pause auto-scroll when user interacts
  const handleUserInteraction = () => {
    isDragging.current = true;

    clearTimeout(pauseTimeout.current);
    pauseTimeout.current = setTimeout(() => {
      isDragging.current = false;
    }, 1000); // Resume after 1 sec
  };

  if (!product) return <p className="p-4">Loading...</p>;

  // Store Logos
  const stores = [
    { name: "Amazon", logo: "/logos/amazon.png" },
    { name: "Meesho", logo: "/logos/meesho.png" },
    { name: "Ajio", logo: "/logos/ajio.png" },
  ];

  return (
    <div className="p-4 pb-20">

      {/* TITLE */}
      <h1 className="text-4xl font-bold text-blue-400 leading-tight">
        {product.name}
      </h1>

      <p className="text-gray-700 mt-1">{product.description}</p>

      {/* PRODUCT IMAGE */}
      <div className="mt-4 w-full">
        <Image
          src={product.imageUrl}
          width={800}
          height={500}
          alt={product.name}
          className="rounded-2xl border border-blue-200 shadow-lg"
        />
      </div>

      {/* AUTO-SLIDING LOGO CAROUSEL */}
      <div
        ref={scrollRef}
        onTouchStart={handleUserInteraction}
        onTouchMove={handleUserInteraction}
        onWheel={handleUserInteraction}
        className="mt-6 flex overflow-x-scroll no-scrollbar gap-4 px-1"
        style={{ scrollSnapType: "x mandatory" }}
      >
        {stores.map((s, i) => (
          <div
            key={i}
            className="min-w-[110px] scroll-snap-align-start flex flex-col items-center"
          >
            <div className="w-[85px] h-[85px] rounded-full bg-white shadow-lg border border-blue-100 flex items-center justify-center overflow-hidden">
              <Image
                src={s.logo}
                alt={s.name}
                width={60}
                height={60}
                className="object-contain"
              />
            </div>

            <p className="text-center text-gray-700 font-medium mt-1">
              {s.name.slice(0, 4)}
            </p>
          </div>
        ))}
      </div>

      {/* SECTION TITLE */}
      <h2 className="text-3xl font-bold text-blue-400 mt-8">
        Compare Prices
      </h2>

      {/* 2.5 PRICE CARDS ROW */}
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
          },
        ].map((store, index) => (
          <div
            key={index}
            className="min-w-[62%] bg-white rounded-2xl p-4 border border-blue-200 shadow-md"
          >
            <h3 className="text-xl font-bold text-blue-400">{store.name}</h3>

            <p className="text-2xl font-bold text-blue-500 mt-1">
              ₹{store.price}
            </p>

            <p className="text-gray-600 mt-1">{store.offer}</p>

            {/* BUY BUTTON (Small) */}
            <a
              href={store.url}
              target="_blank"
              className="mt-3 inline-block px-6 py-2 rounded-full shadow-md"
              style={{
                background:
                  "linear-gradient(to right, #00c6ff, #00ff99)",
              }}
            >
              <span className="font-semibold text-black text-lg">
                Buy →
              </span>
            </a>
          </div>
        ))}
      </div>

    </div>
  );
    }
    
