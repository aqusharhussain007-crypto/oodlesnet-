"use client";

import { useState, useEffect } from "react";
import ProductCard from "@/components/ProductCard";
import { db } from "@/lib/firebase-app";
import { collection, getDocs } from "firebase/firestore";
import BannerAd from "@/components/ads/BannerAd";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [ads, setAds] = useState([]);

  // Load Products
  useEffect(() => {
    async function loadProducts() {
      const snap = await getDocs(collection(db, "products"));
      const items = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProducts(items);
      setFiltered(items);
    }
    loadProducts();
  }, []);

  // Load Ads
  useEffect(() => {
    async function loadAds() {
      try {
        const snap = await getDocs(collection(db, "ads"));
        const items = snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setAds(items);
      } catch (err) {
        console.log("ADS ERROR:", err);
      }
    }
    loadAds();
  }, []);

  // Voice Search
  function startVoiceSearch() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return alert("Voice search not supported.");

    const recog = new SR();
    recog.lang = "en-IN";

    recog.onresult = (event) => {
      const text = event.results[0][0].transcript;
      setSearch(text);
    };

    recog.start();
  }

  // Filtering + Autocomplete
  useEffect(() => {
    if (!search) {
      setSuggestions([]);
      setFiltered(products);
      return;
    }

    const matched = products.filter((p) =>
      p.name.toLowerCase().includes(search.toLowerCase())
    );

    setSuggestions(matched.slice(0, 5));
    setFiltered(matched);
  }, [search, products]);

  // White Icon Button Style
  const iconButtonStyle = {
    width: "42px",
    height: "42px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "6px",
    borderRadius: "12px",
    overflow: "visible",
    background: "rgba(0, 200, 255, 0.75)",
    boxShadow: "0 0 10px rgba(0,200,255,0.7)",
  };

  return (
    <main className="page-container">

      {/* 🔍 Search Section */}
      <div
        style={{
          marginTop: "14px",   // ⭐ Updated spacing
          marginBottom: "10px",
          padding: "4px 10px",
          background: "rgba(255,255,255,0.3)",
          backdropFilter: "blur(10px)",
          position: "sticky",
          top: "68px",
          zIndex: 50,
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "6px",
            alignItems: "center",
          }}
        >
          {/* Input Box */}
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              flex: 1,
              height: "46px",
              borderRadius: "12px",
              fontSize: "1rem",
              paddingLeft: "14px",
              border: "2px solid #00c3ff",
              background: "rgba(255,255,255,0.8)",
              boxShadow: "0 0 8px rgba(0,195,255,0.4)",
            }}
          />

          {/* Search Button */}
          <button style={iconButtonStyle}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              fill="white"
              viewBox="0 0 24 24"
            >
              <path d="M10 2a8 8 0 105.293 14.293l4.707 4.707 1.414-1.414-4.707-4.707A8 8 0 0010 2zm0 2a6 6 0 110 12A6 6 0 0110 4z" />
            </svg>
          </button>

          {/* Mic Button */}
          <button onClick={startVoiceSearch} style={iconButtonStyle}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              fill="white"
              viewBox="0 0 24 24"
            >
              <path d="M12 14a3 3 0 003-3V5a3 3 0 00-6 0v6a3 3 0 003 3zm5-3a5 5 0 01-10 0H5a7 7 0 0014 0h-2zm-5 8a7 7 0 007-7h-2a5 5 0 01-10 0H5a7 7 0 007 7zm-1 2h2v3h-2v-3z" />
            </svg>
          </button>
        </div>

        {/* Autocomplete */}
        {suggestions.length > 0 && (
          <div className="autocomplete-box">
            {suggestions.map((item) => (
              <div
                key={item.id}
                className="autocomplete-item"
                onClick={() => {
                  setSearch(item.name);
                  setSuggestions([]);
                }}
              >
                {item.name}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 🟩 Banner */}
      <div className="px-3 mt-0">
        <BannerAd ads={ads} />
      </div>

      {/* Title */}
      <h1 style={{ marginTop: "14px", marginBottom: "10px", color: "#00b7ff" }}>
        Products
      </h1>

      {/* Product Grid */}
      <div
        style={{
          display: "grid",
          gap: "0.8rem",
          gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
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
