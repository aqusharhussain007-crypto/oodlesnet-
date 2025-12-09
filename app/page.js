"use client";

import { useState, useEffect, useRef } from "react";
import ProductCard from "@/components/ProductCard";
import BannerAd from "@/components/ads/BannerAd";
import FilterDrawer from "@/components/FilterDrawer";
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

  // filter drawer state + active filters
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    min: null,
    max: null,
    sort: "none",
    discountOnly: false,
  });

  const suggestRef = useRef(null);

  /* ---------------- LOAD PRODUCTS ---------------- */
  useEffect(() => {
    async function loadProducts() {
      const snap = await getDocs(collection(db, "products"));
      const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setProducts(items);
      setFiltered(items);

      const sortedTrend = [...items].sort((a, b) => (b.impressions || 0) - (a.impressions || 0)).slice(0, 10);
      setTrending(sortedTrend);
    }
    loadProducts();
  }, []);

  /* ---------------- LOAD ADS ---------------- */
  useEffect(() => {
    async function loadAds() {
      const snap = await getDocs(collection(db, "ads"));
      setAds(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    }
    loadAds();
  }, []);

  /* ---------------- LOAD CATEGORIES ---------------- */
  useEffect(() => {
    async function loadCats() {
      const snap = await getDocs(collection(db, "categories"));
      setCategories(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    }
    loadCats();
  }, []);

  /* ---------------- RECENT ---------------- */
  useEffect(() => {
    if (typeof window === "undefined") return;
    const data = JSON.parse(localStorage.getItem("recent") || "[]");
    setRecent(data);
  }, []);

  /* ---------------- CATEGORY FILTER ---------------- */
  function filterByCategory(slug) {
    setSelectedCat(slug);
    // apply currently active filters after category change
    applyFilters({ ...activeFilters, category: slug });
  }

  /* ---------------- VOICE SEARCH ---------------- */
  function startVoiceSearch() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return alert("Voice search not supported.");
    const recog = new SR();
    recog.lang = "en-IN";
    recog.onresult = (e) => setSearch(e.results[0][0].transcript);
    recog.start();
  }

  /* ---------------- SEARCH & SUGGESTIONS ---------------- */
  useEffect(() => {
    if (!search) {
      setSuggestions([]);
      // don't overwrite applied filters view
      applyFilters(activeFilters);
      return;
    }
    const match = products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));
    setSuggestions(match.slice(0, 5));
    setFiltered(match); // instant search result
  }, [search, products]);

  /* ---------------- HIDE SUGGESTIONS ON OUTSIDE CLICK ---------------- */
  useEffect(() => {
    function h(e) {
      if (suggestRef.current && !suggestRef.current.contains(e.target)) setSuggestions([]);
    }
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  /* ---------------- APPLY FILTERS LOGIC ---------------- */
  function applyFilters(filters) {
    // save active filters
    setActiveFilters(filters);

    let items = [...products];

    // category filter
    if (filters.category && filters.category !== "all") {
      items = items.filter((p) => p.categorySlug === filters.category);
    } else if (selectedCat && selectedCat !== "all") {
      items = items.filter((p) => p.categorySlug === selectedCat);
    }

    // discount filter
    if (filters.discountOnly) {
      items = items.filter((p) => {
        // treat any non-empty offer field as discounted
        return (p.amazonOffer || p.meeshoOffer || p.ajioOffer || p.offer || "").toString().trim().length > 0;
      });
    }

    // price range
    if (filters.min != null) {
      items = items.filter((p) => Number(p.price || 0) >= Number(filters.min));
    }
    if (filters.max != null) {
      items = items.filter((p) => Number(p.price || 0) <= Number(filters.max));
    }

    // sorting
    if (filters.sort === "price-asc") {
      items.sort((a, b) => (Number(a.price || 0) - Number(b.price || 0)));
    } else if (filters.sort === "price-desc") {
      items.sort((a, b) => (Number(b.price || 0) - Number(a.price || 0)));
    } else if (filters.sort === "trending") {
      items.sort((a, b) => (Number(b.impressions || 0) - Number(a.impressions || 0)));
    } else if (filters.sort === "newest") {
      // assume product has createdAt field (timestamp or ISO). fallback: do nothing
      items.sort((a, b) => {
        const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return tb - ta;
      });
    }

    setFiltered(items);
  }

  /* ---------------- RESET ALL FILTERS ---------------- */
  function resetFilters() {
    setActiveFilters({ min: null, max: null, sort: "none", discountOnly: false });
    setSelectedCat("all");
    setFiltered(products);
  }

  /* ---------------- WHEN PRODUCTS LOAD, re-apply any active filters ---------------- */
  useEffect(() => {
    applyFilters(activeFilters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products]);

  /* ---------------- ICON BUTTON STYLE ---------------- */
  const iconButton = {
    width: "42px",
    height: "42px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "12px",
    background: "rgba(0,200,255,0.75)",
    boxShadow: "0 0 10px rgba(0,200,255,0.7)",
  };

  return (
    <main className="page-container">
      {/* SEARCH + FILTER ROW */}
      <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 12 }}>
        <div style={{ position: "relative", flex: 1 }} ref={suggestRef}>
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-bar"
            style={{ height: 46, paddingLeft: 14, paddingRight: 42, borderRadius: 12 }}
          />
          <svg width="22" height="22" fill="#00c3ff" viewBox="0 0 24 24" className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <path d="M10 2a8 8 0 105.293 14.293l4.707 4.707 1.414-1.414-4.707-4.707A8 8 0 0010 2zm0 2a6 6 0 110 12A6 6 0 0110 4z" />
          </svg>

          {/* Suggestions (unchanged) */}
          {suggestions.length > 0 && (
            <div style={{ position: "absolute", top: 52, width: "100%", background: "white", borderRadius: 14, boxShadow: "0 4px 14px rgba(0,0,0,0.12)", zIndex: 30 }}>
              {suggestions.map((item) => (
                <div key={item.id} onClick={() => (window.location = `/product/${item.id}`)} style={{ display: "flex", gap: 10, padding: "10px 12px", cursor: "pointer", alignItems: "center" }}>
                  <Image src={item.imageUrl} width={50} height={50} alt={item.name} style={{ borderRadius: 10, objectFit: "cover" }} />
                  <div>
                    <div style={{ fontWeight: 700, color: "#0077aa" }}>{item.name}</div>
                    <div style={{ fontWeight: 800, color: "#0097cc" }}>₹ {item.price}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Filter button */}
        <button onClick={() => setDrawerOpen(true)} className="btn-glow" style={{ padding: "10px 12px", borderRadius: 12 }}>
          Filter ▾
        </button>

        {/* Mic */}
        <button onClick={startVoiceSearch} style={iconButton} aria-label="Voice search">
          <svg width="22" height="22" fill="white" viewBox="0 0 24 24">
            <path d="M12 14a3 3 0 003-3V5a3 3 0 00-6 0v6a3 3 0 003 3zm5-3a5 5 0 01-10 0H5a7 7 0 0014 0h-2zm-5 8a7 7 0 007-7h-2a5 5 0 01-10 0H5a7 7 0 007 7zm-1 2h2v3h-2v-3z" />
          </svg>
        </button>
      </div>

      {/* Banner */}
      <div className="mt-2 px-2"><BannerAd ads={ads} /></div>

      {/* Trending, Recent, Categories, Products — unchanged UI below */}
      <h2 className="text-xl font-bold text-blue-500 mt-5 mb-2">Trending Today</h2>
      <div className="flex overflow-x-auto gap-3 no-scrollbar pb-2">
        {trending.map((item) => (
          <div key={item.id} onClick={() => (window.location = `/product/${item.id}`)} style={{ minWidth: 120, background: "white", borderRadius: 14, padding: 10, textAlign: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", cursor: "pointer" }}>
            <Image src={item.imageUrl} width={120} height={120} alt={item.name} style={{ borderRadius: 10, objectFit: "cover" }} />
            <p style={{ marginTop: 4, fontWeight: 600, fontSize: 14, color: "#0077aa" }}>{item.name}</p>
          </div>
        ))}
      </div>

      {recent.length > 0 && (
        <>
          <h2 className="text-xl font-bold text-blue-500 mt-6 mb-2">Recently Viewed</h2>
          <div className="flex overflow-x-auto gap-3 no-scrollbar pb-2">
            {recent.map((item) => (
              <div key={item.id} onClick={() => (window.location = `/product/${item.id}`)} style={{ minWidth: 120, background: "white", borderRadius: 14, padding: 10, textAlign: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", cursor: "pointer" }}>
                <Image src={item.imageUrl} width={120} height={120} alt={item.name} style={{ borderRadius: 10, objectFit: "cover" }} />
                <p style={{ marginTop: 4, fontWeight: 600, fontSize: 14, color: "#0077aa" }}>{item.name}</p>
              </div>
            ))}
          </div>
        </>
      )}

      <h2 className="text-xl font-bold text-blue-500 mt-6 mb-2">Categories</h2>
      <div style={{ display: "flex", gap: 12, overflowX: "auto", whiteSpace: "nowrap", paddingBottom: 8 }}>
        <div onClick={() => filterByCategory("all")} style={{ minWidth: 120, background: selectedCat === "all" ? "rgba(0,195,255,0.15)" : "rgba(255,255,255,0.7)", border: selectedCat === "all" ? "2px solid #00c3ff" : "2px solid #aacbe3", padding: 10, textAlign: "center", borderRadius: 14, cursor: "pointer" }}>
          <strong style={{ color: "#0088cc" }}>All</strong>
        </div>

        {categories.map((c) => (
          <div key={c.id} onClick={() => filterByCategory(c.slug)} style={{ minWidth: 120, background: selectedCat === c.slug ? "rgba(0,195,255,0.15)" : "rgba(255,255,255,0.7)", border: selectedCat === c.slug ? "2px solid #00c3ff" : "2px solid #aacbe3", padding: 10, borderRadius: 14, cursor: "pointer", textAlign: "center" }}>
            <div style={{ fontSize: 30 }}>{c.icon}</div>
            <div style={{ marginTop: 4, color: "#0088cc", fontWeight: 600 }}>{c.name}</div>
          </div>
        ))}
      </div>

      <h1 style={{ marginTop: 18, color: "#00b7ff", fontSize: "1.4rem", fontWeight: 700 }}>Products</h1>
      <div style={{ display: "grid", gap: "0.9rem", gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))", marginBottom: 40 }}>
        {filtered.map((product) => <ProductCard key={product.id} product={product} />)}
      </div>

      {/* Filter Drawer */}
      <FilterDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        products={products}
        categories={categories}
        initial={activeFilters}
        onApply={(filters) => {
          // include currently selected category in filters
          applyFilters({ ...filters, category: selectedCat === "all" ? null : selectedCat });
        }}
      />
    </main>
  );
}
