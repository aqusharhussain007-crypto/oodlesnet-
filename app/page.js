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
  const [categories, setCategories] = useState([]);
  const [ads, setAds] = useState([]);
  const [recent, setRecent] = useState([]);
  const [trending, setTrending] = useState([]);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [catDrawer, setCatDrawer] = useState(false);
  const [selectedCat, setSelectedCat] = useState("all");

  const trendingRef = useRef(null);
  const recentRef = useRef(null);

  /* LOAD PRODUCTS */
  useEffect(() => {
    async function load() {
      const snap = await getDocs(collection(db, "products"));
      const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
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

  /* LOAD ADS */
  useEffect(() => {
    async function load() {
      const snap = await getDocs(collection(db, "ads"));
      setAds(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    }
    load();
  }, []);

  /* LOAD CATEGORIES */
  useEffect(() => {
    async function load() {
      const snap = await getDocs(collection(db, "categories"));
      setCategories(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    }
    load();
  }, []);

  /* RECENTLY VIEWED */
  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("recent") || "[]");
    setRecent(Array.isArray(data) ? data : []);
  }, []);

  /* CATEGORY FILTER */
  function filterByCategory(slug) {
    setSelectedCat(slug);
    if (slug === "all") return setFiltered(products);
    setFiltered(products.filter((p) => p.categorySlug === slug));
  }

  return (
    <main className="page-container" style={{ padding: 12 }}>

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

      {/* CATEGORY + FILTER BUTTONS (RESTORED) */}
      <div style={{ display: "flex", gap: 10, margin: "16px 0" }}>
        <button
          onClick={() => setCatDrawer(true)}
          style={{
            flex: 1,
            height: 40,
            borderRadius: 14,
            fontWeight: 700,
            color: "#fff",
            background: "linear-gradient(90deg,#0094ff,#00e0ff)",
            border: "none",
          }}
        >
          Categories →
        </button>

        <button
          onClick={() => setDrawerOpen(true)}
          style={{
            flex: 1,
            height: 40,
            borderRadius: 14,
            fontWeight: 700,
            color: "#fff",
            background: "linear-gradient(90deg,#00c85f,#00f7a0)",
            border: "none",
          }}
        >
          Filters →
        </button>
      </div>

      {/* PRODUCTS */}
      <h2 className="section-title">Products</h2>
      <div className="products-grid">
        {filtered.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>

      {/* DRAWERS */}
      <CategoryDrawer
        isOpen={catDrawer}
        onClose={() => setCatDrawer(false)}
        categories={categories}
        selectedCat={selectedCat}
        onSelect={filterByCategory}
      />

      <FilterDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        products={products}
        onApply={(items) => setFiltered(items)}
      />
    </main>
  );
        }
                                    
