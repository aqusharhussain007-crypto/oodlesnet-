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

  // Drawers
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
        const tr = trendingRef.current;
        const rc = recentRef.current;

        if (tr) tr.scrollBy({ left: 2, behavior: "smooth" }); // slow scroll
        if (rc) rc.scrollBy({ left: 2, behavior: "smooth" });
      } catch (e) {}
    }, 40);

    return () => clearInterval(autoScrollInterval.current);
  }, []);

  /* ---------------- FILTER BY CATEGORY ---------------- */
  function filterByCategory(slug) {
    setSelectedCat(slug);

    if (slug === "all") return setFiltered(products);

    setFiltered(products.filter((p) => p.categorySlug === slug));
  }

  /* Helper: lowest store price */
  const getLowest = (p) =>
    p.store?.length
      ? Math.min(...p.store.map((s) => Number(s.price)))
      : Infinity;

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
            <path d="M10 2a8 8 0 105.293 14.293l4.707 4.707 1.414-1.414-4.707-4.707A8 8 0 0010 2zm0 2a6 6 0 110 12A6 6 0 0110 4z" />
          </svg>

          {/* AUTOCOMPLETE */}
          {suggestions.length > 0 && (
            <div className="autocomplete-box" style={{ top: 48 }}>
              {suggestions.map((item) => (
                <div
                  key={item.id}
                  onClick={() => (window.location = `/product/${item.id}`)}
                  style={{ display: "flex", gap: 8, padding: 8, cursor: "pointer" }}
                >
                  <Image
                    src={item.imageUrl || "/placeholder.png"}
                    width={42}
                    height={42}
                    alt={item.name}
                    style={{ borderRadius: 8 }}
                  />

                  <div>
                    <div style={{ fontWeight: 700, color: "#0077aa" }}>{item.name}</div>

                    <div style={{ color: "#0097cc", fontWeight: 800 }}>
                      ₹{item.store?.length
                        ? Math.min(...item.store.map((s) => s.price)).toLocaleString("en-IN")
                        : "N/A"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* MIC */}
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
          🎤
        </button>
      </div>

      {/* Banner Ads */}
      <div className="mt-3 px-1">
        <BannerAd ads={ads} />
      </div>

      {/* Trending */}
      <h2 className="section-title">Trending Today</h2>
      <div ref={trendingRef} className="slider-row no-scrollbar" style={{ marginBottom: 10 }}>
        <InfiniteSlider items={trending} cardStyle="rounded-img" />
      </div>

      {/* Recently Viewed */}
      {recent.length > 0 && (
        <>
          <h2 className="section-title">Recently Viewed</h2>
          <div ref={recentRef} className="slider-row no-scrollbar" style={{ marginBottom: 10 }}>
            <InfiniteSlider items={recent} cardStyle="rounded-img" />
          </div>
        </>
      )}

      {/* NEW CATEGORY + FILTER BUTTONS */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: "12px",
          marginBottom: "16px",
        }}
      >
        {/* CATEGORY BUTTON */}
        <button
          onClick={() => setCatDrawer(true)}
          style={{
            flex: 1,
            height: "38px",
            marginRight: "8px",
            background: "linear-gradient(90deg,#0094ff,#00e0ff)",
            border: "none",
            color: "white",
            borderRadius: "12px",
            fontWeight: "700",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          Categories →
        </button>

        {/* FILTER BUTTON */}
        <button
          onClick={() => setDrawerOpen(true)}
          style={{
            flex: 1,
            height: "38px",
            marginLeft: "8px",
            background: "linear-gradient(90deg,#00c85f,#00f7a0)",
            border: "none",
            color: "white",
            borderRadius: "12px",
            fontWeight: "700",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          Filters →
        </button>
      </div>

      {/* PRODUCTS */}
      <h2 className="section-title" style={{ marginTop: 6 }}>
        Products
      </h2>

      <div className="products-grid">
        {filtered.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* CATEGORY DRAWER */}
      <CategoryDrawer
        isOpen={catDrawer}
        onClose={() => setCatDrawer(false)}
        categories={categories}
        selectedCat={selectedCat}
        onSelect={(slug) => filterByCategory(slug)}
      />

      {/* FILTER DRAWER */}
      <FilterDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        products={products}
        initial={{
          min: 0,
          max: Math.max(
            ...products.map((p) =>
              p.store?.length ? Math.max(...p.store.map((s) => s.price)) : 0
            )
          ),
          sort: "none",
        }}
        onApply={(filters) => {
          let items = [...products];

          if (filters.min != null)
            items = items.filter((p) => getLowest(p) >= Number(filters.min));

          if (filters.max != null)
            items = items.filter((p) => getLowest(p) <= Number(filters.max));

          if (filters.sort === "price-asc")
            items.sort((a, b) => getLowest(a) - getLowest(b));

          if (filters.sort === "price-desc")
            items.sort((a, b) => getLowest(b) - getLowest(a));

          if (filters.sort === "trending")
            items.sort(
              (a, b) => Number(b.impressions || 0) - Number(a.impressions || 0)
            );

          setFiltered(items);
          setDrawerOpen(false);
        }}
      />
    </main>
  );
              }
              
