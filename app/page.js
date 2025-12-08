"use client";

import { useState, useEffect } from "react";
import ProductCard from "@/components/ProductCard";
import BannerAd from "@/components/ads/BannerAd";
import TrendingSlider from "@/components/TrendingSlider";
import RecentSlider from "@/components/RecentSlider";
import SkeletonLoader from "@/components/SkeletonLoader";
import { db } from "@/lib/firebase-app";
import { collection, getDocs } from "firebase/firestore";
import Image from "next/image";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [ads, setAds] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCat, setSelectedCat] = useState("all");
  const [recent, setRecent] = useState([]);
  const [trending, setTrending] = useState([]);
  const [loadingTrending, setLoadingTrending] = useState(true);

  /* ---------------- LOAD PRODUCTS ---------------- */
  useEffect(() => {
    async function loadProducts() {
      const snap = await getDocs(collection(db, "products"));
      const items = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      setProducts(items);
      setFiltered(items);

      const sorted = [...items]
        .sort((a, b) => (b.impressions || 0) - (a.impressions || 0))
        .slice(0, 10);

      setTrending(sorted);
      setLoadingTrending(false);
    }
    loadProducts();
  }, []);

  /* ---------------- LOAD ADS ---------------- */
  useEffect(() => {
    async function loadAds() {
      const snap = await getDocs(collection(db, "ads"));
      const items = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setAds(items);
    }
    loadAds();
  }, []);

  /* ---------------- LOAD CATEGORIES ---------------- */
  useEffect(() => {
    async function loadCats() {
      const snap = await getDocs(collection(db, "categories"));
      const items = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setCategories(items);
    }
    loadCats();
  }, []);

  /* ---------------- RECENTLY VIEWED ---------------- */
  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("recent") || "[]");
    setRecent(data);
  }, []);

  /* ---------------- CATEGORY FILTER ---------------- */
  function filterByCategory(slug) {
    setSelectedCat(slug);
    if (slug === "all") return setFiltered(products);
    setFiltered(products.filter((p) => p.categorySlug === slug));
  }

  /* ---------------- SEARCH ---------------- */
  useEffect(() => {
    if (!search) {
      setFiltered(products);
      return;
    }
    const match = products.filter((p) =>
      p.name.toLowerCase().includes(search.toLowerCase())
    );
    setFiltered(match);
  }, [search, products]);

  const iconButton = {
    width: "42px",
    height: "42px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "12px",
    background: "rgba(0,200,255,0.75)",
  };

  return (
    <main className="page-container">

      {/* ---------------- SEARCH BAR ---------------- */}
      <div className="flex items-center gap-2 mt-3 mb-2">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-bar"
            style={{ paddingRight: "42px" }}
          />

          {/* SEARCH ICON */}
          <svg
            width="22"
            height="22"
            fill="#00c3ff"
            viewBox="0 0 24 24"
            className="absolute right-3 top-1/2 -translate-y-1/2"
          >
            <path d="M10 2a8 8 0 105.293 14.293l4.707 4.707 1.414-1.414-4.707-4.707A8 8 0 0010 2zm0 2a6 6 0 110 12A6 6 0 0110 4z" />
          </svg>
        </div>
      </div>

      {/* ---------------- BANNER ---------------- */}
      <div className="mt-2 px-2">
        <BannerAd ads={ads} />
      </div>

      {/* ---------------- TRENDING ---------------- */}
      <h2 className="text-xl font-bold text-blue-500 mt-5 mb-2">
        Trending Today
      </h2>

      <TrendingSlider items={trending} loading={loadingTrending} />

      {/* ---------------- RECENTLY VIEWED ---------------- */}
      <RecentSlider items={recent} />

      {/* ---------------- CATEGORIES ---------------- */}
      <h2 className="text-xl font-bold text-blue-500 mt-6 mb-2">Categories</h2>

      <div className="flex overflow-x-auto gap-3 no-scrollbar pb-2">
        {/* ALL */}
        <div
          onClick={() => filterByCategory("all")}
          className="min-w-[120px] bg-white rounded-xl p-3 shadow cursor-pointer text-center"
        >
          <strong className="text-blue-600">All</strong>
        </div>

        {categories.map((c) => (
          <div
            key={c.id}
            onClick={() => filterByCategory(c.slug)}
            className="min-w-[120px] bg-white rounded-xl p-3 shadow cursor-pointer text-center"
          >
            <div className="text-3xl">{c.icon}</div>
            <div className="font-semibold text-blue-600 mt-1">{c.name}</div>
          </div>
        ))}
      </div>

      {/* ---------------- PRODUCT GRID ---------------- */}
      <h1 className="mt-4 text-blue-500 font-bold text-lg">Products</h1>

      <div className="grid gap-4 grid-cols-1 mb-10">
        {filtered.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </main>
  );
        }
        
