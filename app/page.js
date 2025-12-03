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

  // Load products
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

  // Load ads
  useEffect(() => {
    async function loadAds() {
      const snap = await getDocs(collection(db, "ads"));
      const items = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAds(items);
    }
    loadAds();
  }, []);

  // Voice Search
  function startVoiceSearch() {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Your browser does not support voice search.");
      return;
    }

    const recog = new SpeechRecognition();
    recog.lang = "en-IN";

    recog.onresult = (event) => {
      const text = event.results[0][0].transcript;
      setSearch(text);
    };

    recog.start();
  }

  // Filter products
  useEffect(() => {
    if (!search) {
      setSuggestions([]);
      setFiltered(products);
      return;
    }

    const match = products.filter((p) =>
      p.name.toLowerCase().includes(search.toLowerCase())
    );

    setSuggestions(match.slice(0, 5));
    setFiltered(match);
  }, [search, products]);

  return (
    <main className="page-container">

      {/* 🌟 PREMIUM GLASS SEARCH BAR */}
      <div
        style={{
          marginTop: "0px",
          padding: "6px 0",
          background: "rgba(0,0,0,0.10)",
          backdropFilter: "blur(15px)",
          position: "sticky",
          top: "50px",
          zIndex: 50,
          borderBottom: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "6px",
            alignItems: "center",
            padding: "0 10px",
          }}
        >
          {/* Search Box */}
          <input
            type="text"
            placeholder="Search products…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              flex: 1,
              height: "42px",
              borderRadius: "14px",
              paddingLeft: "12px",
              background: "rgba(255,255,255,0.35)",
              backdropFilter: "blur(15px)",
              border: "1.4px solid rgba(0,200,255,0.6)",
              color: "#003244",
              fontSize: "0.95rem",
              boxShadow: "0 0 10px rgba(0,200,255,0.35)",
            }}
          />

          {/* 🔍 Search Button (SVG) */}
          <button
            style={{
              width: "38px",
              height: "42px",
              borderRadius: "12px",
              background: "rgba(0,200,255,0.75)",
              border: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 12px rgba(0,200,255,0.5)",
            }}
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="#003344"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="7"></circle>
              <line x1="16.65" y1="16.65" x2="21" y2="21"></line>
            </svg>
          </button>

          {/* 🎤 Microphone Button (Upgraded SVG) */}
          <button
            onClick={startVoiceSearch}
            style={{
              width: "38px",
              height: "42px",
              borderRadius: "12px",
              background: "rgba(0,200,255,0.75)",
              border: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 12px rgba(0,200,255,0.5)",
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              fill="#003344"
              stroke="white"
              strokeWidth="1"
              viewBox="0 0 24 24"
            >
              <path d="M12 14a3 3 0 0 0 3-3V5a3 3 0 1 0-6 0v6a3 3 0 0 0 3 3zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 14 0h-2zm-5 8a7 7 0 0 0 7-7h-2a5 5 0 0 1-10 0H5a7 7 0 0 0 7 7zm-1 2h2v3h-2v-3z" />
            </svg>
          </button>
        </div>

        {/* AUTOCOMPLETE */}
        {suggestions.length > 0 && (
          <div
            style={{
              marginTop: "6px",
              background: "rgba(255,255,255,0.85)",
              borderRadius: "10px",
              padding: "8px",
              marginLeft: "10px",
              marginRight: "10px",
              boxShadow: "0 0 8px rgba(0,0,0,0.2)",
            }}
          >
            {suggestions.map((item) => (
              <div
                key={item.id}
                style={{
                  padding: "6px 8px",
                  cursor: "pointer",
                  borderRadius: "6px",
                }}
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

      {/* BANNER */}
      <div style={{ marginTop: "10px" }} className="px-3">
        <BannerAd ads={ads} />
      </div>

      {/* TITLE */}
      <h1
        style={{
          marginTop: "14px",
          marginBottom: "10px",
          color: "#00b7ff",
          fontSize: "1.9rem",
        }}
      >
        Products
      </h1>

      {/* PRODUCT GRID */}
      <div
        style={{
          display: "grid",
          gap: "1rem",
          gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
          marginTop: "10px",
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
