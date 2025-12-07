"use client";

import { useState, useEffect } from "react";
import ProductCard from "@/components/ProductCard";
import { db } from "@/lib/firebase-app";
import { collection, getDocs } from "firebase/firestore";
import BannerAd from "@/components/ads/BannerAd";
import Link from "next/link";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [ads, setAds] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCat, setSelectedCat] = useState("all");

  // Load Products
  useEffect(() => {
    async function load() {
      const snap = await getDocs(collection(db, "products"));
      const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setProducts(items);
      setFiltered(items);
    }
    load();
  }, []);

  // Load Ads
  useEffect(() => {
    async function loadAds() {
      const snap = await getDocs(collection(db, "ads"));
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setAds(list);
    }
    loadAds();
  }, []);

  // Load Categories
  useEffect(() => {
    async function loadCats() {
      const snap = await getDocs(collection(db, "categories"));
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setCategories(list);
    }
    loadCats();
  }, []);

  // Filter Products
  function filterByCategory(slug) {
    setSelectedCat(slug);
    if (slug === "all") return setFiltered(products);
    setFiltered(products.filter((p) => p.categorySlug === slug));
  }

  return (
    <main className="page-container">

      {/* Category Row */}
      <div
        style={{
          display: "flex",
          overflowX: "auto",
          gap: "14px",
          padding: "12px 4px",
          whiteSpace: "nowrap",
        }}
      >
        {/* ALL option */}
        <div
          onClick={() => filterByCategory("all")}
          style={{
            minWidth: "110px",
            padding: "12px",
            borderRadius: "15px",
            background:
              selectedCat === "all"
                ? "rgba(0,195,255,0.2)"
                : "rgba(240,255,255,0.9)",
            border:
              selectedCat === "all" ? "2px solid #00c3ff" : "2px solid #bbddee",
            textAlign: "center",
            cursor: "pointer",
          }}
        >
          <strong style={{ color: "#00a4dd" }}>All</strong>
        </div>

        {/* Category Cards */}
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/category/${cat.slug}`}
            style={{ textDecoration: "none" }}
          >
            <div
              onClick={() => filterByCategory(cat.slug)}
              style={{
                minWidth: "110px",
                padding: "12px",
                borderRadius: "15px",
                background:
                  selectedCat === cat.slug
                    ? "rgba(0,195,255,0.2)"
                    : "rgba(240,255,255,0.9)",
                border:
                  selectedCat === cat.slug
                    ? "2px solid #00c3ff"
                    : "2px solid #bbddee",
                textAlign: "center",
                cursor: "pointer",
              }}
            >
              {/* Icon FIX */}
              <img
                src={
                  cat.iconUrl && cat.iconUrl.length > 5
                    ? cat.iconUrl
                    : "https://via.placeholder.com/40?text=?"
                }
                style={{
                  width: "40px",
                  height: "40px",
                  objectFit: "contain",
                  margin: "auto",
                }}
              />

              <div
                style={{
                  marginTop: "6px",
                  color: "#0088cc",
                  fontWeight: "600",
                  fontSize: "0.9rem",
                }}
              >
                {cat.name}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Ads */}
      <div className="px-3 mt-1">
        <BannerAd ads={ads} />
      </div>

      {/* Products */}
      <h1 style={{ marginTop: "16px", color: "#00b7ff" }}>Products</h1>

      <div
        style={{
          display: "grid",
          gap: "1rem",
          gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))",
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
        
