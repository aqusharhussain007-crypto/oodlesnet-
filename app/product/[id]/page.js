"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase-app";
import { doc, getDoc } from "firebase/firestore";
import ImageSwiper from "@/components/ImageSwiper";
import ProductCard from "@/components/ProductCard";
import Link from "next/link";

export default function ProductPage({ params }) {
  const { id } = params;

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ---------------- LOAD PRODUCT ---------------- */
  useEffect(() => {
    async function loadProduct() {
      const snap = await getDoc(doc(db, "products", id));
      if (snap.exists()) {
        const data = { id: snap.id, ...snap.data() };
        setProduct(data);

        // Save to recently viewed
        saveToRecent(data);

        // Load related products (same category)
        loadRelated(data.categorySlug);
      }
      setLoading(false);
    }
    loadProduct();
  }, [id]);

  /* ---------------- SAVE RECENT ---------------- */
  function saveToRecent(p) {
    if (typeof window === "undefined") return;

    let recent = JSON.parse(localStorage.getItem("recent") || "[]");

    // remove if already exists
    recent = recent.filter((item) => item.id !== p.id);

    // add to top
    recent.unshift({
      id: p.id,
      name: p.name,
      price: p.price,
      imageUrl: p.imageUrl,
    });

    // keep max 10
    if (recent.length > 10) recent = recent.slice(0, 10);

    localStorage.setItem("recent", JSON.stringify(recent));
  }

  /* ---------------- LOAD RELATED ---------------- */
  async function loadRelated(categorySlug) {
    if (!categorySlug) return;

    const colSnap = await getDoc(doc(db, "related", categorySlug)); // optional
    // or fetch from products by category if needed
  }

  if (loading) {
    return (
      <main style={{ padding: 20 }}>
        <p>Loading...</p>
      </main>
    );
  }

  if (!product) {
    return (
      <main style={{ padding: 20 }}>
        <p>Product not found.</p>
      </main>
    );
  }

  const images = product.images || [product.imageUrl];

  return (
    <main style={{ padding: 14 }}>

      {/* 🔵 BREADCRUMB NAVIGATION (Option B) */}
      <div style={{ fontSize: 14, marginBottom: 10 }}>
        <Link href="/" style={{ color: "#0099dd" }}>Home</Link> /{" "}
        <Link
          href={`/?cat=${product.categorySlug}`}
          style={{ color: "#0099dd" }}
        >
          {product.categoryName || product.categorySlug}
        </Link>{" "}
        / <span style={{ fontWeight: 600 }}>{product.name}</span>
      </div>

      {/* 🔵 IMAGE SWIPER */}
      <ImageSwiper images={images} />

      {/* 🔵 TITLE & PRICE */}
      <h1 style={{ marginTop: 16, fontSize: "1.4rem", fontWeight: 700, color: "#0077b6" }}>
        {product.name}
      </h1>

      <p style={{ fontSize: "1.3rem", fontWeight: 800, color: "#0099cc" }}>
        ₹ {product.price}
      </p>

      {/* 🔵 OFFER SECTION */}
      {product.offer && (
        <div
          style={{
            marginTop: 10,
            padding: "10px 12px",
            borderRadius: 12,
            background: "linear-gradient(90deg,#e8faff,#e7fff1)",
            color: "#0077aa",
            fontWeight: 600,
          }}
        >
          🔥 {product.offer}
        </div>
      )}

      {/* 🔵 BUY BUTTONS */}
      <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 10 }}>
        {product.amazonLink && (
          <a
            href={product.amazonLink}
            target="_blank"
            className="btn-glow"
            style={{
              padding: "12px 18px",
              textAlign: "center",
              background: "linear-gradient(90deg,#00c6ff,#00ff99)",
              borderRadius: 12,
              fontWeight: 800,
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
            className="btn-glow"
            style={{
              padding: "12px 18px",
              textAlign: "center",
              background: "linear-gradient(90deg,#ff9ab3,#ff6aa3)",
              borderRadius: 12,
              fontWeight: 800,
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
            className="btn-glow"
            style={{
              padding: "12px 18px",
              textAlign: "center",
              background: "linear-gradient(90deg,#0011ff,#00d4ff)",
              borderRadius: 12,
              fontWeight: 800,
              color: "#fff",
              textDecoration: "none",
            }}
          >
            Buy on Ajio
          </a>
        )}
      </div>

      {/* 🔵 PRODUCT DESCRIPTION */}
      {product.description && (
        <div style={{ marginTop: 20, lineHeight: 1.6, color: "#444" }}>
          <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#0077b6" }}>
            Description
          </h3>
          <p style={{ marginTop: 6 }}>{product.description}</p>
        </div>
      )}

      {/* 🔵 RELATED PRODUCTS (OPTIONAL) */}
      {/* Add related product slider later */}

    </main>
  );
    }
  
