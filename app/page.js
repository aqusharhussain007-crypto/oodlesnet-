"use client";

import { useState, useEffect, useRef } from "react";
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

  /* ---------------- RECENTLY VIEWED ---------------- */
  useEffect(() => {
    if (typeof window === "undefined") return;
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

  /* ---------------- VOICE SEARCH ---------------- */
  function startVoiceSearch() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return alert("Voice search not supported.");

    const recog = new SR();
    recog.lang = "en-IN";
    recog.onresult = (e) => setSearch(e.results[0][0].transcript || "");
    recog.start();
  }

  /* ---------------- FILTER BY CATEGORY ---------------- */
  function filterByCategory(slug) {
    setSelectedCat(slug);
    if (slug === "all") return setFiltered(products);
    setFiltered(products.filter((p) => p.categorySlug === slug));
  }

  /* ---------------- LOWEST PRICE ---------------- */
  const getLowest = (p) =>
    p.store?.length
      ? Math.min(...p.store.map((s) => Number(s.price)))
      : Infinity;

  return (
    <main className="page-container" style={{ padding: 12 }}>
      {/* SEARCH BAR */}
      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
        <div style={{ position: "relative", flex: 1 }}>
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-bar compact"
            style={{ paddingRight: 44 }}
          />

          {/* SEARCH ICON */}
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
            }}
          >
            <path d="M10 2a8 8 0 105.293 14.293l4.707 4.707 1.414-1.414-4.707-4.707A8 8 0 0010 2z" />
          </svg>

          {/* AUTOCOMPLETE */}
          {suggestions.length > 0 && (
            <div className="autocomplete-box">
              {suggestions.map((item) => (
                <div
                  key={item.id}
                  onClick={() => (window.location = `/product/${item.id}`)}
                  style={{ display: "flex", gap: 8, padding: 8 }}
                >
                  <Image
                    src={item.imageUrl}
                    width={42}
                    height={42}
                    alt={item.name}
                    style={{ borderRadius: 8 }}
                  />
                  <div>
                    <strong>{item.name}</strong>
                    <div style={{ color: "#0077aa" }}>
                      ₹
                      {Math.min(
                        ...item.store.map((s) => Number(s.price))
                      ).toLocaleString("en-IN")}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* MIC BUTTON */}
        <button
          onClick={startVoiceSearch}
          style={{
            width: 42,
            height: 42,
            borderRadius: 10,
            background: "#00c6ff",
          }}
        >
          🎤
        </button>
      </div>

      {/* ADS */}
      <div className="mt-3">
        <BannerAd ads={ads} />
      </div>

      {/* TRENDING */}
      <h2 className="section-title">Trending Today</h2>
      <div ref={trendingRef} className="slider-row">
        <InfiniteSlider items={trending} />
      </div>

      {/* RECENTLY VIEWED */}
      {recent.length > 0 && (
        <>
          <h2 className="section-title">Recently Viewed</h2>
          <div ref={recentRef} className="slider-row">
            <InfiniteSlider items={recent} />
          </div>
        </>
      )}

      {/* CATEGORY + FILTER BUTTONS */}
      <div style={{ display: "flex", gap: 8, margin: "14px 0" }}>
        <button
          onClick={() => setCatDrawer(true)}
          className="pill-button"
          style={{ flex: 1 }}
        >
          Categories →
        </button>

        <button
          onClick={() => setDrawerOpen(true)}
          className="pill-button"
          style={{ flex: 1 }}
        >
          Filters →
        </button>
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
         
