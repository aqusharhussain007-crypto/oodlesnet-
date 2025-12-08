"use client";

import { useState, useEffect, useRef } from "react";
import ProductCard from "@/components/ProductCard";
import { db } from "@/lib/firebase-app";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import BannerAd from "@/components/ads/BannerAd";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [ads, setAds] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCat, setSelectedCat] = useState("all");
  const [trending, setTrending] = useState([]);

  const sliderRef = useRef(null);

  // 🚀 Infinite slider speed
  const SLIDE_SPEED = 0.6; // Smaller = faster

  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return;

    let scrollAmount = 0;

    function autoScroll() {
      if (!slider) return;

      scrollAmount += SLIDE_SPEED;
      slider.scrollLeft = scrollAmount;

      if (scrollAmount >= slider.scrollWidth / 2) {
        scrollAmount = 0;
        slider.scrollLeft = 0;
      }

      requestAnimationFrame(autoScroll);
    }

    autoScroll();
  }, []);

  // Fetch Products
  useEffect(() => {
    async function loadProducts() {
      const snap = await getDocs(collection(db, "products"));
      const items = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setProducts(items);
      setFiltered(items);

      // 🔥 Sort trending (high views first)
      const trendingSorted = [...items]
        .filter((p) => p.views !== undefined)
        .sort((a, b) => b.views - a.views);

      setTrending(trendingSorted);
    }
    loadProducts();
  }, []);

  // Fetch Ads
  useEffect(() => {
    async function loadAds() {
      const snap = await getDocs(collection(db, "ads"));
      const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setAds(items);
    }
    loadAds();
  }, []);

  // Fetch Categories
  useEffect(() => {
    async function loadCategories() {
      const snap = await getDocs(collection(db, "categories"));
      const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setCategories(items);
    }
    loadCategories();
  }, []);

  // Category Filter
  function filterByCategory(slug) {
    setSelectedCat(slug);

    if (slug === "all") {
      setFiltered(products);
    } else {
      setFiltered(products.filter((p) => p.categorySlug === slug));
    }
  }

  // Search Logic
  useEffect(() => {
    if (!search) {
      setFiltered(products);
      return;
    }

    const results = products.filter((p) =>
      p.name.toLowerCase().includes(search.toLowerCase())
    );
    setFiltered(results);
  }, [search, products]);

  // Mic Button Style
  const iconButton = {
    width: "45px",
    height: "45px",
    borderRadius: "12px",
    background: "rgba(0,200,255,0.8)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    boxShadow: "0 0 10px rgba(0,200,255,0.7)",
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
            className="search-bar"
            style={{
              width: "100%",
              height: "50px",
              borderRadius: "14px",
              paddingLeft: "14px",
              paddingRight: "40px",
              fontSize: "1rem",
              border: "2px solid #00c3ff",
            }}
          />

          {/* Correct Search Icon A */}
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

        {/* Mic Icon D */}
        <div style={iconButton}>🎤</div>
      </div>

      {/* 🔥 TRENDING SLIDER (Infinite Loop) */}
      <h2 style={{ marginTop: "18px", color: "#00b7ff" }}>🔥 Trending Today</h2>

      <div
        ref={sliderRef}
        style={{
          display: "flex",
          overflow: "hidden",
          whiteSpace: "nowrap",
          gap: "12px",
          padding: "10px 4px",
        }}
      >
        {[...trending, ...trending].map((item, index) => (
          <div
            key={index}
            style={{
              minWidth: "260px",
              borderRadius: "14px",
              padding: "12px",
              background: "linear-gradient(135deg,#e0fff7,#e6f7ff)",
              boxShadow: "0 4px 12px rgba(0,195,255,0.3)",
              cursor: "pointer",
            }}
          >
            <div style={{ fontWeight: 600, fontSize: "1.0rem" }}>
              {item.name}
            </div>
            <div style={{ fontSize: "0.9rem", opacity: 0.7 }}>
              Views: {item.views}
            </div>
          </div>
        ))}
      </div>

      {/* CATEGORIES */}
      <h2 style={{ marginTop: "10px", color: "#00b7ff" }}>Categories</h2>

      <div
        style={{
          display: "flex",
          overflowX: "auto",
          gap: "12px",
          padding: "8px 0",
        }}
      >
        <div
          onClick={() => filterByCategory("all")}
          style={{
            minWidth: "110px",
            borderRadius: "14px",
            padding: "12px",
            textAlign: "center",
            cursor: "pointer",
            background:
              selectedCat === "all"
                ? "rgba(0,195,255,0.15)"
                : "rgba(255,255,255,0.7)",
            border:
              selectedCat === "all"
                ? "2px solid #00c3ff"
                : "2px solid #bbddee",
          }}
        >
          All
        </div>

        {categories.map((cat) => (
          <div
            key={cat.id}
            onClick={() => filterByCategory(cat.slug)}
            style={{
              minWidth: "110px",
              borderRadius: "14px",
              padding: "12px",
              textAlign: "center",
              cursor: "pointer",
              background:
                selectedCat === cat.slug
                  ? "rgba(0,195,255,0.15)"
                  : "rgba(255,255,255,0.7)",
              border:
                selectedCat === cat.slug
                  ? "2px solid #00c3ff"
                  : "2px solid #bbddee",
            }}
          >
            <div style={{ fontSize: "22px" }}>{cat.icon}</div>
            <div style={{ marginTop: "4px" }}>{cat.name}</div>
          </div>
        ))}
      </div>

      {/* ADS */}
      <BannerAd ads={ads} />

      {/* PRODUCTS */}
      <h1 style={{ marginTop: "16px", color: "#00b7ff" }}>Products</h1>

      <div style={{ display: "grid", gap: "1rem" }}>
        {filtered.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </main>
  );
        }
  
