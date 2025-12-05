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

      if (snap.exists()) setProduct({ id: snap.id, ...snap.data() });
      setLoading(false);
    }
    loadProduct();
  }, [id]);

  if (loading) return <p style={{ padding: 20 }}>Loading...</p>;
  if (!product) return <p style={{ padding: 20 }}>Product not found.</p>;

  return (
    <main style={{ padding: "20px" }}>
      {/* Product Image */}
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

      {/* Product Name */}
      <h1 style={{ fontSize: "1.6rem", marginBottom: "10px", color: "#00b7ff" }}>
        {product.name}
      </h1>

      {/* Description */}
      <p style={{ opacity: 0.9, marginBottom: "20px" }}>
        {product.description}
      </p>

      {/* Price Section */}
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

      {/* Comparison Section Placeholder */}
      <div
        style={{
          padding: "15px",
          borderRadius: "12px",
          background: "rgba(255,255,255,0.15)",
          boxShadow: "0 0 12px rgba(0,0,0,0.2)",
        }}
      >
        <h2 style={{ marginBottom: "10px" }}>Compare Prices</h2>

        <div style={{ marginBottom: "12px" }}>
          <b>Amazon:</b> Coming soon…
        </div>
        <div style={{ marginBottom: "12px" }}>
          <b>Flipkart:</b> Coming soon…
        </div>
        <div style={{ marginBottom: "12px" }}>
          <b>Meesho:</b> Coming soon…
        </div>
        <div style={{ marginBottom: "12px" }}>
          <b>AJIO:</b> Coming soon…
        </div>

        <p style={{ fontSize: "0.8rem", opacity: 0.7, marginTop: "10px" }}>
          (Automatic price comparison will be added in Phase 2)
        </p>
      </div>
    </main>
  );
            }
