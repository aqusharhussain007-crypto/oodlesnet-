"use client";

import { useState, useEffect } from "react";
import ProductCard from "@/components/ProductCard";
import { db } from "@/lib/firebase-app";
import { collection, getDocs } from "firebase/firestore";
import BannerAd from "@/components/ads/BannerAd";
import Image from "next/image";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [ads, setAds] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCat, setSelectedCat] = useState("all");
  const [recent, setRecent] = useState([]);
  const [trending, setTrending] = useState([]);

  /* ---------------- LOAD PRODUCTS ---------------- */
  useEffect(() => {
    async function loadProducts() {
      const snap = await getDocs(collection(db, "products"));
      const items = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      setProducts(items);
      setFiltered(items);

      // trending = highest impressions (top 10)
      const sorted = [...items]
        .sort((a, b) => (b.impressions || 0) - (a.impressions || 0))
        .slice(0, 10);

      setTrending(sorted);
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

    if (slug === "all") {
      setFiltered(products);
      return;
    }
    setFiltered(products.filter((p) => p.categorySlug === slug));
  }

  /* ---------------- VOICE SEARCH ---------------- */
  function startVoiceSearch() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return alert("Voice search not supported.");

    const recog = new SR();
    recog.lang = "en-IN";

    recog.onresult = (e) => {
      setSearch(e.results[0][0].transcript);
    };

    recog.start();
  }

  /* ---------------- TEXT SEARCH ---------------- */
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

  /* ---------------- REUSABLE ICON BUTTON ---------------- */
  const iconButton = {
    width: "42px",
    height: "42px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "12px",
    background: "rgba(0,200,255,0.75)",
    boxShadow: "0 0 10px rgba(0,200,255,0.7)",
  };

  /* ===========================================================
            UI STARTS HERE
  =========================================================== */

  return (
    <main className="page-container">

      {/* ---------------- SEARCH BAR ---------------- */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          marginTop: "12px",
        }}
      >
        {/* SEARCH INPUT */}
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
              background: "rgba(255,255,255,0.9)",
            }}
          />

          {/* SEARCH ICON */}
          <svg
            width="22"
            height="22"
            fill="#00c3ff"
            viewBox="0 0 24 24"
            style={{
              position: "absolute",
              right: "10px",
              top: "50%",
              transform: "translateY(-50%)",
              pointerEvents: "none",
            }}
          >
            <path d="M10 2a8 8 0 105.293 14.293l4.707 4.707 1.414-1.414-4.707-4.707A8 8 0 0010 2zm0 2a6 6 0 110 12A6 6 0 0110 4z" />
          </svg>
        </div>

        {/* MIC BUTTON */}
        <button onClick={startVoiceSearch} style={iconButton}>
          <svg width="22" height="22" fill="white" viewBox="0 0 24 24">
            <path d="M12 14a3 3 0 003-3V5a3 3 0 00-6 0v6a3 3 0 003 3zm5-3a5 5 0 01-10 0H5a7 7 0 0014 0h-2zm-5 8a7 7 0 007-7h-2a5 5 0 01-10 0H5a7 7 0 007 7zm-1 2h2v3h-2v-3z" />
          </svg>
        </button>
      </div>

      {/* ---------------- BANNER ---------------- */}
      <div className="mt-2 px-2">
        <BannerAd ads={ads} />
      </div>

      {/* ---------------- TRENDING TODAY ---------------- */}
      <h2 className="text-xl font-bold text-blue-500 mt-5 mb-2">
        Trending Today
      </h2>

      <div className="flex overflow-x-auto gap-3 no-scrollbar pb-2">
        {trending.map((item) => (
          <div
            key={item.id}
            onClick={() => (window.location = `/product/${item.id}`)}
            style={{
              minWidth: "120px",
              background: "white",
              borderRadius: "14px",
              padding: "10px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              cursor: "pointer",
              textAlign: "center",
            }}
          >
            <Image
              src={item.imageUrl}
              width={120}
              height={120}
              alt={item.name}
              style={{
                borderRadius: "10px",
                objectFit: "cover",
              }}
            />
            <p
              style={{
                fontSize: "0.85rem",
                marginTop: "4px",
                fontWeight: 600,
                color: "#0077aa",
              }}
            >
              {item.name}
            </p>
          </div>
        ))}
      </div>

      {/* ---------------- RECENTLY VIEWED ---------------- */}
      {recent.length > 0 && (
        <>
          <h2 className="text-xl font-bold text-blue-500 mt-6 mb-2">
            Recently Viewed
          </h2>

          <div className="flex overflow-x-auto gap-3 no-scrollbar pb-2">
            {recent.map((item) => (
              <div
                key={item.id}
                onClick={() => (window.location = `/product/${item.id}`)}
                style={{
                  minWidth: "120px",
                  background: "white",
                  borderRadius: "14px",
                  padding: "10px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  cursor: "pointer",
                  textAlign: "center",
                }}
              >
                <Image
                  src={item.imageUrl}
                  width={120}
                  height={120}
                  alt={item.name}
                  style={{
                    borderRadius: "10px",
                    objectFit: "cover",
                  }}
                />
                <p
                  style={{
                    fontSize: "0.85rem",
                    marginTop: "4px",
                    fontWeight: 600,
                    color: "#0077aa",
                  }}
                >
                  {item.name}
                </p>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ---------------- CATEGORY ROW ---------------- */}
      <h2 className="text-xl font-bold text-blue-500 mt-6 mb-2">Categories</h2>

      <div
        style={{
          display: "flex",
          overflowX: "auto",
          gap: "12px",
          whiteSpace: "nowrap",
          paddingBottom: "8px",
        }}
      >
        {/* ALL category */}
        <div
          onClick={() => filterByCategory("all")}
          style={{
            minWidth: "120px",
            background:
              selectedCat === "all"
                ? "rgba(0,195,255,0.15)"
                : "rgba(255,255,255,0.7)",
            border:
              selectedCat === "all"
                ? "2px solid #00c3ff"
                : "2px solid #aacbe3",
            borderRadius: "14px",
            textAlign: "center",
            padding: "10px",
            cursor: "pointer",
          }}
        >
          <strong style={{ color: "#0088cc" }}>All</strong>
        </div>

        {categories.map((c) => (
          <div
            key={c.id}
            onClick={() => filterByCategory(c.slug)}
            style={{
              minWidth: "120px",
              background:
                selectedCat === c.slug
                  ? "rgba(0,195,255,0.15)"
                  : "rgba(255,255,255,0.7)",
              border:
                selectedCat === c.slug
                  ? "2px solid #00c3ff"
                  : "2px solid #aacbe3",
              borderRadius: "14px",
              textAlign: "center",
              padding: "10px",
              cursor: "pointer",
            }}
          >
            <div style={{ fontSize: "30px" }}>{c.icon}</div>
            <div style={{ marginTop: "4px", color: "#0088cc", fontWeight: 600 }}>
              {c.name}
            </div>
          </div>
        ))}
      </div>

      {/* ---------------- PRODUCT GRID ---------------- */}
      <h1
        style={{
          marginTop: "18px",
          color: "#00b7ff",
          fontSize: "1.4rem",
          fontWeight: "700",
        }}
      >
        Products
      </h1>

      <div
        style={{
          display: "grid",
          gap: "0.9rem",
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
  
