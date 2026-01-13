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

/* SVG ICONS */
const SearchIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const MicIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" y1="19" x2="12" y2="23" />
    <line x1="8" y1="23" x2="16" y2="23" />
  </svg>
);

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

          {/* SEARCH ICON */}
          <div
            style={{
              position: "absolute",
              right: 12,
              top: "50%",
              transform: "translateY(-50%)",
              color: "#666",
              pointerEvents: "none",
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
                    alt={item.name}
                    style={{ borderRadius: 8 }}
                  />
                  <strong>{item.name}</strong>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* MIC BUTTON */}
        <button
          onClick={startVoiceSearch}
          style={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            border: "none",
            background: "linear-gradient(135deg, #00c6ff, #00d084)",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 6px 16px rgba(0,0,0,0.2)",
          }}
        >
          <MicIcon />
        </button>
      </div>

      <BannerAd ads={ads} />

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
                      height: "150%",
                      minHeight: 180,
                      borderRadius: 18,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 900,
                      fontSize: 18,
                      color: "#fff",
                      cursor: "pointer",
                      background:
                        "linear-gradient(135deg, #00c6ff, #00d084)",
                      boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
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
      
