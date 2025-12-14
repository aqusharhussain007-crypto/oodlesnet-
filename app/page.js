"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import BannerAd from "@/components/ads/BannerAd";
import FilterDrawer from "@/components/FilterDrawer";
import CategoryDrawer from "@/components/CategoryDrawer";
import InfiniteSlider from "@/components/InfiniteSlider";
import { db } from "@/lib/firebase-app";
import { collection, getDocs } from "firebase/firestore";
import Image from "next/image";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  const [ads, setAds] = useState([]);
  const [categories, setCategories] = useState([]);

  const [selectedCat, setSelectedCat] = useState("all");
  const [recent, setRecent] = useState([]);
  const [trending, setTrending] = useState([]);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [catDrawer, setCatDrawer] = useState(false);

  const trendingRef = useRef(null);
  const recentRef = useRef(null);
  const autoScrollInterval = useRef(null);

  /* ---------------- LOAD PRODUCTS ---------------- */
  useEffect(() => {
    async function load() {
      const snap = await getDocs(collection(db, "products"));
      const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setProducts(items);
      setFiltered(items);

      const top = [...items]
        .sort((a, b) => Number(b.impressions || 0) - Number(a.impressions || 0))
        .slice(0, 10);
      setTrending(top);
    }
    load();
  }, []);

  /* ---------------- LOAD ADS ---------------- */
  useEffect(() => {
    async function load() {
      const snap = await getDocs(collection(db, "ads"));
      setAds(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    }
    load();
  }, []);

  /* ---------------- LOAD CATEGORIES ---------------- */
  useEffect(() => {
    async function load() {
      const snap = await getDocs(collection(db, "categories"));
      setCategories(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    }
    load();
  }, []);

  /* ---------------- RECENT ---------------- */
  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("recent") || "[]");
    setRecent(Array.isArray(data) ? data : []);
  }, []);

  /* ---------------- SEARCH ---------------- */
  useEffect(() => {
    if (!search) {
      setSuggestions([]);
      setFiltered(products);
      return;
    }

    const match = products.filter((p) =>
      (p.name || "").toLowerCase().includes(search.toLowerCase())
    );

    setSuggestions(match.slice(0, 5));
    setFiltered(match);
  }, [search, products]);

  function startVoiceSearch() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return alert("Voice search not supported.");

    const recog = new SR();
    recog.lang = "en-IN";
    recog.onresult = (e) => setSearch(e.results[0][0].transcript || "");
    recog.start();
  }

  /* ---------------- AUTO SCROLL ---------------- */
  useEffect(() => {
    autoScrollInterval.current = setInterval(() => {
      try {
        trendingRef.current?.scrollBy({ left: 1, behavior: "smooth" });
        recentRef.current?.scrollBy({ left: 1, behavior: "smooth" });
      } catch {}
    }, 35);

    return () => clearInterval(autoScrollInterval.current);
  }, []);

  /* ---------------- FILTER BY CATEGORY ---------------- */
  function filterByCategory(slug) {
    setSelectedCat(slug);
    if (slug === "all") return setFiltered(products);
    setFiltered(products.filter((p) => p.categorySlug === slug));
  }

  return (
    <main className="page-container" style={{ padding: 12 }}>
      {/* SEARCH BAR */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
        <div style={{ position: "relative", flex: 1 }}>
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-bar compact"
            style={{ height: 40, paddingLeft: 12, paddingRight: 42, borderRadius: 12 }}
          />

          {/* Search Icon */}
          <svg
            width="20"
            height="20"
            fill="#00c3ff"
            viewBox="0 0 24 24"
            style={{
              position: "absolute",
              right: 12,
              top: "50%",
              transform: "translateY(-50%)",
              pointerEvents: "none",
            }}
          >
            <path d="M10 2a8 8 0 105.293 14.293l4.707 4.707 1.414-1.414-4.707-4.707A8 8 0 0010 2z" />
          </svg>
        </div>

        {/* MIC (SVG – unchanged) */}
        <button
          onClick={startVoiceSearch}
          style={{
            width: 42,
            height: 42,
            borderRadius: 10,
            background: "rgba(0,200,255,0.85)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
            <path d="M12 14a3 3 0 003-3V5a3 3 0 00-6 0v6a3 3 0 003 3zm5-3a5 5 0 01-10 0H5a7 7 0 0014 0h-2zM11 19.93V23h2v-3.07A9 9 0 0021 12h-2a7 7 0 01-14 0H3a9 9 0 008 7.93z"/>
          </svg>
        </button>
      </div>

      {/* Banner Ads */}
      <div className="mt-3 px-1">
        <BannerAd ads={ads} />
      </div>

      {/* Trending */}
      <h2 className="section-title">Trending Today</h2>
      <div ref={trendingRef} className="slider-row no-scrollbar">
        <InfiniteSlider items={trending} cardStyle="rounded-img" />
      </div>

      {/* Recently Viewed */}
      {recent.length > 0 && (
        <>
          <h2 className="section-title">Recently Viewed</h2>
          <div ref={recentRef} className="slider-row no-scrollbar">
            <InfiniteSlider items={recent} cardStyle="rounded-img" />
          </div>
        </>
      )}

      {/* 🔥 SEO STEP 8 – INTERNAL CATEGORY LINKS (ONLY ADDITION) */}
      <div style={{ margin: "14px 0", display: "flex", gap: 10, flexWrap: "wrap" }}>
        <Link href="/category/mobile" className="cat-pill">Mobiles</Link>
        <Link href="/category/laptop" className="cat-pill">Laptops</Link>
        <Link href="/category/electronics" className="cat-pill">Electronics</Link>
      </div>

      {/* PRODUCTS */}
      <h2 className="section-title">Products</h2>
      <div className="products-grid">
        {filtered.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* DRAWERS */}
      <CategoryDrawer
        isOpen={catDrawer}
        onClose={() => setCatDrawer(false)}
        categories={categories}
        selectedCat={selectedCat}
        onSelect={filterByCategory}
      />

      <FilterDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        products={products}
        onApply={(items) => setFiltered(items)}
      />
    </main>
  );
                                           }
                                    
