"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase-app";
import { doc, getDoc } from "firebase/firestore";

export default function ProductDetail({ params }) {
  const [product, setProduct] = useState(null);

  useEffect(() => {
    async function loadProduct() {
      const ref = doc(db, "products", params.id);
      const snap = await getDoc(ref);
      if (snap.exists()) setProduct(snap.data());
    }
    loadProduct();
  }, [params.id]);

  if (!product) {
    return (
      <div style={{ padding: 20, color: "#00b7ff" }}>
        Loading product...
      </div>
    );
  }

  const stores = [
    {
      name: "Amazon",
      logo: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg",
      price: product.amazonPrice,
      offer: product.amazonOffer,
      url: product.amazonUrl
    },
    {
      name: "Flipkart",
      logo: "https://upload.wikimedia.org/wikipedia/commons/1/15/Flipkart_logo.png",
      price: product.flipkartPrice,
      offer: product.flipkartOffer,
      url: product.flipkartUrl
    },
    {
      name: "Meesho",
      logo: "https://upload.wikimedia.org/wikipedia/commons/8/8c/Meesho_Logo.png",
      price: product.meeshoPrice,
      offer: product.meeshoOffer,
      url: product.meeshoUrl
    },
    {
      name: "Ajio",
      logo: "https://upload.wikimedia.org/wikipedia/commons/7/7e/Ajio_Logo.png",
      price: product.ajioPrice,
      offer: product.ajioOffer,
      url: product.ajioUrl
    }
  ];

  return (
    <main style={{ padding: "16px" }}>

      {/* Product Image */}
      <div
        style={{
          width: "100%",
          borderRadius: "14px",
          overflow: "hidden",
          marginBottom: "16px",
          boxShadow: "0 0 12px rgba(0,200,255,0.5)"
        }}
      >
        <img
          src={product.imageUrl}
          alt={product.name}
          style={{ width: "100%", display: "block" }}
        />
      </div>

      {/* Product Title */}
      <h1
        style={{
          fontSize: "1.4rem",
          fontWeight: "bold",
          color: "#00b7ff",
          marginBottom: "8px"
        }}
      >
        {product.name}
      </h1>

      {/* Description */}
      <p style={{ marginBottom: "14px", opacity: 0.85 }}>
        {product.description}
      </p>

      {/* Rotating Store Logos */}
      <div
        style={{
          display: "flex",
          gap: "14px",
          overflowX: "auto",
          padding: "10px 0",
          marginBottom: "18px"
        }}
      >
        {stores.map(
          (s) =>
            s.price > 0 && (
              <div
                key={s.name}
                style={{
                  minWidth: "60px",
                  height: "60px",
                  borderRadius: "50%",
                  background: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 0 10px rgba(0,200,255,0.6)"
                }}
              >
                <img
                  src={s.logo}
                  alt={s.name}
                  style={{ width: "38px", height: "38px", objectFit: "contain" }}
                />
              </div>
            )
        )}
      </div>

      {/* Store Price Comparison */}
      <h2 style={{ color: "#00c3ff", marginBottom: "10px" }}>Compare Prices</h2>

      <div style={{ display: "grid", gap: "12px" }}>
        {stores.map(
          (s) =>
            s.price > 0 && (
              <div
                key={s.name}
                style={{
                  borderRadius: "12px",
                  padding: "14px",
                  background: "rgba(255,255,255,0.25)",
                  backdropFilter: "blur(8px)",
                  boxShadow: "0 0 8px rgba(0,200,255,0.4)"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <strong style={{ fontSize: "1.1rem" }}>{s.name}</strong>

                  <span
                    style={{
                      fontSize: "1.2rem",
                      color: "#00eaff",
                      fontWeight: "bold"
                    }}
                  >
                    ₹{s.price}
                  </span>
                </div>

                <p style={{ margin: "6px 0", opacity: 0.8 }}>{s.offer}</p>

                <a
                  href={s.url}
                  target="_blank"
                  style={{
                    display: "block",
                    textAlign: "center",
                    marginTop: "6px",
                    padding: "10px",
                    borderRadius: "10px",
                    background: "linear-gradient(90deg,#00c3ff,#00ff95)",
                    color: "black",
                    fontWeight: "bold",
                    textDecoration: "none",
                    boxShadow: "0 0 10px rgba(0,255,200,0.6)"
                  }}
                >
                  Buy Now →
                </a>
              </div>
            )
        )}
      </div>
    </main>
  );
            }
