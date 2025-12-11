"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { db } from "@/lib/firebase-app";
import { doc, getDoc } from "firebase/firestore";
import Link from "next/link";

export default function ProductPage({ params }) {
  const { id } = params;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const ref = doc(db, "products", id);
        const snap = await getDoc(ref);
        if (snap.exists()) setProduct({ id: snap.id, ...snap.data() });
        else setProduct(null);
      } catch (e) {
        console.error(e);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) return <div style={{ padding: 20 }}>Loading…</div>;
  if (!product) return <div style={{ padding: 20 }}>Product not found</div>;

  // buy buttons list
  const stores = [
    { name: "Amazon", price: product.amazonPrice, url: product.amazonUrl, note: product.amazonOffer },
    { name: "Meesho", price: product.meeshoPrice, url: product.meeshoUrl, note: product.meeshoOffer },
    { name: "Ajio", price: product.ajioPrice, url: product.ajioUrl, note: product.ajioOffer },
  ].filter(s => s.url);

  // make sure numbers exist
  const price = Number(product.price || 0);

  return (
    <main className="page-container" style={{ padding: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <nav style={{ color: "#0077aa" }}>
          <Link href="/">Home</Link> / <span style={{ textTransform: "capitalize" }}>{product.categorySlug || "category"}</span> / <strong>{product.name}</strong>
        </nav>
        <button className="btn-small" style={{ background: "#e8f8ff", borderRadius: 10 }}>Share</button>
      </div>

      <div style={{ borderRadius: 16, overflow: "hidden", background: "#fff", padding: 8, boxShadow: "0 8px 30px rgba(0,0,0,0.06)" }}>
        <Image src={product.imageUrl || "/placeholder.png"} alt={product.name} width={1200} height={650} style={{ width: "100%", height: "300px", objectFit: "cover", borderRadius: 12 }} />
      </div>

      <h1 style={{ marginTop: 12, color: "#0077aa", fontSize: "1.6rem", fontWeight: 800 }}>{product.name}</h1>
      <div style={{ fontSize: "1.4rem", color: "#0077aa", fontWeight: 800, marginTop: 6 }}>₹ {price}</div>

      <h3 style={{ marginTop: 12, color: "#0b9fd6" }}>Description</h3>
      <p style={{ color: "#333", marginTop: 6 }}>{product.description || "No description available."}</p>

      <h3 style={{ marginTop: 16, color: "#0b9fd6" }}>Compare Prices</h3>

      {/* compare prices cards */}
      <div style={{ display: "grid", gap: 12, marginTop: 8 }}>
        {stores.map((s) => (
          <div key={s.name} style={{ background: "#fff", borderRadius: 12, padding: 12, boxShadow: "0 8px 30px rgba(0,0,0,0.06)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontWeight: 800 }}>{s.name}: ₹ {Number(s.price || 0)}</div>
                {s.note && <div style={{ color: "#666", marginTop: 6 }}>{s.note}</div>}
              </div>
            </div>

            {/* vertical scrolling buy area (fixed height, internal scroll) */}
            <div style={{ marginTop: 12, maxHeight: 200, overflowY: "auto", paddingRight: 6 }}>
              <a href={s.url} target="_blank" rel="noreferrer" className="buy-button-vertical">
                Buy on {s.name}
              </a>
              {/* (if you want multiple buy options per store, add more buttons here) */}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
    }
    
