"use client";

import { useEffect, useState, useRef } from "react";
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

  /* ---------------- LOAD DATA ---------------- */
  useEffect(() => {
    async function loadAll() {
      const snap = await getDocs(collection(db, "products"));
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));

      setProducts(items);
      setFiltered(items);

      setTrending(
        [...items]
          .sort((a, b) => (b.impressions || 0) - (a.impressions || 0))
          .slice(0, 10)
      );

      const adsSnap = await getDocs(collection(db, "ads"));
      setAds(adsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    }
    loadAll();
  }, []);

  /* ---------------- RECENTLY VIEWED ---------------- */
  useEffect(() => {
    if (typeof window === "undefined") return;
    const r = JSON.parse(localStorage.getItem("recent") || "[]");
    if (Array.isArray(r) && r.length) setRecent(r);
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
    <main className="page-container">

      {/* HERO IMAGE (NO OVERLAY ISSUE) */}
      <div style={{ position: "relative", width: "100%", height: 220 }}>
        <Image
          src="/hero.jpg"
          alt="OodlesNet"
          fill
          style={{ objectFit: "cover" }}
          priority
        />
      </div>

      {/* SEARCH BAR */}
      <div style={{ padding: 12, marginTop: 8 }}>
        <div style={{ position: "relative" }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search products…"
            className="search-bar"
          />

          {/* SEARCH ICON */}
          <svg width="18" height="18" viewBox="0 0 24 24"
            style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)" }}>
            <path fill="#00c3ff" d="M10 2a8 8 0 105.293 14.293l4.707 4.707 1.414-1.414-4.707-4.707A8 8 0 0010 2z"/>
          </svg>
        </div>
      </div>

      {/* CATEGORY + FILTER BUTTONS */}
      <div style={{ display: "flex", gap: 10, padding: "0 12px" }}>
        <button className="drawer-btn blue" onClick={() => setCatDrawer(true)}>
          Categories →
        </button>
        <button className="drawer-btn green" onClick={() => setFilterDrawer(true)}>
          Filters →
        </button>
      </div>

      {/* ADS */}
      <BannerAd ads={ads} />

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
    
