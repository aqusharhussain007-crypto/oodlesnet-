"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import BannerAd from "@/components/ads/BannerAd";

import { db } from "@/lib/firebase-app";
import { collection, getDocs, updateDoc, doc, increment } from "firebase/firestore";

export default function Home() {
  const router = useRouter();

  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);

  const [search, setSearch] = useState("");
  const [categories, setCategories] = useState([]);
  const [selectedCat, setSelectedCat] = useState("all");
  const [ads, setAds] = useState([]);

  const [trending, setTrending] = useState([]);

  /* -----------------------------------------------------------
     LOAD PRODUCTS
  ----------------------------------------------------------- */
  useEffect(() => {
    async function load() {
      const snap = await getDocs(collection(db, "products"));
      const items = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProducts(items);
      setFiltered(items);

      // sort trending by views
      setTrending([...items].sort((a, b) => (b.views || 0) - (a.views || 0)));
    }
    load();
  }, []);

  /* -----------------------------------------------------------
     LOAD CATEGORIES
  ----------------------------------------------------------- */
  useEffect(() => {
    async function loadCategories() {
      const snap = await getDocs(collection(db, "categories"));
      const arr = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCategories(arr);
    }
    loadCategories();
  }, []);

  /* -----------------------------------------------------------
     LOAD ADS
  ----------------------------------------------------------- */
  useEffect(() => {
    async function loadAds() {
      const snap = await getDocs(collection(db, "ads"));
      const arr = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAds(arr);
    }
    loadAds();
  }, []);

  /* -----------------------------------------------------------
     CATEGORY FILTER
  ----------------------------------------------------------- */
  function filterByCategory(slug) {
    setSelectedCat(slug);

    if (slug === "all") {
      setFiltered(products);
      return;
    }

    setFiltered(products.filter(p => p.categorySlug === slug));
  }

  /* -----------------------------------------------------------
     SEARCH
  ----------------------------------------------------------- */
  useEffect(() => {
    if (!search) {
      setFiltered(products);
      return;
    }
    const match = products.filter(p =>
      p.name.toLowerCase().includes(search.toLowerCase())
    );
    setFiltered(match);
  }, [search, products]);

  /* -----------------------------------------------------------
     AUTO-SCROLL TRENDING (smooth)
  ----------------------------------------------------------- */
  useEffect(() => {
    const slider = document.getElementById("trendingSlider");
    if (!slider) return;

    let pos = 0;

    const interval = setInterval(() => {
      if (!slider) return;

      pos += 160; // scroll step
      if (pos >= slider.scrollWidth) pos = 0;

      slider.scrollTo({
        left: pos,
        behavior: "smooth",
      });
    }, 2600);

    return () => clearInterval(interval);
  }, [trending]);

  /* -----------------------------------------------------------
     MIC BUTTON STYLE
  ----------------------------------------------------------- */
  const iconButtonStyle = {
    width: "46px",
    height: "46px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "12px",
    background: "#00c3ff",
    boxShadow: "0 0 12px rgba(0,195,255,0.6)",
  };

  return (
    <main className="page-container">

      {/* ----------------------------------------------------
          SEARCH ROW
      ---------------------------------------------------- */}
      <div style={{ display: "flex", gap: "8px", marginTop: "14px" }}>
        <div style={{ position: "relative", flex: 1 }}>
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="search-bar"
            style={{
              width: "100%",
              height: "48px",
              borderRadius: "14px",
              paddingLeft: "16px",
              paddingRight: "40px",
              fontSize: "1rem",
              border: "2px solid #00c3ff",
              background: "white",
            }}
          />

          {/* Search icon A */}
          <div
            style={{
              position: "absolute",
              right: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              pointerEvents: "none",
            }}
          >
            <svg width="26" height="26" fill="#00c3ff" viewBox="0 0 24 24">
              <path d="M10 2a8 8 0 105.293 14.293l4.707 4.707-1.414 1.414-4.707-4.707A8 8 0 0010 2z" />
            </svg>
          </div>
        </div>

        {/* Mic Icon D */}
        <button style={iconButtonStyle}>
          <svg width="26" height="26" fill="#fff" viewBox="0 0 24 24">
            <path d="M12 14a3 3 0 003-3V5a3 3 0 00-6 0v6a3 3 0 003 3z" />
          </svg>
        </button>
      </div>

      {/* ----------------------------------------------------
          BANNER
      ---------------------------------------------------- */}
      <div className="px-3 mt-2">
        <BannerAd ads={ads} />
      </div>

      {/* ----------------------------------------------------
          🔥 TRENDING TODAY (AUTO SCROLL + TAPPABLE)
      ---------------------------------------------------- */}
      {trending.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <h2
            style={{
              fontSize: "1.6rem",
              fontWeight: "700",
              color: "#00aaff",
              marginBottom: "12px",
              paddingLeft: "12px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <span>🔥</span> Trending Today
          </h2>

          <div
            id="trendingSlider"
            style={{
              display: "flex",
              overflowX: "auto",
              gap: "14px",
              padding: "0 12px",
              scrollSnapType: "x mandatory",
            }}
          >
            {trending.map(item => (
              <div
                key={item.id}
                onClick={() => router.push(`/product/${item.id}`)}
                style={{
                  minWidth: "150px",
                  scrollSnapAlign: "start",
                  background: "linear-gradient(145deg, #e8ffff, #d7f7ff)",
                  borderRadius: "14px",
                  padding: "10px",
                  boxShadow: "0 3px 10px rgba(0, 200, 255, 0.25)",
                  cursor: "pointer",
                }}
              >
                <img
                  src={item.imageUrl}
                  style={{
                    width: "100%",
                    height: "90px",
                    borderRadius: "10px",
                    objectFit: "cover",
                  }}
                />
                <div
                  style={{
                    marginTop: "8px",
                    fontWeight: "600",
                    fontSize: "0.9rem",
                    color: "#0088cc",
                  }}
                >
                  {item.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ----------------------------------------------------
          CATEGORY ROW
      ---------------------------------------------------- */}
      <div
        style={{
          display: "flex",
          overflowX: "auto",
          gap: "12px",
          padding: "18px 8px",
          marginTop: "10px",
        }}
      >
        {/* All Category */}
        <div
          onClick={() => filterByCategory("all")}
          style={{
            minWidth: "110px",
            padding: "12px",
            borderRadius: "14px",
            border: selectedCat === "all"
              ? "3px solid #00c3ff"
              : "2px solid #aacbe3",
            background: selectedCat === "all"
              ? "rgba(0,195,255,0.15)"
              : "white",
            textAlign: "center",
            cursor: "pointer",
          }}
        >
          <strong style={{ color: "#009fe3" }}>All</strong>
        </div>

        {/* Dynamic categories */}
        {categories.map(cat => (
          <div
            key={cat.id}
            onClick={() => filterByCategory(cat.slug)}
            style={{
              minWidth: "110px",
              padding: "12px",
              borderRadius: "14px",
              border: selectedCat === cat.slug
                ? "3px solid #00c3ff"
                : "2px solid #aacbe3",
              background: selectedCat === cat.slug
                ? "rgba(0,195,255,0.15)"
                : "white",
              textAlign: "center",
              cursor: "pointer",
            }}
          >
            <div style={{ fontSize: "22px" }}>{cat.icon}</div>
            <div
              style={{
                marginTop: "4px",
                color: "#0088cc",
                fontWeight: 600,
                fontSize: "0.9rem",
              }}
            >
              {cat.name}
            </div>
          </div>
        ))}
      </div>

      {/* ----------------------------------------------------
          PRODUCTS
      ---------------------------------------------------- */}
      <h1 style={{ marginTop: "12px", color: "#00b7ff" }}>Products</h1>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          paddingBottom: "30px",
        }}
      >
        {filtered.map(product => (
          <ProductCard
            key={product.id}
            product={product}
          />
        ))}
      </div>

    </main>
  );
}
