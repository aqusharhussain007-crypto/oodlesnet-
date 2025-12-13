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

  const [openFilter, setOpenFilter] = useState(false);
  const [openCategory, setOpenCategory] = useState(false);

  const trendingRef = useRef(null);
  const recentRef = useRef(null);

  /* LOAD PRODUCTS */
  useEffect(() => {
    async function load() {
      const snap = await getDocs(collection(db, "products"));
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));

      setProducts(items);
      setFiltered(items);

      const trendingList = [...items]
        .sort((a, b) => (b.impressions || 0) - (a.impressions || 0))
        .slice(0, 10);

      setTrending(trendingList);
    }
    load();
  }, []);

  /* LOAD ADS */
  useEffect(() => {
    async function load() {
      const snap = await getDocs(collection(db, "ads"));
      setAds(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }
    load();
  }, []);

  /* LOAD CATEGORIES */
  useEffect(() => {
    async function load() {
      const snap = await getDocs(collection(db, "categories"));
      setCategories(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }
    load();
  }, []);

  /* LOAD RECENT */
  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("recent") || "[]");
    if (Array.isArray(data)) setRecent(data);
  }, []);

  /* SEARCH LOGIC */
  useEffect(() => {
    if (!search) {
      setSuggestions([]);
      setFiltered(products);
      return;
    }

    const match = products.filter(p =>
      (p.name || "").toLowerCase().includes(search.toLowerCase())
    );

    setSuggestions(match.slice(0, 5));
    setFiltered(match);
  }, [search, products]);

  /* GET LOWEST PRICE */
  const lowestPrice = (p) =>
    p.store?.length ? Math.min(...p.store.map(s => Number(s.price))) : Infinity;

  /* CATEGORY FILTER */
  function filterByCategory(slug) {
    setSelectedCat(slug);
    if (slug === "all") setFiltered(products);
    else setFiltered(products.filter(p => p.categorySlug === slug));
  }

  /* ----------------------------------------------- */
  /* AUTO-SCROLL (Trending + Recent Very Slow Loop)  */
  /* ----------------------------------------------- */
  useEffect(() => {
    const speed = 0.25;
    let rafId;

    function loop() {
      // Trending
      if (trendingRef.current) {
        trendingRef.current.scrollLeft += speed;
        if (
          trendingRef.current.scrollLeft + trendingRef.current.clientWidth >=
          trendingRef.current.scrollWidth
        ) {
          trendingRef.current.scrollLeft = 0;
        }
      }

      // Recently viewed
      if (recentRef.current) {
        recentRef.current.scrollLeft += speed;
        if (
          recentRef.current.scrollLeft + recentRef.current.clientWidth >=
          recentRef.current.scrollWidth
        ) {
          recentRef.current.scrollLeft = 0;
        }
      }

      rafId = requestAnimationFrame(loop);
    }

    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, [trending, recent]);

  /* ----------------------------------------------- */

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
            style={{
              height: 40,
              paddingLeft: 12,
              paddingRight: 42,
              borderRadius: 12,
              width: "100%",
            }}
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

          {/* SEARCH SUGGESTIONS */}
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
                    src={item.imageUrl}
                    width={42}
                    height={42}
                    alt={item.name}
                    style={{ borderRadius: 8 }}
                  />
                  <div>
                    <div style={{ fontWeight: 700 }}>{item.name}</div>
                    <div style={{ color: "#0077b6", fontWeight: 800 }}>
                      ₹{lowestPrice(item).toLocaleString("en-IN")}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* MIC BUTTON (FIXED SVG) */}
        <button
          onClick={() => {
            const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (!SR) return alert("Voice search not supported");
            const recog = new SR();
            recog.lang = "en-IN";
            recog.onresult = (e) => setSearch(e.results[0][0].transcript);
            recog.start();
          }}
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
          <svg
            width="20"
            height="20"
            fill="white"
            viewBox="0 0 24 24"
          >
            <path d="M12 14a3 3 0 003-3V5a3 3 0 00-6 0v6a3 3 0 003 3z" />
            <path d="M19 11a1 1 0 10-2 0 5 5 0 01-10 0 1 1 0 10-2 0 7 7 0 006 6.92V21H9a1 1 0 100 2h6a1 1 0 100-2h-2v-3.08A7 7 0 0019 11z" />
          </svg>
        </button>
      </div>

      {/* BANNERS */}
      <div className="mt-3 px-1">
        <BannerAd ads={ads} />
      </div>

      {/* TRENDING */}
      <h2 className="section-title">Trending Today</h2>
      <div ref={trendingRef} className="slider-row no-scrollbar">
        <InfiniteSlider items={trending} cardStyle="rounded-img" />
      </div>

      {/* RECENTLY VIEWED */}
      {recent.length > 0 && (
        <>
          <h2 className="section-title">Recently Viewed</h2>
          <div ref={recentRef} className="slider-row no-scrollbar">
            <InfiniteSlider items={recent} cardStyle="rounded-img" />
          </div>
        </>
      )}

      {/* CATEGORY PILLS */}
      <h2 className="section-title" style={{ marginTop: 16 }}>
        Categories
      </h2>
      <div className="cat-pills-row no-scrollbar">
        <div
          className={`cat-pill ${selectedCat === "all" ? "active" : ""}`}
          onClick={() => filterByCategory("all")}
        >
          All
        </div>

        {categories.map(c => (
          <div
            key={c.id}
            className={`cat-pill ${selectedCat === c.slug ? "active" : ""}`}
            onClick={() => filterByCategory(c.slug)}
          >
            {c.icon} {c.name}
          </div>
        ))}
      </div>

      {/* PRODUCTS GRID */}
      <h2 className="section-title" style={{ marginTop: 12 }}>Products</h2>
      <div className="products-grid">
        {filtered.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* CATEGORY DRAWER */}
      <CategoryDrawer
        isOpen={openCategory}
        onClose={() => setOpenCategory(false)}
        categories={categories}
        selectedCat={selectedCat}
        onSelect={filterByCategory}
      />

      {/* FILTER DRAWER */}
      <FilterDrawer
        isOpen={openFilter}
        onClose={() => setOpenFilter(false)}
        products={products}
        categories={categories}
        initial={{
          min: 0,
          max: Math.max(...products.map(p => lowestPrice(p))),
          sort: "none",
          discountOnly: false,
        }}
        onApply={(filters) => {
          let items = [...products];

          if (filters.min != null)
            items = items.filter(p => lowestPrice(p) >= filters.min);

          if (filters.max != null)
            items = items.filter(p => lowestPrice(p) <= filters.max);

          if (filters.discountOnly)
            items = items.filter(p =>
              p.store?.some(s => (s.offer || "").trim())
            );

          if (filters.sort === "price-asc")
            items.sort((a, b) => lowestPrice(a) - lowestPrice(b));

          if (filters.sort === "price-desc")
            items.sort((a, b) => lowestPrice(b) - lowestPrice(a));

          if (filters.sort === "trending")
            items.sort((a, b) => (b.impressions || 0) - (a.impressions || 0));

          setFiltered(items);
          setOpenFilter(false);
        }}
      />
    </main>
  );
    }
                
