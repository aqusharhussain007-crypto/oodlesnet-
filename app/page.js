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

  // Filter
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

      {/* SEARCH BAR */}
      <div
        style={{
          marginTop: "0px",
          padding: "6px 0",
          background: "rgba(255,255,255,0.4)",
          backdropFilter: "blur(10px)",
          position: "sticky",
          top: "50px",
          zIndex: 50,
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "4px",
            alignItems: "center",
            padding: "0 8px",
          }}
        >
          <input
            type="text"
            className="search-bar"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              flex: 1,
              height: "40px",
              borderRadius: "12px",
              border: "1.6px solid #00c3ff",
              paddingLeft: "12px",
            }}
          />

          <button
            className="btn-glow"
            style={{
              width: "36px",
              height: "40px",
              borderRadius: "10px",
              background: "#00c3ff",
            }}
          >
            🔍
          </button>

          <button
            onClick={startVoiceSearch}
            style={{
              width: "36px",
              height: "40px",
              borderRadius: "10px",
              background: "#00c3ff",
            }}
          >
            🎤
          </button>
        </div>

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

      {/* BANNER AD */}
      <div className="mb-4 px-3">
        <BannerAd ads={ads} />
      </div>

      {/* TITLE */}
      <h1 style={{ marginTop: "10px", marginBottom: "8px", color: "#00b7ff" }}>
        Products
      </h1>

      {/* PRODUCTS GRID */}
      <div
        style={{
          display: "grid",
          gap: "0.8rem",
          gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
          marginTop: "10px",
          marginBottom: "20px",
        }}
      >
        {filtered.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </main>
  );
      }
      
