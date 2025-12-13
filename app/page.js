"use client";

import { useState, useEffect, useRef } from "react";
import ProductCard from "@/components/ProductCard";
import BannerAd from "@/components/ads/BannerAd";
import FilterDrawer from "@/components/FilterDrawer";
import InfiniteSlider from "@/components/InfiniteSlider";
import CompareDrawer from "@/components/CompareDrawer";   // ✅ Added
import { db } from "@/lib/firebase-app";
import { collection, getDocs } from "firebase/firestore";
import Image from "next/image";

export default function Home() {
  const [catDrawer, setCatDrawer] = useState(false);

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

  // 👉 NEW: Compare drawer state
  const [compareOpen, setCompareOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

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
    if (typeof window === "undefined") return;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return alert("Voice search not supported.");
    const recog = new SR();
    recog.lang = "en-IN";
    recog.onresult = (e) => setSearch(e.results[0][0].transcript || "");
    recog.start();
  }

  /* ---------------- AUTO-SCROLL ---------------- */
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (autoScrollInterval.current) {
      clearInterval(autoScrollInterval.current);
      autoScrollInterval.current = null;
    }

    autoScrollInterval.current = setInterval(() => {
      try {
        const tr = trendingRef.current;
        const rc = recentRef.current;
        if (tr) {
          const step = Math.round(tr.clientWidth * 0.5);
          if (tr.scrollWidth - tr.scrollLeft <= tr.clientWidth + 8)
            tr.scrollTo({ left: 0, behavior: "smooth" });
          else tr.scrollBy({ left: step, behavior: "smooth" });
        }
        if (rc) {
          const step = Math.round(rc.clientWidth * 0.5);
          if (rc.scrollWidth - rc.scrollLeft <= rc.clientWidth + 8)
            rc.scrollTo({ left: 0, behavior: "smooth" });
          else rc.scrollBy({ left: step, behavior: "smooth" });
        }
      } catch (e) {}
    }, 2600);

    return () => {
      if (autoScrollInterval.current) clearInterval(autoScrollInterval.current);
      autoScrollInterval.current = null;
    };
  }, [trending, recent]);

  /* ---------------- FILTER CATEGORY ---------------- */
  function filterByCategory(slug) {
    setSelectedCat(slug);
    if (slug === "all") setFiltered(products);
    else setFiltered(products.filter((p) => p.categorySlug === slug));
  }

  /* ---------------- COMPARE DRAWER HANDLER ---------------- */
  function openCompare(product) {
    setSelectedProduct(product);
    setCompareOpen(true);
  }

  const gradientFrame = {
    padding: 3,
    borderRadius: 14,
    background:
      "linear-gradient(180deg, rgba(0,198,255,0.95), rgba(0,255,150,0.85))",
    display: "inline-block",
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
            <path d="M10 2a8 8 0 105.293 14.293l4.707 4.707 1.414-1.414-4.707-4.707A8 8 0 0010 2zm0 2a6 6 0 110 12A6 6 0 0110 4z" />
          </svg>

          {/* suggestions */}
          {suggestions.length > 0 && (
            <div className="autocomplete-box" style={{ top: 48 }}>
              {suggestions.map((item) => (
                <div
                  key={item.id}
                  onClick={() => (window.location = `/product/${item.id}`)}
                  style={{
                    display: "flex",
                    gap: 8,
                    padding: 8,
                    alignItems: "center",
                    cursor: "pointer",
                  }}
                >
                  <Image
                    src={item.imageUrl || "/placeholder.png"}
                    width={42}
                    height={42}
                    alt={item.name || "img"}
                    style={{ borderRadius: 8, objectFit: "cover" }}
                  />
                  <div>
                    <div style={{ fontWeight: 700, color: "#0077aa" }}>
                      {item.name}
                    </div>
                    <div style={{ color: "#0097cc", fontWeight: 800 }}>
  ₹
  {item.store && item.store.length
    ? Math.min(...item.store.map((s) => Number(s.price))).toLocaleString("en-IN")
    : "N/A"}
</div>
                 </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* category pill that opens drawer */}
        <button
          onClick={() => setDrawerOpen(true)}
          aria-label="Open filters"
          className="pill-button"
          style={{ minWidth: 100, height: 40 }}
        >
          <span style={{ fontWeight: 700, color: "#0077aa" }}>Filter ▾</span>
        </button>

        {/* mic */}
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
            boxShadow: "0 0 10px rgba(0,200,255,0.6)",
          }}
        >
          <svg width="18" height="18" fill="white" viewBox="0 0 24 24">
            <path d="M12 14a3 3 0 003-3V5a3 3 0 00-6 0v6a3 3 0 003 3z" />
          </svg>
        </button>
      </div>

      {/* Banner */}
      <div className="mt-3 px-1">
        <BannerAd ads={ads} />
      </div>

      {/* Trending */}
      <h2 className="section-title">Trending Today</h2>
      <div
        ref={trendingRef}
        className="slider-row no-scrollbar"
        style={{ marginBottom: 6 }}
      >
        <InfiniteSlider items={trending} cardStyle="rounded-img" />
      </div>

      {/* Recently */}
      {recent.length > 0 && (
        <>
          <h2 className="section-title">Recently Viewed</h2>
          <div ref={recentRef} className="slider-row no-scrollbar">
            <InfiniteSlider items={recent} cardStyle="rounded-img" />
          </div>
        </>
      )}

      {/* Categories pills */}
      <h2 className="section-title" style={{ marginTop: 16 }}>
        Categories
      </h2>
      <div className="cat-pills-row no-scrollbar" style={{ marginBottom: 12 }}>
        <div
          className={`cat-pill ${selectedCat === "all" ? "active" : ""}`}
          onClick={() => filterByCategory("all")}
        >
          All
        </div>
        {categories.map((c) => (
          <div
            key={c.id}
            className={`cat-pill ${selectedCat === c.slug ? "active" : ""}`}
            onClick={() => filterByCategory(c.slug)}
          >
            <span style={{ marginRight: 6 }}>{c.icon}</span>
            <span>{c.name}</span>
          </div>
        ))}
      </div>

      {/* Products grid */}
      <h2 className="section-title" style={{ marginTop: 6 }}>
        Products
      </h2>
      <div className="products-grid">
        {filtered.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onOpenCompare={openCompare} // ✅ Added
          />
        ))}
      </div>

      {/* Filter Drawer */}
      <FilterDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        products={products}
        categories={categories}
        initial={{
          min: 1,
          max: Math.max(...products.map((p) => Number(p.price || 0)), 1),
          sort: "none",
          discountOnly: false,
        }}
        onApply={(filters) => {
          let items = [...products];
          if (filters.min != null)
            items = items.filter(
              (p) => Number(p.price || 0) >= Number(filters.min)
            );
          if (filters.max != null)
            items = items.filter(
              (p) => Number(p.price || 0) <= Number(filters.max)
            );
          if (filters.discountOnly)
            items = items.filter(
              (p) =>
                (p.offer || p.amazonOffer || p.meeshoOffer || "")
                  .toString()
                  .trim().length > 0
            );
          if (filters.sort === "price-asc")
            items.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
          if (filters.sort === "price-desc")
            items.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
          if (filters.sort === "trending")
            items.sort(
              (a, b) => Number(b.impressions || 0) - Number(a.impressions || 0)
            );
          setFiltered(items);
          setDrawerOpen(false);
        }}
      />

      {/* Compare Drawer — NEW */}
      <CompareDrawer
        open={compareOpen}
        product={selectedProduct}
        onClose={() => setCompareOpen(false)}
      />
    </main>
  );
        }
    
