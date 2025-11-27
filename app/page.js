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
      const items = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      setProducts(items);
      setFiltered(items);
    }
    loadProducts();
  }, []);

  // Autocomplete + Filter
  useEffect(() => {
    if (!search) {
      setSuggestions([]);
      setFiltered(products);
      return;
    }

    const match = products.filter(p =>
      p.name.toLowerCase().includes(search.toLowerCase())
    );

    setSuggestions(match.slice(0, 5));
    setFiltered(match);
  }, [search, products]);

  // Voice Search 🎤
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

  return (
    <main className="page-container">

      {/* Sticky Search Bar */}
      <div
        style={{
          position: "sticky",
          top: "72px",
          background: "#e9ecf1",
          zIndex: 50,
          paddingBottom: "10px",
          paddingTop: "10px"
        }}
      >
        <div style={{ position: "relative", display: "flex", gap: "10px" }}>

          {/* Search Input */}
          <input
            type="text"
            className="search-bar"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ flex: 1 }}
          />

          {/* Search Button */}
          <button
            className="btn-glow"
            style={{
              fontSize: "18px",
              padding: "0 14px",
              borderRadius: "8px"
            }}
          >
            🔍
          </button>

          {/* Voice Search */}
          <button
            onClick={startVoiceSearch}
            className="btn-glow"
            style={{
              fontSize: "18px",
              padding: "0 14px",
              borderRadius: "8px"
            }}
          >
            🎤
          </button>

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
      </div>

      {/* Title */}
      <h1 style={{ marginTop: "20px" }}>Products</h1>

      {/* Product Grid */}
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
