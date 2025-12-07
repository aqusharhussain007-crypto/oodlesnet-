"use client";

import { useState, useEffect } from "react";
import ProductCard from "@/components/ProductCard";
import TrendingSlider from "@/components/TrendingSlider";
import BannerAd from "@/components/ads/BannerAd";

import { db } from "@/lib/firebase-app";
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit
} from "firebase/firestore";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [categories, setCategories] = useState([]);
  const [ads, setAds] = useState([]);

  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [selectedCat, setSelectedCat] = useState("all");

  const [trending, setTrending] = useState([]);

  // ---------------------------
  // LOAD PRODUCTS
  // ---------------------------
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

  // ---------------------------
  // LOAD ADS
  // ---------------------------
  useEffect(() => {
    async function loadAds() {
      const snap = await getDocs(collection(db, "ads"));
      const items = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAds(items);
    }
    loadAds();
  }, []);

  // ---------------------------
  // LOAD CATEGORIES
  // ---------------------------
  useEffect(() => {
    async function loadCategories() {
      const snap = await getDocs(collection(db, "categories"));
      const items = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCategories(items);
    }
    loadCategories();
  }, []);

  // ---------------------------
  // 🔥 LOAD TRENDING (Top 10 by views)
  // ---------------------------
  useEffect(() => {
    async function loadTrending() {
      const q = query(
        collection(db, "products"),
        orderBy("views", "desc"),
        limit(10)
      );

      const snap = await getDocs(q);
      const items = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTrending(items);
    }

    loadTrending();
  }, []);

  // ---------------------------
  // CATEGORY FILTER
  // ---------------------------
  function filterByCategory(slug) {
    setSelectedCat(slug);

    if (slug === "all") {
      setFiltered(products);
      return;
    }

    setFiltered(products.filter(p => p.categorySlug === slug));
  }

  // ---------------------------
  // VOICE SEARCH
  // ---------------------------
  function startVoiceSearch() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return alert("Voice search not supported.");

    const recog = new SR();
    recog.lang = "en-IN";
    recog.onresult = (event) =>
      setSearch(event.results[0][0].transcript);

    recog.start();
  }

  // ---------------------------
  // TEXT SEARCH
  // ---------------------------
  useEffect(() => {
    if (!search) {
      setFiltered(products);
      setSuggestions([]);
      return;
    }

    const match = products.filter((p) =>
      p.name.toLowerCase().includes(search.toLowerCase())
    );

    setFiltered(match);
    setSuggestions(match.slice(0, 5));
  }, [search, products]);

  // Mic button style
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

      {/* --------------------------------- */}
      {/* 🔍 SEARCH BAR */}
      {/* --------------------------------- */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          marginTop: "12px",
          marginBottom: "12px",
        }}
      >
        {/* Input */}
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
              borderRadius: "12px",
              fontSize: "1rem",
              paddingLeft: "14px",
              paddingRight: "42px",
              border: "2px solid #00c3ff",
              background: "rgba(255,255,255,0.85)",
              boxShadow: "0 0 8px rgba(0,195,255,0.4)",
            }}
          />

          {/* Search Icon */}
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

        {/* Mic Button */}
        <button onClick={startVoiceSearch} style={iconButtonStyle}>
          <svg width="22" height="22" fill="white" viewBox="0 0 24 24">
            <path d="M12 14a3 3 0 003-3V5a3 3 0 00-6 0v6a3 3 0 003 3zm5-3a5 5 0 01-10 0H5a7 7 0 0014 0h-2zm-5 8a7 7 0 007-7h-2a5 5 0 01-10 0H5a7 7 0 007 7zm-1 2h2v3h-2v-3z" />
          </svg>
        </button>
      </div>

      {/* --------------------------------- */}
      {/* 🟦 BANNER */}
      {/* --------------------------------- */}
      <div className="px-3 mt-1">
        <BannerAd ads={ads} />
      </div>

      {/* --------------------------------- */}
      {/* 🔥 TRENDING SLIDER */}
      {/* --------------------------------- */}
      <TrendingSlider products={trending} />

      {/* --------------------------------- */}
      {/* CATEGORY ROW */}
      {/* --------------------------------- */}
      <div
        style={{
          display: "flex",
          overflowX: "auto",
          padding: "10px 6px",
          gap: "10px",
          whiteSpace: "nowrap",
        }}
      >
        {/* ALL */}
        <div
          onClick={() => filterByCategory("all")}
          style={{
            minWidth: "110px",
            padding: "12px",
            borderRadius: "14px",
            border: selectedCat === "all" ? "3px solid #00c3ff" : "2px solid #ccc",
            background: selectedCat === "all" ? "rgba(0,195,255,0.2)" : "white",
            textAlign: "center",
            cursor: "pointer",
          }}
        >
          <strong>All</strong>
        </div>

        {/* LOOP CATEGORIES */}
        {categories.map((cat) => (
          <div
            key={cat.id}
            onClick={() => filterByCategory(cat.slug)}
            style={{
              minWidth: "120px",
              padding: "12px",
              borderRadius: "14px",
              border:
                selectedCat === cat.slug
                  ? "3px solid #00c3ff"
                  : "2px solid #ccc",
              background:
                selectedCat === cat.slug
                  ? "rgba(0,195,255,0.2)"
                  : "white",
              textAlign: "center",
              cursor: "pointer",
            }}
          >
            <div style={{ fontSize: "26px" }}>{cat.icon}</div>
            <div style={{ marginTop: "4px", color: "#0088cc", fontWeight: 600 }}>
              {cat.name}
            </div>
          </div>
        ))}
      </div>

      {/* --------------------------------- */}
      {/* PRODUCTS */}
      {/* --------------------------------- */}
      <h1 style={{ marginTop: "16px", color: "#00b7ff" }}>Products</h1>

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
          
