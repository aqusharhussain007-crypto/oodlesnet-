"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { db } from "@/lib/firebase-app";
import { doc, getDoc } from "firebase/firestore";

export default function ProductPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProduct() {
      const ref = doc(db, "products", id);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        setProduct({ id: snap.id, ...snap.data() });
      }
      setLoading(false);
    }

    loadProduct();
  }, [id]);

  if (loading) return <p style={{ padding: 20 }}>Loading...</p>;
  if (!product) return <p style={{ padding: 20 }}>Product not found.</p>;

  return (
    <main style={{ padding: "20px" }}>
      
      {/* PRODUCT IMAGE */}
      <img
        src={product.imageUrl}
        alt={product.name}
        style={{
          width: "100%",
          borderRadius: "12px",
          boxShadow: "0 0 20px rgba(0,195,255,0.4)",
          marginBottom: "18px",
        }}
      />

      {/* PRODUCT NAME */}
      <h1
        style={{
          fontSize: "1.6rem",
          marginBottom: "10px",
          color: "#00b7ff",
        }}
      >
        {product.name}
      </h1>

      {/* PRODUCT DESCRIPTION */}
      <p style={{ opacity: 0.9, marginBottom: "20px" }}>
        {product.description}
      </p>

      {/* BASE PRICE */}
      <div
        style={{
          padding: "15px",
          borderRadius: "12px",
          background: "rgba(0,195,255,0.1)",
          border: "2px solid #00c3ff",
          marginBottom: "20px",
        }}
      >
        <h2 style={{ marginBottom: "5px" }}>Base Price</h2>
        <p style={{ fontSize: "1.3rem", fontWeight: "bold" }}>
          ₹ {product.price}
        </p>
      </div>

      {/* ⭐ BUY NOW BUTTONS & PRICE COMPARISON SECTION ⭐ */}
      <div
        style={{
          padding: "15px",
          borderRadius: "12px",
          background: "rgba(255,255,255,0.15)",
          boxShadow: "0 0 12px rgba(0,0,0,0.2)",
          marginTop: "20px",
        }}
      >
        <h2 style={{ marginBottom: "10px" }}>Compare Prices</h2>

        {/* AMAZON */}
        <a
          href="#"
          style={{
            display: "block",
            background: "#FF9900",
            padding: "12px",
            borderRadius: "10px",
            color: "black",
            fontWeight: "bold",
            textAlign: "center",
            marginBottom: "12px",
            textDecoration: "none",
            boxShadow: "0 0 10px rgba(255,153,0,0.5)",
          }}
        >
          Buy on Amazon
        </a>

        {/* FLIPKART */}
        <a
          href="#"
          style={{
            display: "block",
            background: "#007BFF",
            padding: "12px",
            borderRadius: "10px",
            color: "white",
            fontWeight: "bold",
            textAlign: "center",
            marginBottom: "12px",
            textDecoration: "none",
            boxShadow: "0 0 10px rgba(0,123,255,0.5)",
          }}
        >
          Buy on Flipkart
        </a>

        {/* MEESHO */}
        <a
          href="#"
          style={{
            display: "block",
            background: "#FF3B9D",
            padding: "12px",
            borderRadius: "10px",
            color: "white",
            fontWeight: "bold",
            textAlign: "center",
            marginBottom: "12px",
            textDecoration: "none",
            boxShadow: "0 0 10px rgba(255,59,157,0.5)",
          }}
        >
          Buy on Meesho
        </a>

        {/* AJIO */}
        <a
          href="#"
          style={{
            display: "block",
            background: "#2C2C2C",
            padding: "12px",
            borderRadius: "10px",
            color: "white",
            fontWeight: "bold",
            textAlign: "center",
            marginBottom: "12px",
            textDecoration: "none",
            boxShadow: "0 0 10px rgba(0,0,0,0.4)",
          }}
        >
          Buy on AJIO
        </a>

        <p
          style={{
            fontSize: "0.8rem",
            opacity: 0.7,
            marginTop: "5px",
            textAlign: "center",
          }}
        >
          (Affiliate links will be added in Phase 2)
        </p>
      </div>
    </main>
  );
        }
