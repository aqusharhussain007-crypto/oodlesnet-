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
  const [suggestions, setSuggestions] = useState([]);
  const [ads, setAds] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCat, setSelectedCat] = useState("all");

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
      setCategories(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    }
    loadCats();
  }, []);

  // Category filter
  function filterByCategory(slug) {
    setSelectedCat(slug);
    if (slug === "all") return setFiltered(products);
    setFiltered(products.filter((p) => p.categorySlug === slug));
  }

  // Voice search
  function startVoice() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return alert("Speech recognition not supported.");

    const recog = new SR();
    recog.lang = "en-IN";
    recog.onresult = (e) => setSearch(e.results[0][0].transcript);
    recog.start();
  }

  // Search filter
  useEffect(() => {
    if (!search) {
      setFiltered(products);
      setSuggestions([]);
      return;
    }
    const s = search.toLowerCase();
    const match = products.filter((p) =>
      p.name.toLowerCase().includes(s)
    );
    setFiltered(match);
    setSuggestions(match.slice(0, 5));
  }, [search, products]);

  // Mic button style
  const micBtn = {
    width: "45px",
    height: "45px",
    borderRadius: "14px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#00c3ff",
    boxShadow: "0 0 10px rgba(0,200,255,0.6)",
  };

  return (
    <main className="page-container">

      {/* SEARCH BAR ROW */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          marginTop: "12px",
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
              height: "48px",
              borderRadius: "14px",
              paddingLeft: "16px",
              paddingRight: "42px",
              border: "2px solid #00c3ff",
              background: "#ffffffee",
            }}
          />

          {/* SEARCH ICON — Style A */}
          <div
            style={{
              position: "absolute",
              right: "10px",
              top: "50%",
              transform: "translateY(-50%)",
              width: "26px",
              height: "26px",
            }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="#00bfff"
              width="26"
              height="26"
            >
              <path d="M10 2a8 8 0 105.293 14.293l4.707 4.707 1.414-1.414-4.707-4.707A8 8 0 0010 2zm0 2a6 6 0 110 12A6 6 0 0110 4z" />
            </svg>
          </div>
        </div>

        {/* MIC BUTTON — Style D */}
        <button onClick={startVoice} style={micBtn}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="white">
            <path d="M12 14a3 3 0 003-3V5a3 3 0 10-6 0v6a3 3 0 003 3zm5-3a5 5 0 01-10 0H5a7 7 0 0014 0h-2zm-5 8a7 7 0 007-7h-2a5 5 0 01-10 0H5a7 7 0 007 7zm-1 2h2v3h-2v-3z" />
          </svg>
        </button>
      </div>

      {/* CATEGORY ROW (scrollable) */}
      <div
        style={{
          display: "flex",
          overflowX: "auto",
          gap: "14px",
          padding: "12px 2px",
          whiteSpace: "nowrap",
        }}
      >
        {/* ALL */}
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
                : "rgba(240,255,255,0.8)",
            border:
              selectedCat === "all"
                ? "2px solid #00c3ff"
                : "2px solid #bbddee",
            textAlign: "center",
            cursor: "pointer",
          }}
        >
          <strong style={{ color: "#00a4dd" }}>All</strong>
        </div>

        {/* DYNAMIC CATEGORIES */}
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
                  : "rgba(240,255,255,0.8)",
              border:
                selectedCat === cat.slug
                  ? "2px solid #00c3ff"
                  : "2px solid #bbddee",
              textAlign: "center",
              cursor: "pointer",
            }}
          >
            <img
              src={cat.iconUrl}
              style={{ width: "36px", height: "36px", objectFit: "contain" }}
            />
            <div
              style={{
                marginTop: "4px",
                fontSize: "0.9rem",
                fontWeight: "600",
                color: "#0088cc",
              }}
            >
              {cat.name}
            </div>
          </div>
        ))}
      </div>

      {/* ADS */}
      <div className="px-3 mt-1">
        <BannerAd ads={ads} />
      </div>

      {/* PRODUCTS TITLE */}
      <h1 style={{ marginTop: "18px", color: "#00b7ff" }}>Products</h1>

      {/* PRODUCT GRID */}
      <div
        style={{
          display: "grid",
          gap: "0.9rem",
          gridTemplateColumns: "repeat(auto-fill, minmax(165px, 1fr))",
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
    
