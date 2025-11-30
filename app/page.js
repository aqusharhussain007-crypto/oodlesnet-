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

      {/* 🔍 SEARCH BAR SECTION */}
      <div
        style={{
          marginTop: "8px",
          padding: "10px 0",
          background: "#e9ecf1",
          position: "sticky",
          top: "70px",
          zIndex: 50,
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "6px",
            alignItems: "center",
            padding: "0 8px",
          }}
        >
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-bar"
            style={{
              flex: 1,
              height: "44px",
              fontSize: "1rem",
              borderRadius: "10px",
              border: "2px solid #00b7ff",
              paddingLeft: "12px",
              background: "white",
            }}
          />

          {/* Search Button */}
          <button
            className="btn-glow"
            style={{
              width: "44px",
              height: "44px",
              fontSize: "1.2rem",
              borderRadius: "10px",
            }}
          >
            🔍
          </button>

          {/* Voice Button */}
          <button
            onClick={startVoiceSearch}
            className="btn-glow"
            style={{
              width: "44px",
              height: "44px",
              fontSize: "1.2rem",
              borderRadius: "10px",
            }}
          >
            🎤
          </button>
        </div>

        {/* AUTOCOMPLETE DROPDOWN */}
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
          
