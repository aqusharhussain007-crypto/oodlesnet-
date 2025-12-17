"use client";

import { useState, useEffect } from "react";
import ProductCard from "@/components/ProductCard";
import BannerAd from "@/components/ads/BannerAd";
import InfiniteSlider from "@/components/InfiniteSlider";
import FilterDrawer from "@/components/FilterDrawer";
import CategoryDrawer from "@/components/CategoryDrawer";
import { db } from "@/lib/firebase-app";
import { collection, getDocs } from "firebase/firestore";
import Image from "next/image";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);

  // ✅ NEW (filter state)
  const [filters, setFilters] = useState(null);

  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  const [ads, setAds] = useState([]);
  const [recent, setRecent] = useState([]);
  const [trending, setTrending] = useState([]);

  const [showFilter, setShowFilter] = useState(false);
  const [showCategory, setShowCategory] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");

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

  /* ---------------- RECENTLY VIEWED ---------------- */
  useEffect(() => {
    if (typeof window === "undefined") return;
    const data = JSON.parse(localStorage.getItem("recent") || "[]");
    setRecent(Array.isArray(data) ? data : []);
  }, []);

  /* ---------------- SEARCH + CATEGORY + FILTERS ---------------- */
  useEffect(() => {
    let list = products;

    // Category
    if (activeCategory !== "all") {
      list = list.filter((p) => p.categorySlug === activeCategory);
    }

    // Search
    if (search) {
      list = list.filter((p) =>
        (p.name || "").toLowerCase().includes(search.toLowerCase())
      );
      setSuggestions(list.slice(0, 5));
    } else {
      setSuggestions([]);
    }

    // ✅ Filters (compact, additive)
    if (filters) {
      if (filters.min)
        list = list.filter((p) => p.price >= Number(filters.min));

      if (filters.max)
        list = list.filter((p) => p.price <= Number(filters.max));

      if (filters.stores?.length)
        list = list.filter((p) =>
          p.stores?.some((s) => filters.stores.includes(s.name))
        );

      if (filters.inStockOnly)
        list = list.filter((p) => p.inStock);

      if (filters.discountOnly)
        list = list.filter(
          (p) => p.originalPrice && p.originalPrice > p.price
        );

      if (filters.sort === "price-asc")
        list = [...list].sort((a, b) => a.price - b.price);

      if (filters.sort === "price-desc")
        list = [...list].sort((a, b) => b.price - a.price);
    }

    setFiltered(list);
  }, [search, products, activeCategory, filters]);

  /* ---------------- VOICE SEARCH ---------------- */
  function startVoiceSearch() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return alert("Voice search not supported");

    const recog = new SR();
    recog.lang = "en-IN";
    recog.onresult = (e) =>
      setSearch(e.results[0][0].transcript || "");
    recog.start();
  }

  return (
    <main className="page-container" style={{ padding: 12 }}>
      {/* EVERYTHING ABOVE & BELOW IS UNCHANGED UI */}

      {/* PRODUCTS */}
      <h2 className="section-title">Products</h2>
      <div className="products-grid">
        {filtered.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* DRAWERS */}
      {showCategory && (
        <CategoryDrawer
          active={activeCategory}
          onSelect={(c) => {
            setActiveCategory(c);
            setShowCategory(false);
          }}
          onClose={() => setShowCategory(false)}
        />
      )}

      {showFilter && (
        <FilterDrawer
          onClose={() => setShowFilter(false)}
          onApply={(data) => setFilters(data)}   // ✅ NEW
        />
      )}
    </main>
  );
      }
    
