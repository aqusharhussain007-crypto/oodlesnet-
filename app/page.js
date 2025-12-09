"use client";

import { useState, useEffect, useRef } from "react";
import ProductCard from "@/components/ProductCard";
import BannerAd from "@/components/ads/BannerAd";
import FilterDrawer from "@/components/FilterDrawer";
import { db } from "@/lib/firebase-app";
import { collection, getDocs } from "firebase/firestore";
import Image from "next/image";

/**
 * Page: Home
 * - Auto-scroll trending & recent lists
 * - Single gradient pill for categories (opens drawer)
 * - Gradient fine border applied to small cards via inline styles
 */

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

  // drawer + filters state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    min: null,
    max: null,
    sort: "none",
    discountOnly: false,
    category: null,
  });

  // refs for auto-scroll containers
  const trendingRef = useRef(null);
  const recentRef = useRef(null);
  const autoScrollInterval = useRef(null);

  /* ---------------- LOAD PRODUCTS ---------------- */
  useEffect(() => {
    async function loadProducts() {
      const snap = await getDocs(collection(db, "products"));
      const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setProducts(items);
      setFiltered(items);

      // trending: by impressions
      const sortedTrend = [...items]
        .sort((a, b) => (Number(b.impressions || 0) - Number(a.impressions || 0)))
        .slice(0, 10);
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

  /* ---------------- RECENT FROM localStorage ---------------- */
  useEffect(() => {
    if (typeof window === "undefined") return;
    const data = JSON.parse(localStorage.getItem("recent") || "[]");
    setRecent(Array.isArray(data) ? data : []);
  }, []);

  /* ---------------- FILTERS ---------------- */
  function applyFilters(filters) {
    setActiveFilters(filters);
    let items = [...products];

    // category
    const cat = filters.category || (selectedCat !== "all" ? selectedCat : null);
    if (cat && cat !== "all") items = items.filter((p) => p.categorySlug === cat);

    // discount only
    if (filters.discountOnly) {
      items = items.filter((p) => {
        const offer = (p.amazonOffer || p.meeshoOffer || p.ajioOffer || p.offer || "").toString();
        return offer.trim().length > 0;
      });
    }

    // price range
    if (filters.min != null) items = items.filter((p) => Number(p.price || 0) >= Number(filters.min));
    if (filters.max != null) items = items.filter((p) => Number(p.price || 0) <= Number(filters.max));

    // sort
    if (filters.sort === "price-asc") items.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
    if (filters.sort === "price-desc") items.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
    if (filters.sort === "trending") items.sort((a, b) => Number(b.impressions || 0) - Number(a.impressions || 0));
    if (filters.sort === "newest") items.sort((a, b) => (new Date(b.createdAt || 0) - new Date(a.createdAt || 0)));

    setFiltered(items);
  }

  function filterByCategory(slug) {
    setSelectedCat(slug);
    applyFilters({ ...activeFilters, category: slug === "all" ? null : slug });
  }

  /* ---------------- SEARCH ---------------- */
  useEffect(() => {
    if (!search) {
      setSuggestions([]);
      applyFilters(activeFilters); // restore filtered view
      return;
    }
    const match = products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));
    setSuggestions(match.slice(0, 5));
    setFiltered(match);
  }, [search, products]);

  /* ---------------- VOICE SEARCH ---------------- */
  function startVoiceSearch() {
    if (typeof window === "undefined") return;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return alert("Voice search not supported.");
    const recog = new SR();
    recog.lang = "en-IN";
    recog.onresult = (e) => setSearch(e.results[0][0].transcript || "");
    recog.start();
  }

  /* ---------------- AUTO-SCROLL (Trending & Recent) ---------------- */
  useEffect(() => {
    // auto-scroll helper
    function startAutoScroll(elRef, speed = 2200) {
      if (!elRef?.current) return null;
      // clear existing on that ref if any
      let id = setInterval(() => {
        const el = elRef.current;
        if (!el) return;
        const scrollStep = Math.max(1, Math.round(el.clientWidth * 0.5));
        if (el.scrollWidth - el.scrollLeft <= el.clientWidth + 8) {
          // reached end -> jump back smoothly
          el.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          el.scrollBy({ left: scrollStep, behavior: "smooth" });
        }
      }, speed);
      return id;
    }

    // only run in browser
    if (typeof window !== "undefined") {
      // clear old interval if present
      if (autoScrollInterval.current) {
        clearInterval(autoScrollInterval.current);
        autoScrollInterval.current = null;
      }
      // create combined interval that advances both containers
      // we create *one* interval that advances trending first then recent
      autoScrollInterval.current = setInterval(() => {
        try {
          const tr = trendingRef.current;
          const rc = recentRef.current;
          if (tr) {
            const step = Math.max(1, Math.round(tr.clientWidth * 0.6));
            if (tr.scrollWidth - tr.scrollLeft <= tr.clientWidth + 8) tr.scrollTo({ left: 0, behavior: "smooth" });
            else tr.scrollBy({ left: step, behavior: "smooth" });
          }
          if (rc) {
            const step = Math.max(1, Math.round(rc.clientWidth * 0.6));
            if (rc.scrollWidth - rc.scrollLeft <= rc.clientWidth + 8) rc.scrollTo({ left: 0, behavior: "smooth" });
            else rc.scrollBy({ left: step, behavior: "smooth" });
          }
        } catch (e) {}
      }, 2400);
    }

    return () => {
      if (autoScrollInterval.current) clearInterval(autoScrollInterval.current);
      autoScrollInterval.current = null;
    };
  }, [trending, recent]);

  /* ---------------- small helper: gradient border wrapper ---------------- */
  const gradientWrapperStyle = {
    borderRadius: 14,
    padding: 2,
    background: "linear-gradient(90deg, rgba(0,198,255,0.95), rgba(0,255,150,0.85))",
    // inner background will be white - create a 'frame' effect using padding
  };

  const smallCardInner = {
    background: "#fff",
    borderRadius: 12,
    padding: 8,
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    textAlign: "center",
  };

  return (
    <main className="page-container" style={{ padding: 12 }}>
      {/* Search row */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12 }}>
        <div style={{ position: "relative", flex: 1 }}>
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-bar"
            style={{ height: 46, paddingLeft: 14, paddingRight: 44, borderRadius: 12 }}
          />

          {/* Search icon inside input */}
          <svg width="22" height="22" fill="#00c3ff" viewBox="0 0 24 24" style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
            <path d="M10 2a8 8 0 105.293 14.293l4.707 4.707 1.414-1.414-4.707-4.707A8 8 0 0010 2zm0 2a6 6 0 110 12A6 6 0 0110 4z" />
          </svg>
        </div>

        {/* Category pill (opens drawer) */}
        <button
          onClick={() => setDrawerOpen(true)}
          aria-label="Open categories"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "10px 14px",
            borderRadius: 999,
            border: "none",
            background: "linear-gradient(90deg,#eafffb 0%, #e9fff0 100%)",
            boxShadow: "0 6px 22px rgba(0,198,255,0.08)",
            minWidth: 120,
            justifyContent: "center",
          }}
        >
          <span style={{ color: "#0077aa", fontWeight: 700 }}>{selectedCat === "all" ? "Categories" : (categories.find(c => c.slug === selectedCat)?.name || "Categories")}</span>

          {/* modern chevron arrow */}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ transform: drawerOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform .18s" }}>
            <path d="M6 9l6 6 6-6" stroke="#0077aa" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {/* mic button */}
        <button onClick={startVoiceSearch} style={{ width: 46, height: 46, borderRadius: 12, background: "rgba(0,200,255,0.85)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 10px rgba(0,200,255,0.6)" }}>
          <svg width="22" height="22" fill="white" viewBox="0 0 24 24"><path d="M12 14a3 3 0 003-3V5a3 3 0 00-6 0v6a3 3 0 003 3zm5-3a5 5 0 01-10 0H5a7 7 0 0014 0h-2zm-5 8a7 7 0 007-7h-2a5 5 0 01-10 0H5a7 7 0 007 7zm-1 2h2v3h-2v-3z" /></svg>
        </button>
      </div>

      {/* Banner */}
      <div className="mt-3 px-1">
        <BannerAd ads={ads} />
      </div>

      {/* Trending header */}
      <h2 style={{ marginTop: 18, color: "#0bbcff", textShadow: "0 0 6px rgba(11,188,255,0.25)" }}>Trending Today</h2>

      {/* Trending strip (auto-scrollable + tappable) */}
      <div ref={trendingRef} className="no-scrollbar" style={{ display: "flex", gap: 12, overflowX: "auto", padding: "8px 4px", marginTop: 6 }}>
        {trending.map((item) => (
          <div
            key={item.id}
            onClick={() => (window.location = `/product/${item.id}`)}
            style={{ minWidth: 140, cursor: "pointer" }}
          >
            <div style={gradientWrapperStyle}>
              <div style={{ ...smallCardInner }}>
                <Image src={item.imageUrl} width={140} height={90} alt={item.name} style={{ width: "100%", height: 90, objectFit: "cover", borderRadius: 8 }} />
                <div style={{ marginTop: 8, color: "#0077aa", fontWeight: 700, fontSize: 13 }}>{item.name}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recently viewed */}
      {recent.length > 0 && (
        <>
          <h2 style={{ marginTop: 18, color: "#0bbcff", textShadow: "0 0 6px rgba(11,188,255,0.25)" }}>Recently Viewed</h2>
          <div ref={recentRef} className="no-scrollbar" style={{ display: "flex", gap: 12, overflowX: "auto", padding: "8px 4px", marginTop: 6 }}>
            {recent.map((item) => (
              <div key={item.id} onClick={() => (window.location = `/product/${item.id}`)} style={{ minWidth: 140, cursor: "pointer" }}>
                <div style={gradientWrapperStyle}>
                  <div style={{ ...smallCardInner }}>
                    <Image src={item.imageUrl} width={140} height={90} alt={item.name} style={{ width: "100%", height: 90, objectFit: "cover", borderRadius: 8 }} />
                    <div style={{ marginTop: 8, color: "#0077aa", fontWeight: 700, fontSize: 13 }}>{item.name}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Categories heading */}
      <h2 style={{ marginTop: 20, color: "#0bbcff", textShadow: "0 0 6px rgba(11,188,255,0.25)" }}>Categories</h2>

      {/* Categories inline (small pills) - keep for quick selection */}
      <div style={{ display: "flex", gap: 10, overflowX: "auto", padding: "8px 4px", marginTop: 6 }}>
        <div onClick={() => filterByCategory("all")} style={{ minWidth: 86, padding: 10, borderRadius: 999, background: selectedCat === "all" ? "linear-gradient(90deg,#eafffb,#e9fff0)" : "#fff", border: selectedCat === "all" ? "2px solid rgba(0,198,255,0.6)" : "2px solid rgba(170,203,227,0.6)", textAlign: "center", cursor: "pointer", boxShadow: "0 6px 18px rgba(0,198,255,0.04)" }}>
          <strong style={{ color: "#0077aa" }}>All</strong>
        </div>

        {categories.map((c) => (
          <div key={c.id} onClick={() => filterByCategory(c.slug)} style={{ minWidth: 86, padding: 10, borderRadius: 999, background: selectedCat === c.slug ? "linear-gradient(90deg,#eafffb,#e9fff0)" : "#fff", border: selectedCat === c.slug ? "2px solid rgba(0,198,255,0.6)" : "2px solid rgba(170,203,227,0.6)", textAlign: "center", cursor: "pointer", boxShadow: "0 6px 18px rgba(0,198,255,0.04)" }}>
            <div style={{ fontSize: 16 }}>{c.icon}</div>
            <div style={{ marginTop: 6, color: "#0077aa", fontWeight: 600, fontSize: 13 }}>{c.name}</div>
          </div>
        ))}
      </div>

      {/* Products Grid */}
      <h1 style={{ marginTop: 18, color: "#00b7ff", fontSize: "1.4rem", fontWeight: 700 }}>Products</h1>
      <div style={{ display: "grid", gap: "0.9rem", gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))", marginBottom: 40, marginTop: 10 }}>
        {filtered.map((product) => <ProductCard key={product.id} product={product} />)}
      </div>

      {/* Filter Drawer (pass categories, products) */}
      <FilterDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        products={products}
        categories={categories}
        initial={activeFilters}
        onApply={(filters) => {
          // when user applies filters from drawer, include category state
          applyFilters({ ...filters, category: filters.category || (selectedCat === "all" ? null : selectedCat) });
          setDrawerOpen(false);
        }}
      />
    </main>
  );
  }
                       
