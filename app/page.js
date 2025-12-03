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

  // Load Ads (Client-side Firestore)
  useEffect(() => {
    async function loadAds() {
      try {
        const snap = await getDocs(collection(db, "ads"));
        const items = snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setAds(items);
      } catch (error) {
        console.log("ADS ERROR:", error);
      }
    }
    loadAds();
  }, []);

  // ===== DEBUG MODE RETURN =====
  return (
    <div style={{ padding: "20px", color: "black" }}>
      <h2>🔥 DEBUG MODE (Temporary)</h2>

      <h3>Products Loaded:</h3>
      <pre
        style={{
          background: "#eee",
          padding: "8px",
          borderRadius: "8px",
          whiteSpace: "pre-wrap",
        }}
      >
        {JSON.stringify(products, null, 2)}
      </pre>

      <h3>Ads Loaded:</h3>
      <pre
        style={{
          background: "#ffe7c2",
          padding: "8px",
          borderRadius: "8px",
          whiteSpace: "pre-wrap",
        }}
      >
        {JSON.stringify(ads, null, 2)}
      </pre>

      <h3>Ads Count:</h3>
      <div
        style={{
          background: ads.length === 0 ? "red" : "green",
          color: "white",
          padding: "10px",
          borderRadius: "8px",
        }}
      >
        ads.length = {ads.length}
      </div>

      <p style={{ marginTop: "20px", fontSize: "0.9rem" }}>
        👉 If ads = [], Firestore is returning EMPTY.  
        👉 Tell me the entire content shown in "Ads Loaded".
      </p>
    </div>
  );
}
