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

  // -----------------------------------------
  // Voice Search 🎤
  // -----------------------------------------
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

  // -----------------------------------------
  // Load Products from Firestore
  // -----------------------------------------
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

  // -----------------------------------------
  // Autocomplete + Search Filtering
  // -----------------------------------------
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

      {/* -----------------------------------------
          🔍 Search Bar Section (Updated Version)
      ------------------------------------------- */}
      <div
        style={{
          marginTop: "10px",
          padding: "12px 0",
          background: "#e9ecf1",
          position: "sticky",
          top: "70px",
          zIndex: 50,
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "8px",
            alignItems: "center",
            padding: "0 10px",
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
              height: "48px",
              fontSize: "1.05rem",
              borderRadius: "12px",
              border: "2px solid #00b7ff",
              paddingLeft: "14px",
              background: "white",
            }}
          />

          {/* Search Button */}
          <button
            className="btn-glow"
            style={{
              width: "50px",
              height: "48px",
              fontSize: "1.4rem",
              borderRadius: "12px",
              padding: 0,
            }}
          >
            🔍
          </button>

          {/* Voice Search */}
          <button
            onClick={startVoiceSearch}
            className="btn-glow"
            style={{
              width: "50px",
              height: "48px",
              fontSize: "1.4rem",
              borderRadius: "12px",
              padding: 0,
            }}
          >
            🎤
          </button>
        </div>
      </div>

      {/* -----------------------------------------
          Page Title
      ------------------------------------------- */}
      <h1 style={{ marginTop: "20px", color: "#00b7ff" }}>Products</h1>

      {/* -----------------------------------------
          Product Grid
      ------------------------------------------- */}
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
      
