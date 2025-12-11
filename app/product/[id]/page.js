"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { db } from "@/lib/firebase-app";
import { doc, getDoc, updateDoc } from "firebase/firestore";

/**
 * Product page (App Router)
 * - Thumbnail carousel + main image
 * - Share button (top-right floating)
 * - Sticky "Buy buttons" column that stays visible and scrolls under header (behaves like YouTube sticky)
 * - Compare prices read from Firestore fields: amazonPrice/amazonOffer/amazonUrl, meeshoPrice/meeshoUrl, ajioPrice/ajioUrl
 *
 * Usage: file placed at app/product/[id]/page.js
 */

export default function ProductPage({ params }) {
  const id = params.id;
  const [product, setProduct] = useState(null);
  const mainRef = useRef(null);

  useEffect(() => {
    async function load() {
      try {
        const d = doc(db, "products", id);
        const snap = await getDoc(d);
        if (snap.exists()) {
          const data = { id: snap.id, ...snap.data() };
          setProduct(data);

          // increase views (best-effort)
          try {
            await updateDoc(d, { views: (data.views || 0) + 1 });
          } catch (e) {
            // ignore write errors
          }
        } else {
          setProduct(null);
        }
      } catch (e) {
        console.error("load product", e);
      }
    }
    load();
  }, [id]);

  if (!product) {
    return (
      <main className="page-container" style={{ padding: 12 }}>
        <div style={{ height: 380, borderRadius: 14, background: "#fff", boxShadow: "0 6px 20px rgba(0,0,0,0.06)" }} />
        <h2 style={{ marginTop: 18, color: "#0bbcff" }}>Loading...</h2>
      </main>
    );
  }

  // helpers for store buttons
  const stores = [
    {
      key: "amazon",
      label: "Buy on Amazon",
      price: product.amazonPrice,
      offer: product.amazonOffer,
      url: product.amazonUrl,
      color: "linear-gradient(90deg,#ffb347,#ffcc33)",
    },
    {
      key: "meesho",
      label: "Buy on Meesho",
      price: product.meeshoPrice,
      offer: product.meeshoOffer,
      url: product.meeshoUrl,
      color: "linear-gradient(90deg,#ff64b4,#ff6e9a)",
    },
    {
      key: "ajio",
      label: "Buy on Ajio",
      price: product.ajioPrice,
      offer: product.ajioOffer,
      url: product.ajioUrl,
      color: "linear-gradient(90deg,#6ad7ff,#00ffd0)",
    },
  ].filter((s) => s.url || s.price != null);

  function shareProduct() {
    const text = `${product.name} - ₹${product.price}\n${typeof window !== "undefined" ? window.location.href : ""}`;
    if (navigator.share) {
      navigator.share({ title: product.name, text, url: typeof window !== "undefined" ? window.location.href : "" }).catch(() => {});
    } else {
      // fallback copy
      navigator.clipboard?.writeText(text);
      alert("Link copied to clipboard");
    }
  }

  // thumbnail carousel simple handlers
  const [selectedImage, setSelectedImage] = useState(product.imageUrl || "");
  const thumbsRef = useRef(null);
  useEffect(() => setSelectedImage(product.imageUrl || ""), [product.imageUrl]);

  return (
    <main className="page-container" style={{ padding: 12 }}>
      {/* Breadcrumb */}
      <div style={{ color: "#0077aa", marginBottom: 8 }}>
        Home / {product.categorySlug || "category"} / <strong style={{ color: "#0b9bdc" }}>{product.name}</strong>
      </div>

      {/* Image area */}
      <div style={{ position: "relative" }}>
        <div
          ref={mainRef}
          style={{
            width: "100%",
            height: 320,
            background: "#fff",
            borderRadius: 16,
            overflow: "hidden",
            boxShadow: "0 8px 26px rgba(0,0,0,0.06)",
          }}
        >
          {selectedImage ? (
            <Image src={selectedImage} alt={product.name} width={1200} height={800} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#aaa" }}>
              No image
            </div>
          )}
        </div>

        {/* Share button (floating top-right of image) */}
        <button
          onClick={shareProduct}
          style={{
            position: "absolute",
            right: 12,
            top: 12,
            background: "#e9fbff",
            borderRadius: 12,
            padding: "8px 12px",
            border: "none",
            boxShadow: "0 6px 18px rgba(0,198,255,0.08)",
            color: "#0077aa",
            fontWeight: 700,
          }}
        >
          Share
        </button>
      </div>

      {/* Thumbnails (horizontal) */}
      <div style={{ display: "flex", gap: 10, overflowX: "auto", marginTop: 10, paddingBottom: 8 }}>
        {/* We only have single image now; if you add more fields like images: [..] they can be listed */}
        {[product.imageUrl, product.imageUrl].filter(Boolean).map((src, i) => (
          <div key={i} onClick={() => setSelectedImage(src)} style={{ minWidth: 90, height: 64, borderRadius: 10, overflow: "hidden", cursor: "pointer", border: selectedImage === src ? "3px solid #00c6ff" : "2px solid rgba(0,0,0,0.06)" }}>
            <Image src={src} width={240} height={160} alt={`thumb-${i}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
        ))}
      </div>

      {/* Title & price */}
      <h1 style={{ marginTop: 16, color: "#0078c6", fontSize: 28 }}>{product.name}</h1>
      <div style={{ fontSize: 22, color: "#00a3d6", fontWeight: 800, marginTop: 8 }}>₹ {product.price}</div>

      {/* Description */}
      <h3 style={{ marginTop: 16, color: "#0077aa" }}>Description</h3>
      <p style={{ color: "#444", marginTop: 6 }}>{product.description}</p>

      {/* Compare Prices heading */}
      <h3 style={{ marginTop: 18, color: "#0077aa" }}>Compare Prices</h3>

      {/* BUY BUTTONS SECTION
          This container is NOT fixed to bottom. It's a normal block that we make sticky
          so while the product image is visible it stays pinned; when user scrolls past details,
          it will scroll away under the header (like YouTube sticky).
      */}
      <div
        style={{
          position: "sticky",
          top: 80, // adjust so it sits under the top header
          zIndex: 40,
          marginTop: 12,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {stores.map((s) => (
            <div key={s.key} style={{ background: "#fff", borderRadius: 12, padding: 14, boxShadow: "0 6px 20px rgba(0,0,0,0.06)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <div style={{ fontWeight: 800 }}>{s.label.replace("Buy on ", "")}: <span style={{ color: "#0077aa" }}>₹ {s.price ?? "-"}</span></div>
                <div style={{ color: "#666", fontSize: 13 }}>{s.offer || ""}</div>
              </div>

              <div style={{ marginTop: 12 }}>
                <a
                  href={s.url || "#"}
                  rel="noreferrer"
                  target="_blank"
                  style={{
                    display: "inline-block",
                    width: "100%",
                    textAlign: "center",
                    padding: "14px 18px",
                    borderRadius: 12,
                    background: s.color,
                    color: "#fff",
                    fontWeight: 800,
                    textDecoration: "none",
                    boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
                  }}
                >
                  {s.label}
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Below buttons: any extra details */}
      <div style={{ marginTop: 20 }}>
        <h3 style={{ color: "#0077aa" }}>More details</h3>
        <p style={{ color: "#444", marginTop: 8 }}>
          {product.longDescription || "No extra details available."}
        </p>
      </div>
    </main>
  );
                    }
  
