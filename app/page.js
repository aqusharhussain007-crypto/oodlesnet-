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

  // Load Products
  useEffect(() => {
    async function load() {
      const snap = await getDocs(collection(db, "products"));
      const items = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      setProducts(items);
      setFiltered(items);
    }
    load();
  }, []);

  // Load Ads
  useEffect(() => {
    async function load() {
      const snap = await getDocs(collection(db, "ads"));
      const items = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAds(items);
    }
    load();
  }, []);

  // Load Categories
  useEffect(() => {
    async function load() {
      const snap = await getDocs(collection(db, "categories"));
      const items = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCategories(items);
    }
    load();
  }, []);

  // Filter category
  function filterByCategory(slug) {
    setSelectedCat(slug);
    if (slug === "all") return setFiltered(products);

    setFiltered(products.filter(p => p.categorySlug === slug));
  }

  // Search system
  useEffect(() => {
    if (!search) return setFiltered(products);

    setFiltered(
      products.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [search, products]);

  // Mic Button Style
  const iconBtn = {
    width: "46px",
    height: "46px",
    borderRadius: "14px",
    background: "rgba(0,200,255,0.75)",
    boxShadow: "0 0 8px rgba(0,200,255,0.6)",
    border: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  return (
    <main className="page-container">

      {/* 🔍 SEARCH BAR */}
      <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
        <div style={{ position: "relative", flex: 1 }}>
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              height: "46px",
              borderRadius: "14px",
              paddingLeft: "14px",
              paddingRight: "40px",
              fontSize: "1rem",
              border: "2px solid #00c3ff",
              background: "white",
              boxShadow: "0 0 8px rgba(0,195,255,0.4)",
            }}
          />

          {/* Icon inside input */}
          <div
            style={{
              position: "absolute",
              right: "10px",
              top: "50%",
              transform: "translateY(-50%)",
              pointerEvents: "none",
            }}
          >
            🔍
          </div>
        </div>

        {/* MIC BTN */}
        <button style={iconBtn}>🎤</button>
      </div>

      {/* ⭐ CATEGORY SELECTOR */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "12px",
          overflowX: "auto",
          padding: "12px 0",
          marginTop: "10px",
        }}
      >
        {/* All */}
        <div
          onClick={() => filterByCategory("all")}
          style={{
            minWidth: "90px",
            padding: "10px",
            borderRadius: "16px",
            textAlign: "center",
            background:
              selectedCat === "all"
                ? "rgba(0,195,255,0.25)"
                : "rgba(255,255,255,0.7)",
            border:
              selectedCat === "all"
                ? "2px solid #00c3ff"
                : "2px solid #b8d8e8",
            color: "#009de0",
            fontWeight: 700,
            cursor: "pointer",
            boxShadow: "0 2px 8px rgba(0,195,255,0.25)",
          }}
        >
          All
        </div>

        {/* Dynamic categories */}
        {categories.map((cat) => (
          <div
            key={cat.id}
            onClick={() => filterByCategory(cat.slug)}
            style={{
              minWidth: "90px",
              padding: "10px",
              borderRadius: "16px",
              textAlign: "center",
              background:
                selectedCat === cat.slug
                  ? "rgba(0,195,255,0.25)"
                  : "rgba(255,255,255,0.7)",
              border:
                selectedCat === cat.slug
                  ? "2px solid #00c3ff"
                  : "2px solid #b8d8e8",
              color: "#009de0",
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(0,195,255,0.25)",
            }}
          >
            <div style={{ fontSize: "26px" }}>{cat.icon}</div>
            <div style={{ fontSize: "0.8rem", fontWeight: 600 }}>
              {cat.name}
            </div>
          </div>
        ))}
      </div>

      {/* Banner */}
      <BannerAd ads={ads} />

      {/* Products Title */}
      <h1 style={{ color: "#00b7ff", marginTop: "18px" }}>Products</h1>

      {/* PRODUCT GRID */}
      <div
        style={{
          display: "grid",
          gap: "12px",
          gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
          marginTop: "10px",
          marginBottom: "40px",
        }}
      >
        {filtered.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </main>
  );
        }
        
