"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase-app";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import Image from "next/image";

export default function ProductPage({ params }) {
  const { id } = params;
  const [product, setProduct] = useState(null);

  /* ---------------- FETCH PRODUCT ---------------- */
  useEffect(() => {
    async function loadProduct() {
      const snap = await getDoc(doc(db, "products", id));
      if (snap.exists()) {
        const data = snap.data();
        setProduct(data);

        // update views (non-blocking)
        updateDoc(doc(db, "products", id), {
          views: Number(data.views || 0) + 1,
        }).catch(() => {});
      }
    }
    loadProduct();
  }, [id]);

  if (!product) {
    return (
      <div style={{ padding: 20, textAlign: "center", color: "#0077b6" }}>
        Loading product...
      </div>
    );
  }

  /* ---------------- SHARE HANDLER ---------------- */
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

  /* ---------------- PRICE ROW COMPONENT ---------------- */
  const PriceRow = ({ label, price, offer, url, color1, color2 }) => {
    if (!price || !url) return null;

    return (
      <div
        style={{
          background: "#fff",
          borderRadius: 18,
          padding: "16px 18px",
          marginBottom: 16,
          boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
        }}
      >
        <h3 style={{ color: "#005f99", marginBottom: 6 }}>
          {label}: ₹ {price}
        </h3>
        <p style={{ color: "#666", marginBottom: 14 }}>{offer}</p>

        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "block",
            width: "100%",
            padding: "14px 0",
            textAlign: "center",
            borderRadius: 14,
            fontWeight: 700,
            color: "#fff",
            background: `linear-gradient(90deg, ${color1}, ${color2})`,
            boxShadow: "0 4px 18px rgba(0,0,0,0.12)",
          }}
        >
          Buy on {label}
        </a>
      </div>
    );
  };

  return (
    <main style={{ padding: 14, paddingBottom: 40 }}>
      {/* Breadcrumbs */}
      <div style={{ fontSize: 14, marginBottom: 12, color: "#0077b6" }}>
        <span
          onClick={() => (window.location = "/")}
          style={{ cursor: "pointer", fontWeight: 600 }}
        >
          Home
        </span>{" "}
        /{" "}
        <span style={{ fontWeight: 600 }}>
          {product.categorySlug?.replace("-", " ")}
        </span>{" "}
        /{" "}
        <span style={{ fontWeight: 700, color: "#023e8a" }}>{product.name}</span>
      </div>

      {/* Main product image */}
      <div
        style={{
          width: "100%",
          background: "#fff",
          borderRadius: 20,
          overflow: "hidden",
          boxShadow: "0 4px 18px rgba(0,0,0,0.1)",
        }}
      >
        <Image
          src={product.imageUrl}
          width={700}
          height={500}
          alt={product.name}
          style={{ width: "100%", height: "auto", objectFit: "cover" }}
        />
      </div>

      {/* Share Button */}
      <div style={{ marginTop: 12, textAlign: "right" }}>
        <button
          onClick={shareProduct}
          style={{
            padding: "10px 16px",
            borderRadius: 12,
            border: "none",
            background: "#e0f7ff",
            color: "#0077b6",
            fontWeight: 700,
            boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
          }}
        >
          Share
        </button>
      </div>

      {/* Product Title */}
      <h1
        style={{
          fontSize: "1.6rem",
          marginTop: 14,
          fontWeight: 800,
          color: "#005f99",
        }}
      >
        {product.name}
      </h1>

      {/* Main price */}
      <h2
        style={{
          fontSize: "1.3rem",
          fontWeight: 700,
          marginTop: 6,
          color: "#0085c7",
        }}
      >
        ₹ {product.price}
      </h2>

      {/* Description */}
      <h2
        style={{
          marginTop: 18,
          fontSize: "1.2rem",
          fontWeight: 700,
          color: "#0a5f91",
        }}
      >
        Description
      </h2>
      <p style={{ color: "#444", fontSize: 16, marginTop: 4 }}>
        {product.description}
      </p>

      {/* Compare Prices */}
      <h2
        style={{
          marginTop: 22,
          fontSize: "1.25rem",
          fontWeight: 800,
          color: "#0077b6",
        }}
      >
        Compare Prices
      </h2>

      {/* Amazon */}
      <PriceRow
        label="Amazon"
        price={product.amazonPrice}
        offer={product.amazonOffer}
        url={product.amazonUrl}
        color1="#ff9900"
        color2="#ff6600"
      />

      {/* Meesho */}
      <PriceRow
        label="Meesho"
        price={product.meeshoPrice}
        offer={product.meeshoOffer}
        url={product.meeshoUrl}
        color1="#ff4da6"
        color2="#ff1a75"
      />

      {/* Ajio */}
      <PriceRow
        label="Ajio"
        price={product.ajioPrice}
        offer={product.ajioOffer}
        url={product.ajioUrl}
        color1="#0059ff"
        color2="#00a2ff"
      />
    </main>
  );
            }
            
