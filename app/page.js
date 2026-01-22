"use client";

import { useState, useEffect, useContext, useMemo, useCallback } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { db } from "@/lib/firebase-app";
import { collection, getDocs } from "firebase/firestore";
import { DrawerContext } from "@/components/DrawerProvider";

/* LAZY LOAD NON-CRITICAL COMPONENTS */
const ProductCard = dynamic(() => import("@/components/ProductCard"));
const BannerAd = dynamic(() => import("@/components/ads/BannerAd"));
const InfiniteSlider = dynamic(() => import("@/components/InfiniteSlider"));
const FilterDrawer = dynamic(() => import("@/components/FilterDrawer"));
const CategoryDrawer = dynamic(() => import("@/components/CategoryDrawer"));
const SkeletonLoader = dynamic(() => import("@/components/SkeletonLoader"));

/* SVG ICONS */
const SearchIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const MicIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" y1="19" x2="12" y2="23" />
    <line x1="8" y1="23" x2="16" y2="23" />
  </svg>
);

/* ANIMATED ARROW */
const ArrowIcon = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="white"
    strokeWidth="2.5"
    style={{ animation: "arrowMove 1.2s infinite ease-in-out" }}
  >
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="13 6 19 12 13 18" />
  </svg>
);

export default function Home() {
  const router = useRouter();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [ads, setAds] = useState([]);
  const [recent, setRecent] = useState([]);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const { openCategory, setOpenCategory, openFilter, setOpenFilter } =
    useContext(DrawerContext);

  /* LOAD PRODUCTS */
  useEffect(() => {
    async function load() {
      const snap = await getDocs(collection(db, "products"));
      const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setProducts(items);
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
    async function loadAds() {
      const snap = await getDocs(collection(db, "ads"));
      setAds(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    }
    loadAds();
  }, []);

  /* RECENTLY VIEWED */
  useEffect(() => {
    if (typeof window === "undefined") return;
    const data = JSON.parse(localStorage.getItem("recent") || "[]");
    setRecent(Array.isArray(data) ? data : []);
  }, []);

  /* DEBOUNCE SEARCH */
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  /* FILTERED PRODUCTS */
  const filtered = useMemo(() => {
    if (!debouncedSearch) return products;
    return products.filter((p) =>
      (p.name || "").toLowerCase().includes(debouncedSearch.toLowerCase())
    );
  }, [debouncedSearch, products]);

  /* SEARCH SUGGESTIONS */
  const suggestions = useMemo(() => {
    if (!debouncedSearch) return [];
    return filtered.slice(0, 5);
  }, [debouncedSearch, filtered]);

  /* TRENDING */
  const trending = useMemo(() => {
    return [...products]
      .sort((a, b) => Number(b.impressions || 0) - Number(a.impressions || 0))
      .slice(0, 10);
  }, [products]);

  const startVoiceSearch = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return alert("Voice search not supported");

    const recog = new SR();
    recog.lang = "en-IN";
    recog.onresult = (e) =>
      setSearch(e.results[0][0].transcript || "");
    recog.start();
  }, []);

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

          <div
            style={{
              position: "absolute",
              right: 12,
              top: "50%",
              transform: "translateY(-50%)",
              color: "#666",
            }}
          >
            <SearchIcon />
          </div>

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
                    loading="lazy"
                    alt={item.name}
                    style={{ borderRadius: 8 }}
                  />
                  <strong>{item.name}</strong>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={startVoiceSearch}
          style={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            border: "none",
            background: "linear-gradient(135deg,#0099cc,#009966)",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <MicIcon />
        </button>
      </div>

      {/* BANNER */}
      {ads.length === 0 ? <SkeletonLoader height={120} /> : <BannerAd ads={ads} />}

      {/* TRENDING */}
      <h2 className="section-title">Trending Today</h2>
      {trending.length === 0 ? (
        <SkeletonLoader rows={5} width={120} height={150} horizontal />
      ) : (
        <InfiniteSlider items={trending} size="small" />
      )}

      {recent.length > 0 && (
        <>
          <h2 className="section-title">Recently Viewed</h2>
          <InfiniteSlider items={recent} size="small" />
        </>
      )}

      {!search &&
        categories.map((cat) => {
          const items = filtered.filter(
            (p) => p.categorySlug === cat.slug
          );

          if (items.length === 0) return null;

          return (
            <div key={cat.slug}>
              <h2 className="section-title">{cat.name}</h2>

              <div className="products-grid">
                {products.length === 0 ? (
                  <SkeletonLoader rows={4} height={260} />
                ) : (
                  items.slice(0, 4).map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))
                )}

                {items.length > 4 && (
                  <div
                    onClick={() =>
                      router.push(`/category/${cat.slug}`)
                    }
                    style={{
                      minHeight: 96,
                      borderRadius: 18,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 10,
                      fontWeight: 900,
                      fontSize: 16,
                      color: "#fff",
                      cursor: "pointer",
                      background:
                        "linear-gradient(135deg,#0099cc,#009966)",
                    }}
                  >
                    See all in {cat.name} <ArrowIcon />
                  </div>
                )}
              </div>
            </div>
          );
        })}

      <style jsx>{`
        @keyframes arrowMove {
          0% { transform: translateX(0); }
          50% { transform: translateX(6px); }
          100% { transform: translateX(0); }
        }
      `}</style>
    </main>
  );
  }
  
