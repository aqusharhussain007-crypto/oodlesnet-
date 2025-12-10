"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase-app";
import { doc, getDoc } from "firebase/firestore";
import ImageSwiper from "@/components/ImageSwiper";
import Link from "next/link";

export default function ProductPage({ params }) {
  const { id } = params;

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ====================== LOAD PRODUCT ====================== */
  useEffect(() => {
    async function loadProduct() {
      const snap = await getDoc(doc(db, "products", id));

      if (snap.exists()) {
        const data = { id: snap.id, ...snap.data() };
        setProduct(data);

        saveRecentProduct(data);
      }

      setLoading(false);
    }
    loadProduct();
  }, [id]);

  /* =============== SAVE RECENT PRODUCT =================== */
  function saveRecentProduct(p) {
    if (typeof window === "undefined") return;

    let recent = JSON.parse(localStorage.getItem("recent") || "[]");

    recent = recent.filter((x) => x.id !== p.id);
    recent.unshift({
      id: p.id,
      name: p.name,
      price: p.price,
      imageUrl: p.imageUrl,
    });

    if (recent.length > 10) recent = recent.slice(0, 10);
    localStorage.setItem("recent", JSON.stringify(recent));
  }

  /* ================= LOADING UI ================= */
  if (loading) {
    return <main style={{ padding: 20 }}>Loading...</main>;
  }

  if (!product) {
    return <main style={{ padding: 20 }}>Product not found</main>;
  }

  const imgs = product.images && product.images.length > 0 ? product.images : [product.imageUrl];

  /* ===================== SHARE FEATURE ==================== */
  function shareProduct() {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: "Check out this product!",
        url: window.location.href,
      });
    } else {
      alert("Sharing not supported on this device.");
    }
  }

  return (
    <main style={{ padding: 14, paddingBottom: 80 }}>

      {/* ====================== BREADCRUMBS ====================== */}
      <div style={{ fontSize: 14, marginBottom: 10 }}>
        <Link href="/" style={{ color: "#0099dd" }}>Home</Link> /
        <Link
          href={`/?cat=${product.categorySlug}`}
          style={{ color: "#0099dd", marginLeft: 6 }}
        >
          {product.categoryName || product.categorySlug}
        </Link>{" "}
        / <span style={{ fontWeight: 700 }}>{product.name}</span>
      </div>

      {/* ====================== IMAGE SWIPER ====================== */}
      <ImageSwiper images={imgs} />

      {/* ====================== SHARE BUTTON ====================== */}
      <div style={{ marginTop: 10, display: "flex", justifyContent: "flex-end" }}>
        <button
          onClick={shareProduct}
          style={{
            background: "#e2f7ff",
            padding: "8px 14px",
            borderRadius: 8,
            border: "1px solid #00c3ff",
            color: "#0077b6",
            fontWeight: 600,
          }}
        >
          Share 🔗
        </button>
      </div>

      {/* ====================== PRODUCT TITLE & PRICE ====================== */}
      <h1 style={{ marginTop: 16, fontSize: "1.45rem", fontWeight: 800, color: "#0077b6" }}>
        {product.name}
      </h1>

      <p style={{ fontSize: "1.4rem", color: "#00a8e8", fontWeight: 800 }}>
        ₹ {product.price}
      </p>

      {/* ====================== PRICE COMPARISON ====================== */}
      <div
        style={{
          marginTop: 14,
          background: "#f2fbff",
          padding: 14,
          borderRadius: 14,
          border: "1px solid #c7eefb",
        }}
      >
        <h3 style={{ fontWeight: 700, color: "#0077b6", marginBottom: 10 }}>
          Price Comparison
        </h3>

        {product.amazonLink && (
          <p style={{ marginBottom: 6 }}>Amazon: ₹{product.amazonPrice || product.price}</p>
        )}
        {product.meeshoLink && (
          <p style={{ marginBottom: 6 }}>Meesho: ₹{product.meeshoPrice || product.price}</p>
        )}
        {product.ajioLink && (
          <p style={{ marginBottom: 6 }}>Ajio: ₹{product.ajioPrice || product.price}</p>
        )}
      </div>

      {/* ====================== BUY BUTTONS ====================== */}
      <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 12 }}>

        {product.amazonLink && (
          <a
            href={product.amazonLink}
            target="_blank"
            className="btn-glow"
            style={{
              background: "linear-gradient(90deg,#00c6ff,#00ff99)",
              padding: 14,
              borderRadius: 12,
              fontWeight: 800,
              textAlign: "center",
              fontSize: "1rem",
              color: "#00222d",
              textDecoration: "none",
            }}
          >
            Buy on Amazon
          </a>
        )}

        {product.meeshoLink && (
          <a
            href={product.meeshoLink}
            target="_blank"
            style={{
              background: "linear-gradient(90deg,#ff7bbd,#ff4fa5)",
              padding: 14,
              borderRadius: 12,
              fontWeight: 800,
              textAlign: "center",
              fontSize: "1rem",
              color: "white",
              textDecoration: "none",
            }}
          >
            Buy on Meesho
          </a>
        )}

        {product.ajioLink && (
          <a
            href={product.ajioLink}
            target="_blank"
            style={{
              background: "linear-gradient(90deg,#004cff,#00d2ff)",
              padding: 14,
              borderRadius: 12,
              fontWeight: 800,
              textAlign: "center",
              fontSize: "1rem",
              color: "white",
              textDecoration: "none",
            }}
          >
            Buy on Ajio
          </a>
        )}
      </div>

      {/* ====================== DESCRIPTION ====================== */}
      <div style={{ marginTop: 24 }}>
        <h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: "#0077b6" }}>
          Description
        </h3>
        <p style={{ marginTop: 6, color: "#444", fontSize: "1rem" }}>
          {product.description || "No description available."}
        </p>
      </div>

    </main>
  );
  }
  
