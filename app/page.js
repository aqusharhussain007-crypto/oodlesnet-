"use client";

import { useState, useEffect, useRef } from "react";
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

  // Pause states for sliders
  const [pauseTrending, setPauseTrending] = useState(false);
  const [pauseRecent, setPauseRecent] = useState(false);

  // Refs for slider elements (optional)
  const trendingRef = useRef(null);
  const recentRef = useRef(null);

  /* ---------------- LOAD PRODUCTS + TRENDING ---------------- */
  useEffect(() => {
    async function loadProducts() {
      setLoading(true);
      const snap = await getDocs(collection(db, "products"));
      const items = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      setProducts(items);
      setFiltered(items);

      const sorted = [...items]
        .sort((a, b) => (b.impressions || 0) - (a.impressions || 0))
        .slice(0, 10);
      setTrending(sorted);

      setLoading(false);
    }
    loadProducts();
  }, []);

  /* ---------------- LOAD ADS ---------------- */
  useEffect(() => {
    async function loadAds() {
      const snap = await getDocs(collection(db, "ads"));
      const items = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setAds(items);
    }
    loadAds();
  }, []);

  /* ---------------- LOAD CATEGORIES ---------------- */
  useEffect(() => {
    async function loadCats() {
      const snap = await getDocs(collection(db, "categories"));
      const items = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setCategories(items);
    }
    loadCats();
  }, []);

  /* ---------------- RECENTLY VIEWED (safe for SSR) ---------------- */
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = JSON.parse(localStorage.getItem("recent") || "[]");
    setRecent(stored);
  }, []);

  /* ---------------- CATEGORY FILTER ---------------- */
  function filterByCategory(slug) {
    setSelectedCat(slug);
    if (slug === "all") return setFiltered(products);
    setFiltered(products.filter((p) => p.categorySlug === slug));
  }

  /* ---------------- VOICE SEARCH ---------------- */
  function startVoiceSearch() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      alert("Voice search not supported.");
      return;
    }

    const recog = new SR();
    recog.lang = "en-IN";

    recog.onresult = (e) => {
      setSearch(e.results[0][0].transcript);
    };

    recog.start();
  }

  /* ---------------- TEXT SEARCH ---------------- */
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

  /* ---------------- helper: slider animation style ---------------- */
  // We apply inline animation so we don't rely on Tailwind config
  const sliderStyle = (paused) => ({
    display: "flex",
    gap: "12px",
    // duplicate content technique requires width: max-content on inner container,
    // but here we let flex > overflow hidden on parent handle it.
    animation: `autoSlide 12s linear infinite`,
    animationPlayState: paused ? "paused" : "running",
    alignItems: "center",
  });

  // Inline keyframes inserted to the page (only once). This is safe.
  // If you prefer, move this to globals.css:
  // @keyframes autoSlide { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
  useEffect(() => {
    // Insert keyframes style tag if not already present
    if (typeof document === "undefined") return;
    if (document.getElementById("autoSlideKeyframes")) return;

    const style = document.createElement("style");
    style.id = "autoSlideKeyframes";
    style.innerHTML = `
      @keyframes autoSlide {
        0% { transform: translateX(0); }
        100% { transform: translateX(-50%); }
      }
    `;
    document.head.appendChild(style);
  }, []);

  /* ---------------- handlers for touch/hover to pause/resume ---------------- */
  const onTrendingEnter = () => setPauseTrending(true);
  const onTrendingLeave = () => setPauseTrending(false);
  const onRecentEnter = () => setPauseRecent(true);
  const onRecentLeave = () => setPauseRecent(false);

  /* ---------------- RENDER ---------------- */
  return (
    <main className="page-container">
      {/* SEARCH ROW */}
      <div className="flex items-center gap-2 mt-3 mb-2">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-bar"
            style={{ height: 46, paddingLeft: 14, paddingRight: 42, borderRadius: 12 }}
          />
          {/* Search icon inside input */}
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

        {/* Mic button (restored) */}
        <button
          onClick={startVoiceSearch}
          style={{
            width: 42,
            height: 42,
            borderRadius: 12,
            background: "rgba(0,200,255,0.75)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 10px rgba(0,200,255,0.7)",
          }}
          aria-label="Voice search"
        >
          <svg width="22" height="22" fill="white" viewBox="0 0 24 24">
            <path d="M12 14a3 3 0 003-3V5a3 3 0 00-6 0v6a3 3 0 003 3zm5-3a5 5 0 01-10 0H5a7 7 0 0014 0h-2zm-5 8a7 7 0 007-7h-2a5 5 0 01-10 0H5a7 7 0 007 7zm-1 2h2v3h-2v-3z" />
          </svg>
        </button>
      </div>

      {/* BANNER */}
      <div className="mt-3 px-2">
        <BannerAd ads={ads} />
      </div>

      {/* TRENDING */}
      <h2 className="text-xl font-bold text-blue-500 mt-6 mb-2">Trending Today</h2>

      <div
        className="relative overflow-hidden"
        onMouseEnter={onTrendingEnter}
        onMouseLeave={onTrendingLeave}
        onTouchStart={onTrendingEnter}
        onTouchEnd={onTrendingLeave}
        ref={trendingRef}
      >
        {/* inner container duplicates items for infinite loop */}
        <div
          style={sliderStyle(pauseTrending)}
        >
          {[...trending, ...trending].map((item, idx) => (
            <div
              key={`${item.id}-${idx}`}
              onClick={() => (window.location = `/product/${item.id}`)}
              className="min-w-[120px] bg-white rounded-xl p-2 shadow cursor-pointer text-center"
              style={{ flex: "0 0 auto" }}
            >
              <Image
                src={item.imageUrl}
                width={120}
                height={120}
                alt={item.name}
                className="rounded-md object-cover"
              />
              <p className="text-[0.85rem] mt-1 font-semibold text-blue-700 truncate">
                {item.name}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* RECENTLY VIEWED */}
      {recent && recent.length > 0 && (
        <>
          <h2 className="text-xl font-bold text-blue-500 mt-6 mb-2">Recently Viewed</h2>

          <div
            className="relative overflow-hidden"
            onMouseEnter={onRecentEnter}
            onMouseLeave={onRecentLeave}
            onTouchStart={onRecentEnter}
            onTouchEnd={onRecentLeave}
            ref={recentRef}
          >
            <div style={sliderStyle(pauseRecent)}>
              {[...recent, ...recent].map((item, idx) => (
                <div
                  key={`${item.id}-${idx}`}
                  onClick={() => (window.location = `/product/${item.id}`)}
                  className="min-w-[120px] bg-white rounded-xl p-2 shadow cursor-pointer text-center"
                  style={{ flex: "0 0 auto" }}
                >
                  <Image
                    src={item.imageUrl}
                    width={120}
                    height={120}
                    alt={item.name}
                    className="rounded-md object-cover"
                  />
                  <p className="text-[0.85rem] mt-1 font-semibold text-blue-700 truncate">
                    {item.name}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* CATEGORIES */}
      <h2 className="text-xl font-bold text-blue-500 mt-6 mb-2">Categories</h2>

      <div className="flex overflow-x-auto no-scrollbar gap-3 pb-3">
        <div
          onClick={() => filterByCategory("all")}
          className="min-w-[120px] bg-white rounded-xl p-3 shadow cursor-pointer text-center"
          style={{
            borderColor: selectedCat === "all" ? "#00c3ff" : "transparent",
            background: selectedCat === "all" ? "rgba(0,195,255,0.12)" : "rgba(255,255,255,0.7)",
          }}
        >
          <strong className="text-blue-600">All</strong>
        </div>

        {categories.map((c) => (
          <div
            key={c.id}
            onClick={() => filterByCategory(c.slug)}
            className="min-w-[120px] bg-white rounded-xl p-3 shadow cursor-pointer text-center"
          >
            <div className="text-3xl">{c.icon}</div>
            <div className="font-semibold text-blue-600 mt-1">{c.name}</div>
          </div>
        ))}
      </div>

      {/* PRODUCTS */}
      <h1 className="mt-6 text-blue-500 text-xl font-bold">Products</h1>

      <div className="grid gap-4 mb-10">
        {filtered.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </main>
  );
    }
                                             
