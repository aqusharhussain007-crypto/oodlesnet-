"use client";

import { useState, useEffect } from "react";
import ProductCard from "@/components/ProductCard";
import { db } from "@/lib/firebase-app";
import { collection, getDocs } from "firebase/firestore";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [filtered, setFiltered] = useState([]);

  // Load products from Firestore
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

  // Autocomplete + Filtering
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

      {/* Search Bar Section */}
      <div
        style={{
          marginTop: "8px",
          padding: "8px 0",
          background: "rgba(255,255,255,0.4)",
          backdropFilter: "blur(10px)",
          position: "sticky",
          top: "70px",
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
          {/* Input Box */}
          <input
            type="text"
            className="search-bar"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              flex: 1,
              height: "40px",
              fontSize: "0.95rem",
              borderRadius: "12px",
              border: "2px solid #00c3ff",
              outline: "none",
              paddingLeft: "12px",
              background: "rgba(255,255,255,0.75)",
              boxShadow: "0 0 8px rgba(0,195,255,0.4)",
              transition: "0.25s",
            }}
          />

          {/* Search Button */}
          <button
            className="btn-glow"
            style={{
              width: "36px",
              height: "40px",
              borderRadius: "10px",
              padding: 0,
              fontSize: "1.05rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#00c3ff",
              boxShadow: "0 0 6px rgba(0,195,255,0.6)",
            }}
          >
            🔍
          </button>

          {/* Voice Search Button */}
          <button
            onClick={startVoiceSearch}
            style={{
              width: "36px",
              height: "40px",
              borderRadius: "10px",
              padding: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#00c3ff",
              boxShadow: "0 0 6px rgba(0,195,255,0.7)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Mic Icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="white"
              viewBox="0 0 24 24"
            >
              <path d="M12 14a3 3 0 0 0 3-3V5a3 3 0 1 0-6 0v6a3 3 0 0 0 3 3zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 14 0h-2zm-5 8a7 7 0 0 0 7-7h-2a5 5 0 0 1-10 0H5a7 7 0 0 0 7 7zm-1 2h2v3h-2v-3z" />
            </svg>

            {/* Ripple Animation */}
            <span
              style={{
                position: "absolute",
                width: "100%",
                height: "100%",
                background: "rgba(255, 255, 255, 0.25)",
                borderRadius: "50%",
                animation: "pulse 1.8s infinite",
                zIndex: -1,
              }}
            ></span>
          </button>
        </div>

        {/* AUTOCOMPLETE */}
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

      <style>
        {`
          @keyframes pulse {
            0% { transform: scale(1); opacity: 0.7; }
            70% { transform: scale(1.8); opacity: 0; }
            100% { opacity: 0; }
          }
        `}
      </style>

      {/* TITLE */}
      <h1 style={{ marginTop: "16px", marginBottom: "10px", color: "#00b7ff" }}>
        Products
      </h1>

      {/* PRODUCT GRID */}
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
    
