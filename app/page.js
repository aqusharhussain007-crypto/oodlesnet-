"use client";

import { useState, useEffect, useRef, useContext } from "react";
import { DrawerContext } from "@/components/DrawerProvider";
import ProductCard from "@/components/ProductCard";
import BannerAd from "@/components/ads/BannerAd";
import FilterDrawer from "@/components/FilterDrawer";
import CategoryDrawer from "@/components/CategoryDrawer";
import InfiniteSlider from "@/components/InfiniteSlider";
import { db } from "@/lib/firebase-app";
import { collection, getDocs } from "firebase/firestore";
import Image from "next/image";

export default function Home() {
  const {
    openFilter,
    setOpenFilter,
    openCategory,
    setOpenCategory
  } = useContext(DrawerContext);

  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  const [ads, setAds] = useState([]);
  const [categories, setCategories] = useState([]);

  const [selectedCat, setSelectedCat] = useState("all");
  const [recent, setRecent] = useState([]);
  const [trending, setTrending] = useState([]);

  const trendingRef = useRef(null);
  const recentRef = useRef(null);

  /* LOAD PRODUCTS */
  useEffect(() => {
    async function load() {
      const snap = await getDocs(collection(db, "products"));
      const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setProducts(items);
      setFiltered(items);

      const top = [...items]
        .sort((a, b) => (b.impressions || 0) - (a.impressions || 0))
        .slice(0, 10);

      setTrending(top);
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

  /* RECENT */
  useEffect(() => {
    if (typeof window === "undefined") return;
    const data = JSON.parse(localStorage.getItem("recent") || "[]");
    setRecent(Array.isArray(data) ? data : []);
  }, []);

  /* SEARCH */
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

  /* CATEGORY FILTER */
  function filterByCategory(slug) {
    setSelectedCat(slug);
    if (slug === "all") setFiltered(products);
    else setFiltered(products.filter((p) => p.categorySlug === slug));
  }

  const lowest = (p) =>
    p.store?.length
      ? Math.min(...p.store.map((s) => Number(s.price)))
      : Infinity;

  /* ---------- UI ---------- */
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
            style={{ height: 40, borderRadius: 12 }}
          />

          {/* AUTOCOMPLETE */}
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
                    style={{ borderRadius: 8, objectFit: "cover" }}
                  />

                  <div>
                    <div style={{ fontWeight: 700, color: "#0077aa" }}>
                      {item.name}
                    </div>
                    <div style={{ color: "#0097cc", fontWeight: 800 }}>
                      ₹{lowest(item).toLocaleString("en-IN")}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Banner */}
      <div className="mt-3 px-1">
        <BannerAd ads={ads} />
      </div>

      {/* Trending */}
      <h2 className="section-title">Trending Today</h2>
      <div ref={trendingRef} className="slider-row no-scrollbar">
        <InfiniteSlider items={trending} cardStyle="rounded-img" />
      </div>

      {/* Recently Viewed */}
      {recent.length > 0 && (
        <>
          <h2 className="section-title">Recently Viewed</h2>
          <div ref={recentRef} className="slider-row no-scrollbar">
            <InfiniteSlider items={recent} cardStyle="rounded-img" />
          </div>
        </>
      )}

      {/* Products */}
      <h2 className="section-title">Products</h2>
      <div className="products-grid">
        {filtered.map((p) => (
          <ProductCard key={p.id} product={p} />
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
          max: Math.max(...products.map((p) => lowest(p))),
          sort: "none",
          discountOnly: false,
        }}
        onApply={(filters) => {
          let items = [...products];

          if (filters.min != null)
            items = items.filter((p) => lowest(p) >= Number(filters.min));

          if (filters.max != null)
            items = items.filter((p) => lowest(p) <= Number(filters.max));

          if (filters.discountOnly)
            items = items.filter((p) =>
              p.store?.some((s) => (s.offer || "").trim())
            );

          if (filters.sort === "price-asc")
            items.sort((a, b) => lowest(a) - lowest(b));

          if (filters.sort === "price-desc")
            items.sort((a, b) => lowest(b) - lowest(a));

          if (filters.sort === "trending")
            items.sort((a, b) => (b.impressions || 0) - (a.impressions || 0));

          setFiltered(items);
          setOpenFilter(false);
        }}
      />
    </main>
  );
}
  
