"use client";

import { useState, useEffect } from "react";
import ProductCard from "@/components/ProductCard";
import { db } from "@/lib/firebase-app";
import { collection, getDocs } from "firebase/firestore";
import BannerAd from "@/components/ads/BannerAd";
import SkeletonLoader from "@/components/SkeletonLoader";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [ads, setAds] = useState([]);
  const [categories, setCategories] = useState([]);
  const [trending, setTrending] = useState([]);
  const [selectedCat, setSelectedCat] = useState("all");

  const [loading, setLoading] = useState(true);

  // 🔵 Load all data first → then hide skeleton
  useEffect(() => {
    async function loadAll() {
      try {
        const prodSnap = await getDocs(collection(db, "products"));
        const productsData = prodSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        const adSnap = await getDocs(collection(db, "ads"));
        const adData = adSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        const catSnap = await getDocs(collection(db, "categories"));
        const catData = catSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        const trendSnap = await getDocs(collection(db, "trending"));
        const trendData = trendSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        setProducts(productsData);
        setFiltered(productsData);
        setAds(adData);
        setCategories(catData);
        setTrending(trendData);

        setLoading(false);
      } catch (err) {
        console.log("LOAD ERROR:", err);
      }
    }

    loadAll();
  }, []);

  // 🔍 Search Filter
  useEffect(() => {
    if (!search) {
      setFiltered(products);
      return;
    }
    setFiltered(
      products.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [search, products]);

  // Category Filter
  function filterByCategory(slug) {
    setSelectedCat(slug);
    if (slug === "all") return setFiltered(products);
    setFiltered(products.filter(p => p.categorySlug === slug));
  }

  if (loading) {
    return (
      <main className="page-container">
        <SkeletonLoader />
      </main>
    );
  }

  return (
    <main className="page-container">

      {/* SEARCH BAR */}
      <div style={{ position: "relative", width: "100%", marginBottom: "12px" }}>
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-bar"
          style={{
            width: "100%",
            height: "46px",
            borderRadius: "12px",
            paddingLeft: "12px",
            paddingRight: "40px",
            border: "2px solid #00c3ff",
            background: "rgba(255,255,255,0.85)",
          }}
        />

        {/* ICON INSIDE */}
        <div
          style={{
            position: "absolute",
            right: "12px",
            top: "50%",
            transform: "translateY(-50%)",
          }}
        >
          🔍
        </div>
      </div>

      {/* TRENDING SECTION */}
      <h2 className="text-lg font-bold mb-1" style={{ color: "#00b7ff" }}>
        Trending Today
      </h2>

      <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
        {trending.map((t) => (
          <div
            key={t.id}
            style={{
              minWidth: "110px",
              padding: "10px",
              background: "white",
              borderRadius: "12px",
              textAlign: "center",
              boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
            }}
          >
            <img
              src={t.imageUrl}
              style={{ width: "70px", height: "70px", borderRadius: "8px" }}
            />
            <div style={{ marginTop: "4px", fontSize: "0.85rem", color: "#006699" }}>
              {t.name}
            </div>
          </div>
        ))}
      </div>

      {/* CATEGORIES */}
      <h2 className="text-lg font-bold mt-4 mb-2" style={{ color: "#00b7ff" }}>
        Categories
      </h2>

      <div
        style={{
          display: "flex",
          overflowX: "auto",
          gap: "12px",
          paddingBottom: "8px",
        }}
      >
        {/* ALL */}
        <div
          onClick={() => filterByCategory("all")}
          style={{
            minWidth: "90px",
            background: selectedCat === "all" ? "#e0faff" : "white",
            border: "2px solid #a0dfff",
            borderRadius: "12px",
            textAlign: "center",
            padding: "10px",
          }}
        >
          <strong>All</strong>
        </div>

        {/* CATEGORY CARDS */}
        {categories.map((cat) => (
          <div
            key={cat.id}
            onClick={() => filterByCategory(cat.slug)}
            style={{
              minWidth: "90px",
              background: selectedCat === cat.slug ? "#e0faff" : "white",
              border: "2px solid #a0dfff",
              borderRadius: "12px",
              textAlign: "center",
              padding: "10px",
            }}
          >
            <div style={{ fontSize: "26px" }}>{cat.icon}</div>
            <strong>{cat.name}</strong>
          </div>
        ))}
      </div>

      {/* BANNER */}
      <div className="mt-2 mb-4">
        <BannerAd ads={ads} />
      </div>

      {/* PRODUCTS */}
      <h1 style={{ marginTop: "16px", color: "#00b7ff" }}>Products</h1>

      <div
        style={{
          display: "grid",
          gap: "12px",
          gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
        }}
      >
        {filtered.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

    </main>
  );
            }
      
