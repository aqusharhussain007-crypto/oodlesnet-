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
        console.log("Ads Error:", err);
      }
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
    <main className="page-container" style={{ paddingBottom: "40px" }}>

      {/* 🔎 CLEAN FLOATING SEARCH BAR */}
      <div
        style={{
          marginTop: "10px",
          padding: "0 10px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          position: "sticky",
          top: "66px",
          zIndex: 200,
          background: "transparent",
        }}
      >
        {/* SEARCH INPUT */}
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: 1,
            height: "42px",
            borderRadius: "12px",
            border: "2px solid #00c3ff",
            paddingLeft: "12px",
            background: "rgba(255,255,255,0.60)",
            fontSize: "1rem",
            color: "#003344",
            boxShadow: "0 0 10px rgba(0,200,255,0.35)",
          }}
        />

        {/* SEARCH BUTTON */}
        <button
          style={{
            width: "42px",
            height: "42px",
            borderRadius: "12px",
            background: "rgba(0,200,255,0.90)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "none",
            boxShadow: "0 0 12px rgba(0,200,255,0.6)",
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="white"
          >
            <path d="M15.5 14h-.8l-.3-.3a6.5 6.5 0 10-.7.7l.3.3v.8l5 5 1.5-1.5-5-5zm-6 0A4.5 4.5 0 1114 9.5 4.5 4.5 0 019.5 14z" />
          </svg>
        </button>

        {/* MIC BUTTON */}
        <button
          onClick={startVoiceSearch}
          style={{
            width: "42px",
            height: "42px",
            borderRadius: "12px",
            background: "rgba(0,200,255,0.90)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "none",
            boxShadow: "0 0 12px rgba(0,200,255,0.6)",
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="white"
          >
            <path d="M12 14a3 3 0 003-3V5a3 3 0 10-6 0v6a3 3 0 003 3zm5-3a5 5 0 01-10 0H5a7 7 0 0014 0h-2zm-5 8a7 7 0 007-7h-2a5 5 0 01-10 0H5a7 7 0 007 7zm-1 2h2v3h-2v-3z" />
          </svg>
        </button>
      </div>

      {/* AUTOCOMPLETE RESULTS */}
      {suggestions.length > 0 && (
        <div
          className="autocomplete-box"
          style={{ marginTop: "4px", paddingLeft: "10px", paddingRight: "10px" }}
        >
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

      {/* 🔥 BANNER ADS */}
      <div className="mt-3 px-3">
        <BannerAd ads={ads} />
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
      
