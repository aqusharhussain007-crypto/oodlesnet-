"use client";

import { useState, useEffect } from "react";
import ProductCard from "@/components/ProductCard";
import { db } from "@/lib/firebase-app";
import { collection, getDocs } from "firebase/firestore";
import BannerAd from "@/components/ads/BannerAd";
import Image from "next/image";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [ads, setAds] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCat, setSelectedCat] = useState("all");

  const [recent, setRecent] = useState([]);
  const [trending, setTrending] = useState([]);

  const [loading, setLoading] = useState(true);

  /* ------------------------------------
        LOAD PRODUCTS + TRENDING
  ------------------------------------ */
  useEffect(() => {
    async function loadProducts() {
      setLoading(true);

      const snap = await getDocs(collection(db, "products"));
      const items = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      setProducts(items);
      setFiltered(items);

      // trending = highest impressions
      const sorted = [...items]
        .sort((a, b) => (b.impressions || 0) - (a.impressions || 0))
        .slice(0, 10);
      setTrending(sorted);

      setLoading(false);
    }
    loadProducts();
  }, []);

  /* ------------------------------------
               LOAD ADS
  ------------------------------------ */
  useEffect(() => {
    async function loadAds() {
      const snap = await getDocs(collection(db, "ads"));
      const items = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setAds(items);
    }
    loadAds();
  }, []);

  /* ------------------------------------
           LOAD CATEGORIES
  ------------------------------------ */
  useEffect(() => {
    async function loadCats() {
      const snap = await getDocs(collection(db, "categories"));
      const items = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setCategories(items);
    }
    loadCats();
  }, []);

  /* ------------------------------------
           LOAD RECENTLY VIEWED
  ------------------------------------ */
  useEffect(() => {
    if (typeof window === "undefined") return;

    const data = JSON.parse(localStorage.getItem("recent") || "[]");
    setRecent(data);
  }, []);

  /* ------------------------------------
          CATEGORY FILTER
  ------------------------------------ */
  function filterByCategory(slug) {
    setSelectedCat(slug);

    if (slug === "all") return setFiltered(products);
    setFiltered(products.filter((p) => p.categorySlug === slug));
  }

  /* ------------------------------------
            VOICE SEARCH
  ------------------------------------ */
  function startVoiceSearch() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return alert("Voice search not supported.");

    const recog = new SR();
    recog.lang = "en-IN";

    recog.onresult = (e) => {
      setSearch(e.results[0][0].transcript);
    };

    recog.start();
  }

  /* ------------------------------------
            TEXT SEARCH
  ------------------------------------ */
  useEffect(() => {
    if (!search) {
      setFiltered(products);
      return;
    }

    const match = products.filter((p) =>
      p.name.toLowerCase().includes(search.toLowerCase())
    );

    setFiltered(match);
  }, [search, products]);

  /* ------------------------------------
               UI STARTS
  ------------------------------------ */
  return (
    <main className="page-container">
      {/* -------------------------------- SEARCH BAR ------------------------------- */}
      <div className="flex items-center gap-2 mt-3">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-bar"
            style={{
              height: "46px",
              paddingLeft: "14px",
              paddingRight: "42px",
              borderRadius: "12px",
            }}
          />

          {/* Search Icon */}
          <svg
            width="22"
            height="22"
            fill="#00c3ff"
            viewBox="0 0 24 24"
            className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
          >
            <path d="M10 2a8 8 0 105.293 14.293l4.707 4.707 1.414-1.414-4.707-4.707A8 8 0 0010 2zm0 2a6 6 0 110 12A6 6 0 0110 4z" />
          </svg>
        </div>

        {/* Mic Button */}
        <button
          onClick={startVoiceSearch}
          className="rounded-xl p-2"
          style={{
            width: "42px",
            height: "42px",
            background: "rgba(0,200,255,0.75)",
            boxShadow: "0 0 10px rgba(0,200,255,0.7)",
          }}
        >
          <svg width="22" height="22" fill="white" viewBox="0 0 24 24">
            <path d="M12 14a3 3 0 003-3V5a3 3 0 00-6 0v6a3 3 0 003 3zm5-3a5 5 0 01-10 0H5a7 7 0 0014 0h-2zm-5 8a7 7 0 007-7h-2a5 5 0 01-10 0H5a7 7 0 007 7zm-1 2h2v3h-2v-3z" />
          </svg>
        </button>
      </div>

      {/* -------------------------------- BANNER ------------------------------- */}
      <div className="mt-3 px-2">
        <BannerAd ads={ads} />
      </div>

      {/* ---------------- TRENDING TODAY ---------------- */}
<h2 className="text-xl font-bold text-blue-500 mt-6 mb-2">
  Trending Today
</h2>

<div className="overflow-hidden relative">
  <div
    className="flex gap-3 no-scrollbar animate-[autoSlide_12s_linear_infinite]"
  >
    {[...trending, ...trending].map((item, index) => (
      <div
        key={index}
        onClick={() => (window.location = `/product/${item.id}`)}
        className="min-w-[120px] bg-white rounded-xl p-2 shadow cursor-pointer text-center"
      >
        <Image
          src={item.imageUrl}
          width={120}
          height={120}
          alt={item.name}
          className="rounded-md object-cover"
        />
        <p className="text-[0.85rem] mt-1 font-semibold text-blue-700">
          {item.name}
        </p>
      </div>
    ))}
  </div>
</div>
          

      {/* ---------------- RECENTLY VIEWED ---------------- */}
{recent.length > 0 && (
  <>
    <h2 className="text-xl font-bold text-blue-500 mt-6 mb-2">
      Recently Viewed
    </h2>

    <div className="overflow-hidden relative">
      <div
        className="flex gap-3 no-scrollbar animate-[autoSlide_12s_linear_infinite]"
      >
        {[...recent, ...recent].map((item, index) => (
          <div
            key={index}
            onClick={() => (window.location = `/product/${item.id}`)}
            className="min-w-[120px] bg-white rounded-xl p-2 shadow cursor-pointer text-center"
          >
            <Image
              src={item.imageUrl}
              width={120}
              height={120}
              alt={item.name}
              className="rounded-md object-cover"
            />
            <p className="text-[0.85rem] mt-1 font-semibold text-blue-700">
              {item.name}
            </p>
          </div>
        ))}
      </div>
    </div>
  </>
)}

      {/* -------------------------------- CATEGORIES ------------------------------- */}
      <h2 className="text-xl font-bold text-blue-500 mt-6 mb-2">
        Categories
      </h2>

      <div className="flex overflow-x-auto no-scrollbar gap-3 pb-3">
        {/* ALL */}
        <div
          onClick={() => filterByCategory("all")}
          className="min-w-[120px] bg-white border rounded-xl p-3 cursor-pointer text-center"
          style={{
            borderColor:
              selectedCat === "all" ? "#00c3ff" : "rgba(0,0,0,0.15)",
            background:
              selectedCat === "all"
                ? "rgba(0,195,255,0.15)"
                : "rgba(255,255,255,0.7)",
          }}
        >
          <strong className="text-blue-600">All</strong>
        </div>

        {categories.map((cat) => (
          <div
            key={cat.id}
            onClick={() => filterByCategory(cat.slug)}
            className="min-w-[120px] bg-white border rounded-xl p-3 cursor-pointer text-center"
            style={{
              borderColor:
                selectedCat === cat.slug ? "#00c3ff" : "rgba(0,0,0,0.15)",
              background:
                selectedCat === cat.slug
                  ? "rgba(0,195,255,0.15)"
                  : "rgba(255,255,255,0.7)",
            }}
          >
            <div className="text-3xl">{cat.icon}</div>
            <div className="mt-1 text-blue-600 font-semibold">{cat.name}</div>
          </div>
        ))}
      </div>

      {/* -------------------------------- PRODUCT GRID ------------------------------- */}
      <h1 className="mt-6 text-blue-500 text-xl font-bold">Products</h1>

      <div className="grid gap-4 mb-10">
        {filtered.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </main>
  );
  }
       
