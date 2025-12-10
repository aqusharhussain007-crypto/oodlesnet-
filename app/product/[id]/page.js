// app/product/[id]/page.js
"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase-app";
import { doc, getDoc } from "firebase/firestore";
import Image from "next/image";
import Head from "next/head";

export default function ProductPage({ params }) {
  const { id } = params;

  const [product, setProduct] = useState(null);

  // Load product
  useEffect(() => {
    async function load() {
      const ref = doc(db, "products", id);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        setProduct({ id: snap.id, ...snap.data() });

        // Store in recently viewed
        const rv = JSON.parse(localStorage.getItem("recent") || "[]");
        const exists = rv.find((p) => p.id === snap.id);
        if (!exists) {
          rv.unshift({
            id: snap.id,
            name: snap.data().name,
            price: snap.data().price,
            imageUrl: snap.data().imageUrl,
          });
        }
        localStorage.setItem("recent", JSON.stringify(rv.slice(0, 10)));
      }
    }
    load();
  }, [id]);

  if (!product) return <p style={{ padding: 20 }}>Loading...</p>;

  /* ----------------- SEO: JSON-LD STRUCTURED DATA ----------------- */
  const jsonLd = {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: product.name,
    image: product.imageUrl,
    description: product.description || "Product details",
    sku: product.id,
    brand: {
      "@type": "Brand",
      name: "OodlesNet",
    },
    offers: {
      "@type": "Offer",
      url: `https://oodlesnet.vercel.app/product/${product.id}`,
      priceCurrency: "INR",
      price: product.price || 0,
      availability: "https://schema.org/InStock",
    },
  };

  return (
    <>
      {/* ----------- SEO / OPEN GRAPH / TWITTER ---------- */}
      <Head>
        <title>{product.name} — Best Price Comparison</title>
        <meta
          name="description"
          content={product.description || "Compare prices across all stores"}
        />

        {/* OG Tags for WhatsApp / Facebook */}
        <meta property="og:title" content={product.name} />
        <meta
          property="og:description"
          content={product.description || "Best online price comparison"}
        />
        <meta property="og:image" content={product.imageUrl} />
        <meta
          property="og:url"
          content={`https://oodlesnet.vercel.app/product/${product.id}`}
        />
        <meta property="og:type" content="product" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={product.name} />
        <meta
          name="twitter:description"
          content={product.description || "Best online price"}
        />
        <meta name="twitter:image" content={product.imageUrl} />

        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </Head>

      {/* ---------------- UI SECTION ---------------- */}
      <main style={{ padding: 16 }}>
        <Image
          src={product.imageUrl}
          width={800}
          height={600}
          alt={product.name}
          style={{ width: "100%", borderRadius: 18, objectFit: "cover" }}
        />

        <h1 style={{ marginTop: 14, color: "#0094d9" }}>{product.name}</h1>

        <p
          style={{
            fontSize: "1.3rem",
            fontWeight: "800",
            marginTop: 8,
            color: "#0077b6",
          }}
        >
          ₹ {product.price}
        </p>

        {product.description && (
          <p style={{ marginTop: 10, color: "#444", lineHeight: 1.6 }}>
            {product.description}
          </p>
        )}

        {/* (Rest of your price comparison UI will stay same - Amazon, Flipkart, etc.) */}
      </main>
    </>
  );
            }
    
