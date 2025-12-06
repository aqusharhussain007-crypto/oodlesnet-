"use client";

import { useEffect, useState, useRef } from "react";
import { db } from "@/lib/firebase-app"; // correct path
import { doc, getDoc } from "firebase/firestore";
import Image from "next/image";

export default function ProductPage({ params }) {
  const { id } = params;
  const [product, setProduct] = useState(null);

  // logo carousel state
  const [index, setIndex] = useState(0); // which logo is centered
  const [running, setRunning] = useState(true); // auto-run flag
  const containerRef = useRef(null);
  const timerRef = useRef(null);
  const resumeTimeoutRef = useRef(null);
  const logos = [
    { key: "amazon", name: "Amazon", src: "/logos/amazon.png" },
    { key: "meesho", name: "Meesho", src: "/logos/meesho.png" },
    { key: "ajio", name: "AJIO", src: "/logos/ajio.png" },
  ];

  // Fetch product
  useEffect(() => {
    async function loadProduct() {
      try {
        const snap = await getDoc(doc(db, "products", id));
        if (snap.exists()) {
          setProduct(snap.data());
        } else {
          setProduct(null);
        }
      } catch (e) {
        console.error("Failed to load product:", e);
      }
    }
    loadProduct();
  }, [id]);

  // Controlled auto-advance: move one logo at a time
  useEffect(() => {
    if (!running) return;
    // advance every 1700ms (speed is good per your note)
    timerRef.current = setInterval(() => {
      setIndex((i) => (i + 1) % logos.length);
    }, 1700);
    return () => clearInterval(timerRef.current);
  }, [running]);

  // On index change scroll the container to show centered logo + half next
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // compute sizes dynamically
    const item = el.querySelector("[data-logo-item]");
    if (!item) return;
    const itemWidth = item.getBoundingClientRect().width;
    // Want center the `index` item and show half of next:
    // scrollLeft = index * itemWidth - offsetToCenter
    // We'll place center item at small left padding so it appears centered with half of next visible.
    // Simpler: scrollLeft = index * (itemWidth * 0.85) to create overlap feel.
    // But to be precise, set scrollLeft = index * (itemWidth * 0.92)
    const scrollLeft = index * (itemWidth * 0.95);
    el.scrollTo({ left: scrollLeft, behavior: "smooth" });
  }, [index]);

  // Pause on user interaction -> resume after 1s
  const handleUserInteraction = () => {
    // stop auto-run
    setRunning(false);
    clearTimeout(resumeTimeoutRef.current);
    // resume after 1 second
    resumeTimeoutRef.current = setTimeout(() => {
      setRunning(true);
    }, 1000);
  };

  // compact card size helper
  const CARD_MIN_WIDTH = "62%"; // 2.5 layout looks good with 62% min width

  // feature arrays per store (Option B) — dynamic from product
  const getFeatures = (storeKey) => {
    if (!product) return [];
    const key = `${storeKey}Features`; // e.g. amazonFeatures
    const raw = product[key];
    if (Array.isArray(raw) && raw.length) return raw.slice(0, 4);
    // fallback defaults per store
    const defaults = {
      amazon: ["Fast delivery", "Prime deals", "7-day returns"],
      meesho: ["COD available", "Daily deals", "Free shipping"],
      ajio: ["Exclusive offers", "Secure checkout", "Trendy"],
    };
    return defaults[storeKey] || [];
  };

  if (!product) {
    return <div style={{ padding: 16 }}>Loading product...</div>;
  }

  // helper to format price
  const fmt = (p) =>
    p === undefined || p === null || p === 0 ? "—" : `₹ ${Number(p).toLocaleString("en-IN")}`;

  return (
    <main style={{ padding: 16 }}>
      {/* Title */}
      <h1 style={{ fontSize: 24, fontWeight: 800, color: "#00b7ff", margin: 0 }}>
        {product.name}
      </h1>
      <p style={{ margin: "6px 0 12px", color: "#666" }}>{product.description}</p>

      {/* product image */}
      <div style={{ width: "100%", borderRadius: 12, overflow: "hidden", boxShadow: "0 10px 30px rgba(0,0,0,0.06)" }}>
        <Image
          src={product.imageUrl}
          alt={product.name}
          width={1200}
          height={700}
          style={{ width: "100%", height: "auto", display: "block" }}
        />
      </div>

      {/* Logo carousel area */}
      <section style={{ marginTop: 18 }}>
        <h3 style={{ margin: "6px 0 10px", color: "#00b7ff", fontSize: 18, fontWeight: 700 }}>
          Available On
        </h3>

        <div
          ref={containerRef}
          onTouchStart={handleUserInteraction}
          onTouchMove={handleUserInteraction}
          onWheel={handleUserInteraction}
          onMouseDown={handleUserInteraction}
          style={{
            display: "flex",
            gap: 14,
            alignItems: "center",
            overflowX: "auto",
            padding: "6px 8px",
            scrollSnapType: "x mandatory",
            // hide default scrollbar visually
            msOverflowStyle: "none",
            scrollbarWidth: "none",
          }}
        >
          {logos.concat(logos).map((l, i) => {
            // duplicate logos to create smooth wrap; map index modulo logos.length
            const baseIndex = i % logos.length;
            const visibleIndex = baseIndex === index;
            // visual sizes: centered one slightly larger
            const size = visibleIndex ? 86 : 64;
            const opacity = visibleIndex ? 1 : 0.85;
            const translateY = visibleIndex ? -2 : 0;

            return (
              <div
                data-logo-item
                key={`logo-${i}-${l.key}`}
                style={{
                  minWidth: 110, // controls how much of next peeks in (1 + half)
                  flex: "0 0 auto",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  scrollSnapAlign: "center",
                  transition: "transform 400ms ease, opacity 400ms ease",
                  transform: `translateY(${translateY}px)`,
                  opacity,
                }}
              >
                <div
                  style={{
                    width: size,
                    height: size,
                    borderRadius: 999,
                    background: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 10px 30px rgba(0,195,255,0.12)",
                    border: "1px solid rgba(0,195,255,0.12)",
                  }}
                >
                  <Image src={logos[baseIndex].src} alt={logos[baseIndex].name} width={Math.round(size * 0.7)} height={Math.round(size * 0.7)} style={{ objectFit: "contain" }} />
                </div>
                <div style={{ height: 8 }} />
                <div style={{ fontSize: 12, color: "#444", fontWeight: 600 }}>
                  {logos[baseIndex].name}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Compare Prices Title */}
      <h3 style={{ marginTop: 20, marginBottom: 8, color: "#00b7ff", fontSize: 20, fontWeight: 800 }}>
        Compare Prices
      </h3>

      {/* 2.5 card horizontal row */}
      <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 16 }}>
        {[
          {
            key: "amazon",
            name: "Amazon",
            price: product.amazonPrice,
            offer: product.amazonOffer,
            url: product.amazonUrl,
          },
          {
            key: "meesho",
            name: "Meesho",
            price: product.meeshoPrice,
            offer: product.meeshoOffer,
            url: product.meeshoUrl,
          },
          {
            key: "ajio",
            name: "AJIO",
            price: product.ajioPrice,
            offer: product.ajioOffer,
            url: product.ajioUrl,
          },
        ].map((storeObj, idx) => {
          const features = getFeatures(storeObj.key);
          return (
            <article
              key={storeObj.key}
              style={{
                minWidth: CARD_MIN_WIDTH,
                maxWidth: CARD_MIN_WIDTH,
                background: "linear-gradient(180deg, rgba(255,255,255,0.96), #ffffff)",
                borderRadius: 14,
                padding: "10px",
                boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
                border: "1px solid rgba(0,195,255,0.06)",
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, overflow: "hidden", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Image src={`/logos/${storeObj.key}.png`} alt={storeObj.name} width={28} height={28} />
                  </div>
                  <div style={{ fontWeight: 800 }}>{storeObj.name}</div>
                </div>

                <div style={{ fontWeight: 800, color: "#00c3ff", fontSize: 18 }}>
                  {fmt(storeObj.price)}
                </div>
              </div>

              <div style={{ color: "#666", fontSize: 13, minHeight: 36 }}>{storeObj.offer}</div>

              <div style={{ display: "flex", justifyContent: "flex-start", gap: 8, alignItems: "center", marginTop: 4 }}>
                <a
                  href={storeObj.url || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "6px 12px",
                    borderRadius: 999,
                    background: "linear-gradient(90deg,#00c6ff,#00e78f)",
                    boxShadow: "0 8px 24px rgba(0,200,255,0.18)",
                    color: "#000",
                    fontWeight: 700,
                    textDecoration: "none",
                    fontSize: 14,
                  }}
                >
                  Buy →
                </a>

                {/* features (minimal dots style) */}
                <div style={{ display: "flex", gap: 10, marginLeft: 8 }}>
                  {features.map((f, i) => (
                    <div key={i} style={{ display: "flex", gap: 6, alignItems: "center", fontSize: 12, color: "#444" }}>
                      <span style={{ width: 6, height: 6, borderRadius: 6, background: "#00c6ff", display: "inline-block" }} />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </main>
  );
                              }
      
