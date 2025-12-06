"use client";
import { useEffect, useState, useRef } from "react";
import { db } from "@/lib/firebase-app"; 
import { doc, getDoc } from "firebase/firestore";
import Image from "next/image";

export default function ProductDetail({ params }) {
  const { id } = params;
  const [product, setProduct] = useState(null);

  // LOGO CAROUSEL
  const scrollRef = useRef(null);
  const isPaused = useRef(false);
  const pauseTimer = useRef(null);

  useEffect(() => {
    const loadProduct = async () => {
      const snap = await getDoc(doc(db, "products", id));
      if (snap.exists()) setProduct(snap.data());
    };
    loadProduct();
  }, [id]);

  // LOGO AUTO-SCROLL LOOP
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const slide = () => {
      if (!isPaused.current) {
        el.scrollBy({ left: 2, behavior: "smooth" });
      }
      if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 2) {
        el.scrollTo({ left: 0 });
      }
    };

    const interval = setInterval(slide, 20); // smooth & slow

    return () => clearInterval(interval);
  }, []);

  const pauseScroll = () => {
    isPaused.current = true;
    clearTimeout(pauseTimer.current);
    pauseTimer.current = setTimeout(() => {
      isPaused.current = false;
    }, 1000);
  };

  if (!product)
    return <p className="text-white p-5 text-lg">Loading product...</p>;

  // STORES FOR AVAILABLE ON
  const stores = [
    { name: "Meesho", logo: "/logos/meesho.png" },
    { name: "AJIO", logo: "/logos/ajio.png" },
    { name: "Amazon", logo: "/logos/amazon.png" },
  ];

  // PRICE CARDS
  const priceData = [
    {
      name: "Amazon",
      price: product.amazonPrice,
      offer: product.amazonOffer,
      url: product.amazonUrl,
      logo: "/logos/amazon.png",
    },
    {
      name: "Meesho",
      price: product.meeshoPrice,
      offer: product.meeshoOffer,
      url: product.meeshoUrl,
      logo: "/logos/meesho.png",
    },
    {
      name: "Ajio",
      price: product.ajioPrice,
      offer: product.ajioOffer,
      url: product.ajioUrl,
      logo: "/logos/ajio.png",
    },
  ];

  return (
    <div className="p-4 pb-24">

      {/* Title */}
      <h1 className="text-4xl font-bold text-blue-400 leading-tight">
        {product.name}
      </h1>

      <p className="text-gray-600 mt-2">{product.description}</p>

      {/* Main Image */}
      <div className="mt-4">
        <Image
          src={product.imageUrl}
          alt={product.name}
          width={700}
          height={400}
          className="rounded-3xl border border-blue-200 shadow-lg"
        />
      </div>

      {/* AVAILABLE ON */}
      <h2 className="text-3xl font-bold text-blue-400 mt-6">Available On</h2>

      <div
        ref={scrollRef}
        onTouchStart={pauseScroll}
        onTouchMove={pauseScroll}
        onWheel={pauseScroll}
        className="flex gap-6 overflow-x-scroll no-scrollbar mt-4 py-2 px-1"
      >
        {stores.concat(stores).map((s, i) => (
          <div key={i} className="min-w-[110px] text-center">
            <div className="w-[95px] h-[95px] rounded-full bg-white shadow-xl border border-blue-200 flex items-center justify-center overflow-hidden">
              <Image
                src={s.logo}
                alt={s.name}
                width={60}
                height={60}
                className="object-contain"
              />
            </div>
            <p className="mt-1 text-gray-700 text-lg font-semibold">{s.name}</p>
          </div>
        ))}
      </div>

      {/* Compare Prices */}
      <h2 className="text-3xl font-bold text-blue-400 mt-8">Compare Prices</h2>

      {/* TALL 2.5 PRICE CARDS */}
      <div className="flex overflow-x-scroll gap-5 mt-4 pb-6 no-scrollbar">
        {priceData.map((store, index) => (
          <div
            key={index}
            className="min-w-[64%] bg-white rounded-3xl p-4 border border-blue-200 shadow-xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Image
                  src={store.logo}
                  width={32}
                  height={32}
                  alt={store.name}
                  className="rounded-md"
                />
                <h3 className="text-xl font-bold text-blue-500">
                  {store.name}
                </h3>
              </div>

              <p className="text-2xl font-bold text-blue-500">
                ₹{store.price}
              </p>
            </div>

            {/* Offer */}
            <p className="text-gray-600 mt-2">{store.offer}</p>

            {/* BUY BUTTON */}
            <a
              href={store.url}
              target="_blank"
              className="mt-4 inline-block w-[95px] text-center px-3 py-2 rounded-full shadow-md font-semibold text-black text-lg"
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
