"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { db } from "@/lib/firebase-app";
import { doc, getDoc } from "firebase/firestore";

export default function ProductPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const logosRef = useRef(null);

  useEffect(() => {
    async function loadProduct() {
      try {
        const ref = doc(db, "products", id);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          setProduct({ id: snap.id, ...snap.data() });
        } else {
          setProduct(null);
        }
      } catch (err) {
        console.error("Failed to load product", err);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [id]);

  // Simple auto-scroll animation reset (keeps logos moving smoothly)
  useEffect(() => {
    const el = logosRef.current;
    if (!el) return;
    let animationId;
    // Pause on hover/touch
    const pause = () => (el.style.animationPlayState = "paused");
    const resume = () => (el.style.animationPlayState = "running");
    el.addEventListener("mouseenter", pause);
    el.addEventListener("mouseleave", resume);
    el.addEventListener("touchstart", pause);
    el.addEventListener("touchend", resume);
    return () => {
      el.removeEventListener("mouseenter", pause);
      el.removeEventListener("mouseleave", resume);
      el.removeEventListener("touchstart", pause);
      el.removeEventListener("touchend", resume);
      cancelAnimationFrame(animationId);
    };
  }, []);

  if (loading) return <p style={{ padding: 20 }}>Loading...</p>;
  if (!product) return <p style={{ padding: 20 }}>Product not found.</p>;

  // helpers: read store fields with safe fallback
  const stores = [
    {
      id: "amazon",
      name: "Amazon",
      price: product.amazonPrice || null,
      offer: product.amazonOffer || "Coming soon",
      url: product.amazonUrl || "#",
      colorBg: "#FF9900",
      colorText: "black",
    },
    {
      id: "meesho",
      name: "Meesho",
      price: product.meeshoPrice || null,
      offer: product.meeshoOffer || "Coming soon",
      url: product.meeshoUrl || "#",
      colorBg: "#FF3B9D",
      colorText: "white",
    },
    {
      id: "ajio",
      name: "AJIO",
      price: product.ajioPrice || null,
      offer: product.ajioOffer || "Coming soon",
      url: product.ajioUrl || "#",
      colorBg: "#2C2C2C",
      colorText: "white",
    },
  ];

  // price formatter
  const fmt = (v) =>
    v === null || v === 0 ? "—" : `₹ ${Number(v).toLocaleString("en-IN")}`;

  return (
    <main style={{ padding: 16 }}>
      {/* PRODUCT IMAGE */}
      <div style={{ marginBottom: 12 }}>
        <img
          src={product.imageUrl}
          alt={product.name}
          style={{
            width: "100%",
            borderRadius: 12,
            objectFit: "cover",
            boxShadow: "0 8px 30px rgba(0,195,255,0.12)",
          }}
        />
      </div>

      {/* TITLE + SHORT */}
      <h1 style={{ margin: "6px 0 10px", color: "#00b7ff" }}>
        {product.name}
      </h1>
      <p style={{ margin: "0 0 12px", color: "rgba(0,0,0,0.7)" }}>
        {product.description}
      </p>

      {/* LOGO CAROUSEL (auto-scrolling) */}
      <div
        style={{
          height: 56,
          overflow: "hidden",
          marginBottom: 12,
          borderRadius: 8,
          border: "1px solid rgba(0,0,0,0.06)",
          background: "linear-gradient(90deg, rgba(255,255,255,0.02), rgba(0,195,255,0.02))",
        }}
      >
        <div
          ref={logosRef}
          // duplicated set to allow seamless loop
          style={{
            display: "flex",
            gap: 12,
            alignItems: "center",
            padding: "10px 14px",
            // The animation shifts left by 50% of this container repeatedly
            animation: "slideLogos 12s linear infinite",
            willChange: "transform",
          }}
        >
          {["Amazon", "Meesho", "AJIO", "Croma", "Flipkart", "TataCliq"].map(
            (label, idx) => (
              <div
                key={`${label}-${idx}`}
                style={{
                  minWidth: 56,
                  minHeight: 36,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 999,
                  padding: "8px",
                  boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
                  background: "rgba(255,255,255,0.9)",
                  fontWeight: 700,
                  fontSize: 12,
                }}
              >
                {label}
              </div>
            )
          )}
          {/* duplicate the same set to make the scroll seamless */}
          {["Amazon", "Meesho", "AJIO", "Croma", "Flipkart", "TataCliq"].map(
            (label, idx) => (
              <div
                key={`${label}-dup-${idx}`}
                style={{
                  minWidth: 56,
                  minHeight: 36,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 999,
                  padding: "8px",
                  boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
                  background: "rgba(255,255,255,0.9)",
                  fontWeight: 700,
                  fontSize: 12,
                }}
              >
                {label}
              </div>
            )
          )}
        </div>
      </div>

      {/* CSS keyframes for logo carousel */}
      <style>{`
        @keyframes slideLogos {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); } /* move half (because duplicated) */
        }
      `}</style>

      {/* SWIPEABLE 2.5 CARDS ROW */}
      <div
        style={{
          overflowX: "auto",
          WebkitOverflowScrolling: "touch",
          display: "flex",
          gap: 12,
          paddingBottom: 6,
          marginBottom: 18,
        }}
      >
        {stores.map((s) => (
          <div
            key={s.id}
            style={{
              flex: "0 0 40%", // 40% width -> two full cards (40%+40%=80%) and third peeks (20%)
              minWidth: 220,
              borderRadius: 12,
              background: "linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))",
              border: "1px solid rgba(255,255,255,0.06)",
              boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
            }}
          >
            {/* store block */}
            <div style={{ padding: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <div style={{ fontWeight: 800 }}>{s.name}</div>
                <div style={{ fontSize: 12, color: "rgba(0,0,0,0.5)" }}>{/* small tag or rating if needed */}</div>
              </div>

              <div style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: "#001f3f" }}>
                  {fmt(s.price)}
                </div>
                <div style={{ fontSize: 13, color: "rgba(0,0,0,0.6)", marginTop: 6 }}>
                  {s.offer}
                </div>
              </div>

              <a
                href={s.url || "#"}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-block",
                  width: "100%",
                  padding: "10px",
                  borderRadius: 10,
                  textAlign: "center",
                  fontWeight: 800,
                  textDecoration: "none",
                  background: s.colorBg,
                  color: s.colorText,
                  boxShadow: `0 6px 18px ${s.colorBg}33`,
                  marginTop: 8,
                }}
              >
                Buy on {s.name}
              </a>

              {/* small extras row */}
              <div style={{ marginTop: 10, fontSize: 12, color: "rgba(0,0,0,0.55)" }}>
                <div>Delivery & returns</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer note */}
      <p style={{ fontSize: 13, color: "rgba(0,0,0,0.6)" }}>
        Tap a card to open the store (affiliate URLs will be used later). Prices shown
        are per-store values (stored in Firestore) and can be updated individually.
      </p>
    </main>
  );
}
  
