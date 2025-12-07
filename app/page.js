"use client";

import { useState, useEffect } from "react";
import ProductCard from "@/components/ProductCard";
import { db } from "@/lib/firebase-app";
import { collection, getDocs } from "firebase/firestore";
import BannerAd from "@/components/ads/BannerAd";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [ads, setAds] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCat, setSelectedCat] = useState("all");

  /* LOAD PRODUCTS */
  useEffect(() => {
    async function loadProducts() {
      const snap = await getDocs(collection(db, "products"));
      const items = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProducts(items);
      setFiltered(items);
    }
    loadProducts();
  }, []);

  /* LOAD ADS */
  useEffect(() => {
    async function loadAds() {
      const snap = await getDocs(collection(db, "ads"));
      setAds(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }
    loadAds();
  }, []);

  /* LOAD CATEGORIES */
  useEffect(() => {
    async function loadCategories() {
      const snap = await getDocs(collection(db, "categories"));
      setCategories(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }
    loadCategories();
  }, []);

  /* FILTER BY CATEGORY */
  function filterByCategory(slug) {
    setSelectedCat(slug);
    if (slug === "all") return setFiltered(products);
    setFiltered(products.filter(p => p.categorySlug === slug));
  }

  /* SEARCH */
  useEffect(() => {
    if (!search) return setFiltered(products);

    const match = products.filter((p) =>
      p.name.toLowerCase().includes(search.toLowerCase())
    );

    setFiltered(match);
  }, [search, products]);

  /* MIC BUTTON STYLE */
  const iconButtonStyle = {
    width: "42px",
    height: "42px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "6px",
    borderRadius: "12px",
    background: "rgba(0, 200, 255, 0.75)",
    boxShadow: "0 0 10px rgba(0,200,255,0.7)",
  };

  return (
    <main className="page-container">

      {/* 🔍 SEARCH BAR */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          marginTop: "10px",
          marginBottom: "12px",
        }}
      >
        <div style={{ position: "relative", flex: 1 }}>
          <input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-bar"
            style={{
              width: "100%",
              height: "46px",
              borderRadius: "12px",
              paddingLeft: "14px",
              paddingRight: "40px",
              border: "2px solid #00c3ff",
              background: "rgba(255,255,255,0.85)",
            }}
          />

          {/* 🔍 Icon */}
          <div
            style={{
              position: "absolute",
              right: "10px",
              top: "50%",
              transform: "translateY(-50%)",
              pointerEvents: "none",
            }}
          >
            <svg width="22" height="22" fill="#00c3ff" viewBox="0 0 24 24">
              <path d="M10 2a8 8 0 105.293 14.293l4.707 4.707 1.414-1.414-4.707-4.707A8 8 0 0010 2zm0 2a6 6 0 110 12A6 6 0 0110 4z" />
            </svg>
          </div>
        </div>

        {/* MIC */}
        <button style={iconButtonStyle}>
          <svg width="22" height="22" fill="white" viewBox="0 0 24 24">
            <path d="M12 14a3 3 0 003-3V5a3 3 0 00-6 0v6a3 3 0 003 3zm5-3a5 5 0 01-10 0H5a7 7 0 0014 0h-2zm-5 8a7 7 0 007-7h-2a5 5 0 01-10 0H5a7 7 0 007 7zm-1 2h2v3h-2v-3z" />
          </svg>
        </button>
      </div>

      {/* ⭐ CATEGORY ROW — FIXED & CLEAN */}
      <div
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
          gap: "14px",
          overflowX: "auto",
          paddingBottom: "8px",
          whiteSpace: "nowrap",
        }}
      >
        {/* DEFAULT ALL CATEGORY */}
        <div
          onClick={() => filterByCategory("all")}
          style={{
            display: "inline-block",
            minWidth: "95px",
            padding: "10px",
            borderRadius: "14px",
            background:
              selectedCat === "all"
                ? "rgba(0,195,255,0.15)"
                : "rgba(255,255,255,0.6)",
            border:
              selectedCat === "all"
                ? "2px solid #00c3ff"
                : "2px solid #aacbe3",
            textAlign: "center",
            cursor: "pointer",
            fontWeight: 600,
            color: "#0088cc",
          }}
        >
          All
        </div>

        {/* CATEGORY CARDS */}
        {categories.map((cat) => (
          <div
            key={cat.id}
            onClick={() => filterByCategory(cat.slug)}
            style={{
              display: "inline-block",
              minWidth: "95px",
              padding: "10px",
              borderRadius: "14px",
              background:
                selectedCat === cat.slug
                  ? "rgba(0,195,255,0.15)"
                  : "rgba(255,255,255,0.6)",
              border:
                selectedCat === cat.slug
                  ? "2px solid #00c3ff"
                  : "2px solid #aacbe3",
              textAlign: "center",
              cursor: "pointer",
            }}
          >
            <img
              src={cat.iconUrl}
              alt={cat.name}
              style={{
                width: "40px",
                height: "40px",
                objectFit: "contain",
                margin: "auto",
              }}
            />
            <div
              style={{
                marginTop: "4px",
                color: "#0088cc",
                fontWeight: 600,
                fontSize: "0.9rem",
              }}
            >
              {cat.name}
            </div>
          </div>
        ))}
      </div>

      {/* BANNER ADS */}
      <div className="px-3 mt-1">
        <BannerAd ads={ads} />
      </div>

      {/* PRODUCTS TITLE */}
      <h1 style={{ marginTop: "16px", color: "#00b7ff" }}>Products</h1>

      {/* PRODUCT GRID */}
      <div
        style={{
          display: "grid",
          gap: "0.8rem",
          gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
          marginBottom: "30px",
        }}
      >
        {filtered.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </main>
  );
  }
    
