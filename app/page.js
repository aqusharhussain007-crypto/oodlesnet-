"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import ProductCard from "@/components/ProductCard";
import InfiniteSlider from "@/components/InfiniteSlider";
import CategoryDrawer from "@/components/CategoryDrawer";
import FilterDrawer from "@/components/FilterDrawer";
import BannerAd from "@/components/ads/BannerAd";

import { db } from "@/lib/firebase-app";
import { collection, getDocs } from "firebase/firestore";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [trending, setTrending] = useState([]);
  const [recent, setRecent] = useState([]);
  const [ads, setAds] = useState([]);

  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  const [catDrawer, setCatDrawer] = useState(false);
  const [filterDrawer, setFilterDrawer] = useState(false);
  const [selectedCat, setSelectedCat] = useState("all");

  const trendingRef = useRef(null);
  const recentRef = useRef(null);

  /* ---------------- LOAD PRODUCTS ---------------- */
  useEffect(() => {
    async function load() {
      const snap = await getDocs(collection(db, "products"));
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));

      setProducts(items);
      setFiltered(items);

      setTrending(
        [...items]
          .sort((a, b) => (b.impressions || 0) - (a.impressions || 0))
          .slice(0, 10)
      );
    }
    load();
  }, []);

  /* ---------------- LOAD ADS ---------------- */
  useEffect(() => {
    async function loadAds() {
      const snap = await getDocs(collection(db, "ads"));
      setAds(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }
    loadAds();
  }, []);

  /* ---------------- RECENTLY VIEWED ---------------- */
  useEffect(() => {
    if (typeof window === "undefined") return;
    const r = JSON.parse(localStorage.getItem("recent") || "[]");
    if (Array.isArray(r)) setRecent(r);
  }, []);

  /* ---------------- SEARCH ---------------- */
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

  /* ---------------- AUTO SCROLL ---------------- */
  useEffect(() => {
    const i = setInterval(() => {
      trendingRef.current?.scrollBy({ left: 1, behavior: "smooth" });
      recentRef.current?.scrollBy({ left: 1, behavior: "smooth" });
    }, 40);
    return () => clearInterval(i);
  }, []);

  /* ---------------- CATEGORY FILTER ---------------- */
  function filterByCategory(slug) {
    setSelectedCat(slug);
    if (slug === "all") setFiltered(products);
    else setFiltered(products.filter(p => p.categorySlug === slug));
  }

  return (
    <main className="page-container" style={{ padding: 12 }}>

      {/* SEARCH BAR */}
      <div style={{ position: "relative", marginBottom: 12 }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search products…"
          className="search-bar"
        />
      </div>

      {/* CATEGORY + FILTER BUTTONS */}
      <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
        <button
          onClick={() => setCatDrawer(true)}
          style={{
            flex: 1,
            height: 38,
            borderRadius: 12,
            background: "linear-gradient(90deg,#0094ff,#00e0ff)",
            color: "#fff",
            border: "none",
            fontWeight: 700,
          }}
        >
          Categories →
        </button>

        <button
          onClick={() => setFilterDrawer(true)}
          style={{
            flex: 1,
            height: 38,
            borderRadius: 12,
            background: "linear-gradient(90deg,#00c85f,#00f7a0)",
            color: "#fff",
            border: "none",
            fontWeight: 700,
          }}
        >
          Filters →
        </button>
      </div>

      {/* ADS */}
      <BannerAd ads={ads} />

      {/* TRENDING */}
      <h2 className="section-title">Trending Today</h2>
      <div ref={trendingRef} className="slider-row no-scrollbar">
        <InfiniteSlider items={trending} />
      </div>

      {/* RECENTLY VIEWED */}
      {recent.length > 0 && (
        <>
          <h2 className="section-title">Recently Viewed</h2>
          <div ref={recentRef} className="slider-row no-scrollbar">
            <InfiniteSlider items={recent} />
          </div>
        </>
      )}

      {/* PRODUCTS */}
      <h2 className="section-title">Products</h2>
      <div className="products-grid">
        {filtered.map(p => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>

      {/* CATEGORY DRAWER */}
      <CategoryDrawer
        isOpen={catDrawer}
        onClose={() => setCatDrawer(false)}
        categories={[
          { name: "Mobiles", slug: "mobile" },
          { name: "Laptops", slug: "laptop" },
          { name: "Electronics", slug: "electronics" },
        ]}
        selectedCat={selectedCat}
        onSelect={filterByCategory}
      />

      {/* FILTER DRAWER */}
      <FilterDrawer
        isOpen={filterDrawer}
        onClose={() => setFilterDrawer(false)}
        products={products}
        onApply={items => setFiltered(items)}
      />
    </main>
  );
    }
    
