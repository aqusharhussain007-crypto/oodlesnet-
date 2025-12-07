"use client";

import { useState, useEffect } from "react";
import ProductCard from "@/components/ProductCard";
import { db } from "@/lib/firebase-app";
import { collection, getDocs } from "firebase/firestore";
import BannerAd from "@/components/ads/BannerAd";
import Link from "next/link";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [ads, setAds] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCat, setSelectedCat] = useState("all");
{/* 🔍 Search Bar Row */}
<div
  style={{
    display: "flex",
    alignItems: "center",
    gap: "6px",
    marginTop: "12px",
    marginBottom: "12px",
  }}
>

  {/* Search Input With Internal Icon */}
  <div style={{ position: "relative", flex: 1 }}>
    <input
      type="text"
      placeholder="Search products..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      className="search-bar"
      style={{
        width: "100%",
        height: "46px",
        borderRadius: "14px",
        fontSize: "1rem",
        paddingLeft: "14px",
        paddingRight: "42px",
        border: "2px solid #00c3ff",
        background: "rgba(255,255,255,0.85)",
        boxShadow: "0 0 8px rgba(0,195,255,0.4)",
      }}
    />

    {/* Search Icon (A) */}
    <div
      style={{
        position: "absolute",
        right: "10px",
        top: "50%",
        transform: "translateY(-50%)",
        pointerEvents: "none",
      }}
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="#00c3ff" viewBox="0 0 24 24">
        <path d="M10 2a8 8 0 105.293 14.293l4.707 4.707 1.414-1.414-4.707-4.707A8 8 0 0010 2zm0 2a6 6 0 110 12A6 6 0 0110 4z" />
      </svg>
    </div>
  </div>

  {/* Mic Button (D) */}
  <button onClick={startVoiceSearch} style={iconButtonStyle}>
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="white">
      <path d="M12 14a3 3 0 003-3V5a3 3 0 00-6 0v6a3 3 0 003 3zm5-3a5 5 0 01-10 0H5a7 7 0 0014 0h-2zm-5 8a7 7 0 007-7h-2a5 5 0 01-10 0H5a7 7 0 007 7zm-1 2h2v3h-2v-3z" />
    </svg>
  </button>
</div>
        
  // Load Products
  useEffect(() => {
    async function load() {
      const snap = await getDocs(collection(db, "products"));
      const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setProducts(items);
      setFiltered(items);
    }
    load();
  }, []);

  // Load Ads
  useEffect(() => {
    async function loadAds() {
      const snap = await getDocs(collection(db, "ads"));
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setAds(list);
    }
    loadAds();
  }, []);

  // Load Categories
  useEffect(() => {
    async function loadCats() {
      const snap = await getDocs(collection(db, "categories"));
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setCategories(list);
    }
    loadCats();
  }, []);

  // Filter Products
  function filterByCategory(slug) {
    setSelectedCat(slug);
    if (slug === "all") return setFiltered(products);
    setFiltered(products.filter((p) => p.categorySlug === slug));
  }

  return (
    <main className="page-container">

      {/* Category Row */}
      <div
        style={{
          display: "flex",
          overflowX: "auto",
          gap: "14px",
          padding: "12px 4px",
          whiteSpace: "nowrap",
        }}
      >
        {/* ALL option */}
        <div
          onClick={() => filterByCategory("all")}
          style={{
            minWidth: "110px",
            padding: "12px",
            borderRadius: "15px",
            background:
              selectedCat === "all"
                ? "rgba(0,195,255,0.2)"
                : "rgba(240,255,255,0.9)",
            border:
              selectedCat === "all" ? "2px solid #00c3ff" : "2px solid #bbddee",
            textAlign: "center",
            cursor: "pointer",
          }}
        >
          <strong style={{ color: "#00a4dd" }}>All</strong>
        </div>

        {/* Category Cards */}
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/category/${cat.slug}`}
            style={{ textDecoration: "none" }}
          >
            <div
              onClick={() => filterByCategory(cat.slug)}
              style={{
                minWidth: "110px",
                padding: "12px",
                borderRadius: "15px",
                background:
                  selectedCat === cat.slug
                    ? "rgba(0,195,255,0.2)"
                    : "rgba(240,255,255,0.9)",
                border:
                  selectedCat === cat.slug
                    ? "2px solid #00c3ff"
                    : "2px solid #bbddee",
                textAlign: "center",
                cursor: "pointer",
              }}
            >
              {/* Icon FIX */}
              <img
                src={
                  cat.iconUrl && cat.iconUrl.length > 5
                    ? cat.iconUrl
                    : "https://via.placeholder.com/40?text=?"
                }
                style={{
                  width: "40px",
                  height: "40px",
                  objectFit: "contain",
                  margin: "auto",
                }}
              />

              <div
                style={{
                  marginTop: "6px",
                  color: "#0088cc",
                  fontWeight: "600",
                  fontSize: "0.9rem",
                }}
              >
                {cat.name}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Ads */}
      <div className="px-3 mt-1">
        <BannerAd ads={ads} />
      </div>

      {/* Products */}
      <h1 style={{ marginTop: "16px", color: "#00b7ff" }}>Products</h1>

      <div
        style={{
          display: "grid",
          gap: "1rem",
          gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))",
          marginBottom: "40px",
        }}
      >
        {filtered.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </main>
  );
  }
        
