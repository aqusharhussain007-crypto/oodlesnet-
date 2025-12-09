"use client";

import { useState, useEffect } from "react";
import ProductCard from "@/components/ProductCard";
import BannerAd from "@/components/ads/BannerAd";
import FilterDrawer from "@/components/FilterDrawer";
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
  const [showCatDrawer, setShowCatDrawer] = useState(false);

  /* ---------------- LOAD PRODUCTS ---------------- */
  useEffect(() => {
    async function load() {
      const snap = await getDocs(collection(db, "products"));
      const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

      setProducts(items);
      setFiltered(items);

      const top = [...items]
        .sort((a, b) => (b.impressions || 0) - (a.impressions || 0))
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
    if (typeof window === "undefined") return;
    const data = JSON.parse(localStorage.getItem("recent") || "[]");
    if (Array.isArray(data)) setRecent(data);
  }, []);

  /* ---------------- FILTER BY CATEGORY ---------------- */
  function filterByCategory(slug) {
    setSelectedCat(slug);
    if (slug === "all") setFiltered(products);
    else setFiltered(products.filter((p) => p.categorySlug === slug));
  }

  /* ---------------- SEARCH ---------------- */
  useEffect(() => {
    if (!search) {
      setSuggestions([]);
      setFiltered(products);
      return;
    }

    const match = products.filter((p) =>
      p.name.toLowerCase().includes(search.toLowerCase())
    );

    setSuggestions(match.slice(0, 5));
    setFiltered(match);
  }, [search, products]);

  /* ---------------- VOICE SEARCH ---------------- */
  function startVoiceSearch() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return alert("Voice search not supported");

    const recog = new SR();
    recog.lang = "en-IN";

    recog.onresult = (e) => {
      setSearch(e.results[0][0].transcript);
    };

    recog.start();
  }

  /* ---------------- Mini-card wrappers ---------------- */
  const wrap = { padding: 2, borderRadius: 16, background: "linear-gradient(90deg,#00c6ff,#00ff99)" };

  return (
    <main className="page-container" style={{ padding: 14 }}>

      {/* ---------------- SEARCH ROW ---------------- */}
      <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 12 }}>
        <div style={{ position: "relative", flex: 1 }}>
          <input
            className="search-bar"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {/* Search icon */}
          <svg width="22" height="22" fill="#00c3ff"
            viewBox="0 0 24 24"
            style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)" }}>
            <path d="M10 2a8 8 0 105.293 14.293l4.707 4.707 1.414-1.414-4.707-4.707A8 8 0 0010 2zm0 2a6 6 0 110 12A6 6 0 0110 4z"/>
          </svg>

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div style={{
              position: "absolute",
              top: 52,
              width: "100%",
              background: "white",
              borderRadius: 12,
              boxShadow: "0 4px 14px rgba(0,0,0,0.15)",
              zIndex: 20
            }}>
              {suggestions.map((item) => (
                <div key={item.id}
                  onClick={() => (window.location = `/product/${item.id}`)}
                  style={{ display: "flex", gap: 10, padding: 10, cursor: "pointer" }}>
                  <Image src={item.imageUrl} width={45} height={45} alt="" style={{ borderRadius: 10 }} />
                  <div>
                    <p style={{ fontWeight: 700 }}>{item.name}</p>
                    <p style={{ fontWeight: 800, color: "#0097cc" }}>₹ {item.price}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Category Drawer Toggle */}
        <div
          className="category-toggle"
          onClick={() => setShowCatDrawer((v) => !v)}
        >
          Categories
          <svg width="18" height="18" fill="none"
            style={{ transform: showCatDrawer ? "rotate(180deg)" : "rotate(0deg)", transition: ".2s" }}>
            <path d="M6 9l6 6 6-6" stroke="#fff" strokeWidth="2.2" strokeLinecap="round"/>
          </svg>
        </div>

        {/* Mic */}
        <button
          onClick={startVoiceSearch}
          style={{
            width: 46, height: 46, borderRadius: 12,
            display: "flex", justifyContent: "center", alignItems: "center",
            background: "rgba(0,200,255,0.8)", boxShadow: "0 0 12px rgba(0,200,255,0.6)"
          }}>
          <svg width="22" height="22" fill="#fff" viewBox="0 0 24 24">
            <path d="M12 14a3 3 0 003-3V5a3 3 0 00-6 0v6a3 3 0 003 3z"/>
          </svg>
        </button>
      </div>

      {/* ---------------- CATEGORY DRAWER ---------------- */}
      {showCatDrawer && (
        <div className="category-drawer no-scrollbar">
          <div
            className={`cat-pill ${selectedCat === "all" ? "cat-pill-active" : ""}`}
            onClick={() => filterByCategory("all")}
          >
            All
          </div>

          {categories.map((c) => (
            <div
              key={c.id}
              className={`cat-pill ${selectedCat === c.slug ? "cat-pill-active" : ""}`}
              onClick={() => filterByCategory(c.slug)}
            >
              {c.icon} {c.name}
            </div>
          ))}
        </div>
      )}

      {/* ---------------- BANNER ---------------- */}
      <BannerAd ads={ads} />

      {/* ---------------- TRENDING ---------------- */}
      <h2 className="mt-4">Trending Today</h2>
      <InfiniteSlider items={trending} />

      {/* ---------------- RECENT ---------------- */}
      {recent.length > 0 && (
        <>
          <h2 className="mt-4">Recently Viewed</h2>
          <InfiniteSlider items={recent} />
        </>
      )}

      {/* ---------------- PRODUCT GRID ---------------- */}
      <h2 className="mt-4">Products</h2>
      <div style={{
        display: "grid",
        gap: 16,
        gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))"
      }}>
        {filtered.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* ---------------- FILTER DRAWER ---------------- */}
      <FilterDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        products={products}
        categories={categories}
        onApply={(filters) => {
          setFiltered(products); // placeholder
          setDrawerOpen(false);
        }}
      />
    </main>
  );
                            }
