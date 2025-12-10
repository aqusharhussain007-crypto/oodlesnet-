"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase-app";
import { doc, getDoc } from "firebase/firestore";
import Image from "next/image";
import Link from "next/link";

export default function ProductPage({ params }) {
  const { id } = params;
  const [product, setProduct] = useState(null);

  /* ---------------- LOAD PRODUCT ---------------- */
  useEffect(() => {
    async function load() {
      const snap = await getDoc(doc(db, "products", id));
      if (snap.exists()) {
        const data = snap.data();
        setProduct({ id: snap.id, ...data });

        // Save to recently viewed
        saveRecent({ id: snap.id, ...data });
      }
    }
    load();
  }, [id]);

  /* ---------------- SAVE RECENTLY VIEWED ---------------- */
  function saveRecent(p) {
    if (typeof window === "undefined") return;

    let recent = JSON.parse(localStorage.getItem("recent") || "[]");

    // remove if exists
    recent = recent.filter((r) => r.id !== p.id);

    // add to front
    recent.unshift({
      id: p.id,
      name: p.name,
      price: p.price,
      imageUrl: p.imageUrl,
      categorySlug: p.categorySlug,
    });

    // max 10
    if (recent.length > 10) recent = recent.slice(0, 10);

    localStorage.setItem("recent", JSON.stringify(recent));
  }

  if (!product) return <p style={{ padding: 20 }}>Loading…</p>;

  /* ---------------- SHARE PRODUCT ---------------- */
  function shareProduct() {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: "Check this out!",
        url: window.location.href,
      });
    } else {
      alert("Sharing not supported on this device.");
    }
  }

  return (
    <main style={{ padding: 16, maxWidth: 900, margin: "0 auto" }}>

      {/* Breadcrumb */}
      <div style={{ marginBottom: 12, fontSize: 14 }}>
        <Link href="/">Home</Link> /
        <Link href={`/category/${product.categorySlug}`} style={{ marginLeft: 6 }}>
          {product.categorySlug}
        </Link> /
        <span style={{ marginLeft: 6, fontWeight: 700 }}>{product.name}</span>
      </div>

      {/* IMAGE BOX */}
      <div
        style={{
          width: "100%",
          borderRadius: 18,
          padding: 10,
          background: "white",
          boxShadow: "0 4px 14px rgba(0,0,0,0.1)",
        }}
      >
        <Image
          src={product.imageUrl}
          width={900}
          height={600}
          alt={product.name}
          style={{
            width: "100%",
            height: "auto",
            borderRadius: 14,
            objectFit: "cover",
          }}
        />
      </div>

      {/* TITLE + PRICE */}
      <h1
        style={{
          marginTop: 16,
          fontSize: "1.7rem",
          fontWeight: 800,
          color: "#007bcd",
        }}
      >
        {product.name}
      </h1>

      <p
        style={{
          marginTop: 6,
          fontWeight: 700,
          fontSize: "1.4rem",
          color: "#0088cc",
        }}
      >
        ₹ {product.price}
      </p>

      {/* DESCRIPTION */}
      <h2 style={{ marginTop: 20, fontWeight: 700, fontSize: "1.2rem", color: "#0077cc" }}>
        Description
      </h2>
      <p style={{ marginTop: 6, fontSize: 16, color: "#333" }}>
        {product.description}
      </p>

      {/* PRICE COMPARISON */}
      <h2 style={{ marginTop: 26, fontWeight: 700, fontSize: "1.2rem", color: "#0077cc" }}>
        Compare Prices
      </h2>

      <div style={{ marginTop: 12 }}>
        {/* AMAZON ROW */}
        {product.amazonUrl && (
          <div
            style={{
              padding: 14,
              borderRadius: 12,
              background: "#fff",
              marginBottom: 12,
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            }}
          >
            <strong>Amazon:</strong> ₹ {product.amazonPrice}
            <br />
            <small style={{ color: "#777" }}>{product.amazonOffer}</small>

            <a
              href={product.amazonUrl}
              target="_blank"
              style={{
                display: "block",
                marginTop: 10,
                padding: 12,
                borderRadius: 10,
                textAlign: "center",
                fontWeight: 800,
                background: "linear-gradient(90deg,#ff9900,#ffb74d)",
                color: "white",
                textDecoration: "none",
              }}
            >
              Buy on Amazon
            </a>
          </div>
        )}

        {/* MEESHO ROW */}
        {product.meeshoUrl && (
          <div
            style={{
              padding: 14,
              borderRadius: 12,
              background: "#fff",
              marginBottom: 12,
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            }}
          >
            <strong>Meesho:</strong> ₹ {product.meeshoPrice}
            <br />
            <small style={{ color: "#777" }}>{product.meeshoOffer}</small>

            <a
              href={product.meeshoUrl}
              target="_blank"
              style={{
                display: "block",
                marginTop: 10,
                padding: 12,
                borderRadius: 10,
                textAlign: "center",
                fontWeight: 800,
                background: "linear-gradient(90deg,#ff4fa5,#ff7bbd)",
                color: "white",
                textDecoration: "none",
              }}
            >
              Buy on Meesho
            </a>
          </div>
        )}

        {/* AJIO ROW */}
        {product.ajioUrl && (
          <div
            style={{
              padding: 14,
              borderRadius: 12,
              background: "#fff",
              marginBottom: 12,
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            }}
          >
            <strong>Ajio:</strong> ₹ {product.ajioPrice}
            <br />
            <small style={{ color: "#777" }}>{product.ajioOffer}</small>

            <a
              href={product.ajioUrl}
              target="_blank"
              style={{
                display: "block",
                marginTop: 10,
                padding: 12,
                borderRadius: 10,
                textAlign: "center",
                fontWeight: 800,
                background: "linear-gradient(90deg,#004cff,#00d2ff)",
                color: "white",
                textDecoration: "none",
              }}
            >
              Buy on Ajio
            </a>
          </div>
        )}
      </div>

      {/* SHARE BUTTON */}
      <button
        onClick={shareProduct}
        style={{
          width: "100%",
          marginTop: 20,
          padding: 14,
          borderRadius: 12,
          fontWeight: 700,
          background: "linear-gradient(90deg,#00c6ff,#00ff9d)",
          color: "#003",
          border: "none",
        }}
      >
        Share Product
      </button>

      <footer
        style={{
          marginTop: 30,
          textAlign: "center",
          color: "#777",
          fontSize: 14,
        }}
      >
        © 2025 OodlesNet. All Rights Reserved.
      </footer>
    </main>
  );
                    }
                    
