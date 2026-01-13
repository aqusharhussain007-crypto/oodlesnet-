"use client";

import { useState, useEffect, useContext } from "react";
import ProductCard from "@/components/ProductCard";
import BannerAd from "@/components/ads/BannerAd";
import InfiniteSlider from "@/components/InfiniteSlider";
import FilterDrawer from "@/components/FilterDrawer";
import CategoryDrawer from "@/components/CategoryDrawer";
import { db } from "@/lib/firebase-app";
import { collection, getDocs } from "firebase/firestore";
import Image from "next/image";
import { DrawerContext } from "@/components/DrawerProvider";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [categories, setCategories] = useState([]);

  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  const [ads, setAds] = useState([]);
  const [recent, setRecent] = useState([]);
  const [trending, setTrending] = useState([]);
  const [featured, setFeatured] = useState(null);

  const [activeCategory, setActiveCategory] = useState("all");
  const [filters, setFilters] = useState(null);

  const {
    openCategory,
    setOpenCategory,
    openFilter,
    setOpenFilter,
  } = useContext(DrawerContext);

  /* LOAD PRODUCTS */
  useEffect(() => {
    async function load() {
      const snap = await getDocs(collection(db, "products"));
      const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

      setProducts(items);
      setFiltered(items);

      const top = [...items]
        .sort((a, b) => Number(b.impressions || 0) - Number(a.impressions || 0))
        .slice(0, 10);
      setTrending(top);

      // 🔥 DAILY FEATURED PRODUCT (rotates by date)
      if (items.length > 0) {
        const index =
          Math.floor(Date.now() / (1000 * 60 * 60 * 24)) % items.length;
        setFeatured(items[index]);
      }
    }
    load();
  }, []);

  /* LOAD CATEGORIES */
  useEffect(() => {
    async function loadCategories() {
      const snap = await getDocs(collection(db, "categories"));
      setCategories(snap.docs.map((d) => d.data()));
    }
    loadCategories();
  }, []);

  /* LOAD ADS */
  useEffect(() => {
    async function load() {
      const snap = await getDocs(collection(db, "ads"));
      setAds(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    }
    load();
  }, []);

  /* RECENTLY VIEWED */
  useEffect(() => {
    if (typeof window === "undefined") return;
    const data = JSON.parse(localStorage.getItem("recent") || "[]");
    setRecent(Array.isArray(data) ? data : []);
  }, []);

  /* SEARCH + CATEGORY FILTER */
  useEffect(() => {
    let list = products;

    if (activeCategory !== "all") {
      list = list.filter((p) => p.categorySlug === activeCategory);
    }

    if (search) {
      list = list.filter((p) =>
        (p.name || "").toLowerCase().includes(search.toLowerCase())
      );
      setSuggestions(list.slice(0, 5));
    } else {
      setSuggestions([]);
    }

    setFiltered(list);
  }, [search, products, activeCategory]);

  function startVoiceSearch() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return alert("Voice search not supported");

    const recog = new SR();
    recog.lang = "en-IN";
    recog.onresult = (e) =>
      setSearch(e.results[0][0].transcript || "");
    recog.start();
  }

  return (
    <main className="page-container" style={{ padding: 12 }}>
      {/* SEARCH */}
      <div style={{ display: "flex", gap: 8 }}>
        <div style={{ position: "relative", flex: 1 }}>
          <input
            className="search-bar compact"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingRight: 44 }}
          />

          {suggestions.length > 0 && (
            <div
              style={{
                position: "absolute",
                top: 48,
                width: "100%",
                background: "white",
                borderRadius: 10,
                zIndex: 1000,
              }}
            >
              {suggestions.map((item) => (
                <div
                  key={item.id}
                  onClick={() => router.push(`/product/${item.id}`)}
                  style={{ display: "flex", gap: 8, padding: 8 }}
                >
                  <Image
                    src={item.imageUrl}
                    width={42}
                    height={42}
                    alt={item.name}
                    style={{ borderRadius: 8 }}
                  />
                  <strong>{item.name}</strong>
                </div>
              ))}
            </div>
          )}
        </div>

        <button onClick={startVoiceSearch}>🎤</button>
      </div>

      <BannerAd ads={ads} />

      {/* 🔥 FEATURED */}
      {featured && (
        <>
          <h2 className="section-title">🔥 Today’s Pick</h2>
          <ProductCard product={featured} />
        </>
      )}

      <h2 className="section-title">Trending Today</h2>
      <InfiniteSlider items={trending} size="small" />

      {recent.length > 0 && (
        <>
          <h2 className="section-title">Recently Viewed</h2>
          <InfiniteSlider items={recent} size="small" />
        </>
      )}

      {/* CATEGORY SECTIONS */}
      {!search &&
        categories.map((cat) => {
          const items = filtered.filter(
            (p) => p.categorySlug === cat.slug
          );

          if (items.length === 0) return null;

          const visible = items.slice(0, 4);

          return (
            <div key={cat.slug}>
              <h2 className="section-title">{cat.name}</h2>

              <div className="products-grid">
                {visible.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}

                {/* SEE ALL CARD */}
                {items.length > 4 && (
                  <div
                    onClick={() => router.push(`/category/${cat.slug}`)}
                    style={{
                      border: "2px dashed #00c6ff",
                      borderRadius: 16,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 800,
                      color: "#0077aa",
                      cursor: "pointer",
                    }}
                  >
                    See all →
                  </div>
                )}
              </div>
            </div>
          );
        })}

      {openCategory && (
        <CategoryDrawer
          active={activeCategory}
          onSelect={(c) => {
            setActiveCategory(c);
            setOpenCategory(false);
          }}
          onClose={() => setOpenCategory(false)}
        />
      )}

      {openFilter && (
        <FilterDrawer
          onClose={() => setOpenFilter(false)}
          onApply={(data) => setFilters(data)}
        />
      )}
    </main>
  );
                               }
        
