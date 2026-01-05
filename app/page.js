"use client";

import { useState, useEffect, useContext } from "react";
import ProductCard from "@/components/ProductCard";
import BannerAd from "@/components/ads/BannerAd";
import InfiniteSlider from "@/components/InfiniteSlider";
import FilterDrawer from "@/components/FilterDrawer";
import CategoryDrawer from "@/components/CategoryDrawer";
import { db } from "@/lib/firebase-app";
import { collection, getDocs } from "firebase/firestore";
import Image from "next/image";
import { DrawerContext } from "@/components/DrawerProvider";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  const [ads, setAds] = useState([]);
  const [recent, setRecent] = useState([]);
  const [trending, setTrending] = useState([]);

  const [activeCategory, setActiveCategory] = useState("all");
  const [filters, setFilters] = useState(null);

  const {
    openCategory,
    setOpenCategory,
    openFilter,
    setOpenFilter,
  } = useContext(DrawerContext);

  /* ---------------- LOAD PRODUCTS ---------------- */
  useEffect(() => {
    async function load() {
      const snap = await getDocs(collection(db, "products"));
      const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

      setProducts(items);
      setFiltered(items);

      const top = [...items]
        .sort(
          (a, b) =>
            Number(b.impressions || 0) -
            Number(a.impressions || 0)
        )
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

  /* ---------------- RECENTLY VIEWED ---------------- */
  useEffect(() => {
    if (typeof window === "undefined") return;
    const data = JSON.parse(localStorage.getItem("recent") || "[]");
    setRecent(Array.isArray(data) ? data : []);
  }, []);

  /* ---------------- SEARCH + CATEGORY + FILTER ---------------- */
  useEffect(() => {
    let list = products;

    if (activeCategory !== "all") {
      list = list.filter(
        (p) => p.categorySlug === activeCategory
      );
    }

    if (search) {
      list = list.filter((p) =>
        (p.name || "")
          .toLowerCase()
          .includes(search.toLowerCase())
      );
      setSuggestions(list.slice(0, 5));
    } else {
      setSuggestions([]);
    }

    if (filters) {
      if (filters.min)
        list = list.filter(
          (p) => Number(p.price) >= Number(filters.min)
        );

      if (filters.max)
        list = list.filter(
          (p) => Number(p.price) <= Number(filters.max)
        );

      if (filters.stores?.length)
        list = list.filter((p) =>
          p.store?.some((s) =>
            filters.stores.includes(s.name)
          )
        );

      if (filters.inStockOnly)
        list = list.filter((p) => p.inStock);

      if (filters.discountOnly)
        list = list.filter(
          (p) =>
            p.originalPrice &&
            p.originalPrice > p.price
        );

      if (filters.sort === "price-asc")
        list = [...list].sort(
          (a, b) => a.price - b.price
        );

      if (filters.sort === "price-desc")
        list = [...list].sort(
          (a, b) => b.price - a.price
        );
    }

    setFiltered(list);
  }, [search, products, activeCategory, filters]);

  /* ---------------- VOICE SEARCH ---------------- */
  function startVoiceSearch() {
    const SR =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;
    if (!SR) return alert("Voice search not supported");

    const recog = new SR();
    recog.lang = "en-IN";
    recog.onresult = (e) =>
      setSearch(e.results[0][0].transcript || "");
    recog.start();
  }

  return (
    <main className="page-container" style={{ padding: 12 }}>
      {/* SEARCH */}
      <div style={{ display: "flex", gap: 8 }}>
        <div style={{ position: "relative", flex: 1 }}>
          <input
            className="search-bar compact"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingRight: 44 }}
          />

          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="#00c3ff"
            style={{
              position: "absolute",
              right: 12,
              top: "50%",
              transform: "translateY(-50%)",
            }}
          >
            <path d="M10 2a8 8 0 105.293 14.293l4.707 4.707 1.414-1.414-4.707-4.707A8 8 0 0010 2z" />
          </svg>

          {suggestions.length > 0 && (
            <div
              className="autocomplete-box"
              style={{
                position: "absolute",
                top: 48,
                width: "100%",
                background: "white",
                borderRadius: 10,
                zIndex: 1000,
              }}
            >
              {suggestions.map((item) => (
                <div
                  key={item.id}
                  onClick={() =>
                    (window.location.href = `/product/${item.id}`)
                  }
                  style={{
                    display: "flex",
                    gap: 8,
                    padding: 8,
                  }}
                >
                  <Image
                    src={item.imageUrl}
                    width={42}
                    height={42}
                    alt={item.name}
                    style={{ borderRadius: 8 }}
                  />
                  <strong>{item.name}</strong>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={startVoiceSearch}
          style={{
            width: 42,
            height: 42,
            borderRadius: 10,
            background: "#00c6ff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
            <path d="M12 14a3 3 0 003-3V5a3 3 0 00-6 0v6a3 3 0 003 3zm5-3a5 5 0 01-10 0H5a7 7 0 0014 0h-2zm-5 9a7 7 0 007-7h-2a5 5 0 01-10 0H5a7 7 0 007 7z" />
          </svg>
        </button>
      </div>

      {/* ADS */}
      <div className="mt-3">
        <BannerAd ads={ads} />
      </div>

      {/* TRENDING */}
      <h2 className="section-title">Trending Today</h2>
      <div className="slider-row">
        <InfiniteSlider items={trending} size="small" />
      </div>

      {/* RECENT */}
      {recent.length > 0 && (
        <>
          <h2 className="section-title">Recently Viewed</h2>
          <div className="slider-row">
            <InfiniteSlider items={recent} size="small" />
          </div>
        </>
      )}

      {/* PRODUCTS */}
      <h2 className="section-title">Products</h2>
      <div className="products-grid">
        {filtered.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* DRAWERS */}
      {openCategory && (
        <CategoryDrawer
          active={activeCategory}
          onSelect={(c) => {
            setActiveCategory(c);
            setOpenCategory(false);
          }}
          onClose={() => setOpenCategory(false)}
        />
      )}

      {openFilter && (
        <FilterDrawer
          onClose={() => setOpenFilter(false)}
          onApply={(data) => setFilters(data)}
        />
      )}
    </main>
  );
             }
        
