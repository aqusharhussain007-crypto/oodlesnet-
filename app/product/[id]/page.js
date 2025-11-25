"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export default function ProductPage({ params }) {
  const [product, setProduct] = useState(null);

  useEffect(() => {
    async function loadProduct() {
      const ref = doc(db, "products", params.id);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        setProduct({ id: snap.id, ...snap.data() });
      }
    }

    loadProduct();
  }, [params.id]);

  if (!product) return <h1>Loading...</h1>;

  return (
    <div style={{ padding: "30px", fontFamily: "Arial", maxWidth: "600px", margin: "auto" }}>
      <h1>{product.name}</h1>

      <img
        src={product.image}
        alt={product.name}
        style={{ width: "100%", borderRadius: "10px", marginBottom: "20px" }}
      />

      <p style={{ color: "#555" }}>{product.description}</p>

      <h2 style={{ marginTop: "30px" }}>Price</h2>
      <p>₹{product.price}</p>
    </div>
  );
        }
        
