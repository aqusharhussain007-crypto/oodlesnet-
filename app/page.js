"use client";

import { useState, useEffect } from "react";
import ProductCard from "@/components/ProductCard";
import { db } from "@/lib/firebase-app";
import { collection, getDocs } from "firebase/firestore";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [filtered, setFiltered] = useState([]);

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

  // Search + suggestions
  useEffect(() => {
    if (!searchText.trim()) {
      setSuggestions([]);
      setFiltered(products);
      return;
    }

    const match = products.filter((p) =>
      p.name.toLowerCase().includes(searchText.toLowerCase())
    );

    setSuggestions(match.slice(0, 5));
    setFiltered(match);
  }, [searchText, products]);

  // Voice Search
  function startVoiceSearch() {
    if (typeof window === "undefined") return;

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
      setSearchText(text);
    };
    recog.start();
  }

  return (
    <main className="page-container">
      {/* Search Bar */}
      <div
        style={{
          position: "sticky",
          top: "72px",
          background: "#e9ecf1",
          zIndex: 50,
          paddingBottom: "10px",
          paddingTop: "10px",
        }}
      >
        <div style={{ position: "relative", display: "flex", gap: "6px" }}>
          <input
            type="text"
            className="search-bar"
            placeholder="Search products..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ flex: 1 }}
          />

          <button
            className="btn-glow"
            style={{ fontSize: "18px", padding: "0 10px", borderRadius: "8px" }}
          >
            🔍
          </button>

          <button
            onClick={startVoiceSearch}
            className="btn-glow"
            style={{ fontSize: "18px", padding: "0 10px", borderRadius: "8px" }}
          >
            🎤
          </button>

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div className="autocomplete-box">
              {suggestions.map((item) => (
                <div
                  key={item.id}
                  className="autocomplete-item"
                  onClick={() => {
                    setSearchText(item.name);
                    setSuggestions([]);
                  }}
                >
                  {item.name}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <h1 style={{ marginTop: "20px" }}>Products</h1>

      <div
        style={{
          display: "grid",
          gap: "1rem",
          gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
          marginTop: "20px",
        }}
      >
        {filtered.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </main>
  );
                }
