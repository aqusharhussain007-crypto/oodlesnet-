"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase-app";
import { doc, getDoc } from "firebase/firestore";
import Image from "next/image";

export default function ProductDetail({ params }) {
  const { id } = params;
  const [product, setProduct] = useState(null);

  // Store logos (in loop)
  const storeLogos = [
    { name: "Amazon", logo: "/amazon.png" },
    { name: "Meesho", logo: "/meesho.png" },
    { name: "Ajio", logo: "/ajio.png" },
  ];

  useEffect(() => {
    async function loadProduct() {
      const ref = doc(db, "products", id);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        setProduct(snap.data());
      }
    }
    loadProduct();
  }, [id]);

  if (!product) return <p>Loading...</p>;

  // Price card data
  const priceData = [
    {
      name: "Amazon",
      price: product.amazonPrice,
      offer: product.amazonOffer,
      url: product.amazonUrl,
      logo: "/amazon.png",
    },
    {
      name: "Meesho",
      price: product.meeshoPrice,
      offer: product.meeshoOffer,
      url: product.meeshoUrl,
      logo: "/meesho.png",
    },
    {
      name: "Ajio",
      price: product.ajioPrice,
      offer: product.ajioOffer,
      url: product.ajioUrl,
      logo: "/ajio.png",
    },
  ];

  return (
    <main style={{ padding: "16px" }}>
      {/* TITLE */}
      <h1 style={{ fontSize: "2rem", fontWeight: "700", color: "#00b7ff" }}>
        {product.name}
      </h1>

      <p style={{ marginTop: "-5px" }}>{product.description}</p>

      {/* PRODUCT IMAGE */}
      <img
        src={product.imageUrl}
        alt={product.name}
        style={{
          width: "100%",
          borderRadius: "16px",
          marginTop: "12px",
          boxShadow: "0 4px 14px rgba(0,0,0,0.1)",
        }}
      />

      {/* SPINNING LOGO LOOP */}
      <div
        style={{
          marginTop: "20px",
          display: "flex",
          justifyContent: "center",
          gap: "14px",
          overflow: "hidden",
        }}
        className="logo-slider"
      >
        {storeLogos.map((s, i) => (
          <div key={i} className="logo-bubble">
            <img
              src={s.logo}
              alt={s.name}
              style={{ width: "40px", height: "40px" }}
            />
          </div>
        ))}
      </div>

      {/* TITLE */}
      <h2
        style={{
          marginTop: "25px",
          marginBottom: "10px",
          fontSize: "1.8rem",
          fontWeight: "700",
          color: "#00b7ff",
        }}
      >
        Compare Prices
      </h2>

      {/* SWIPEABLE 2.5-CARD ROW */}
      <div
        style={{
          display: "flex",
          gap: "14px",
          overflowX: "auto",
          paddingBottom: "15px",
        }}
      >
        {priceData.map((store, index) => (
          <div
            key={index}
            style={{
              minWidth: "65%",
              background: "white",
              borderRadius: "16px",
              padding: "14px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
              border: "3px solid #c7eeff",
            }}
          >
            <h3 style={{ fontSize: "1.2rem", fontWeight: "700" }}>
              {store.name}
            </h3>

            <p
              style={{
                fontSize: "1.3rem",
                fontWeight: "700",
                color: "#00c3ff",
                marginTop: "-5px",
              }}
            >
              ₹{store.price}
            </p>

            <p
              style={{
                color: "#555",
                marginBottom: "10px",
                fontSize: "0.9rem",
              }}
            >
              {store.offer}
            </p>

            {/* SMALL BUY BUTTON */}
            <a
              href={store.url}
              target="_blank"
              style={{
                display: "inline-block",
                padding: "8px 20px",
                borderRadius: "20px",
                background:
                  "linear-gradient(90deg, #00c3ff, #00e78f 60%, #00c3ff)",
                boxShadow: "0 0 10px rgba(0,220,255,0.6)",
                color: "black",
                fontWeight: "600",
              }}
            >
              Buy →
            </a>
          </div>
        ))}
      </div>

      {/* KEYFRAME ANIMATION */}
      <style>
        {`
          .logo-bubble {
            width: 60px;
            height: 60px;
            background: white;
            border-radius: 50%;
            display:flex;
            align-items:center;
            justify-content:center;
            box-shadow: 0 0 18px rgba(0,200,255,0.6);
            animation: spinLoop 6s linear infinite;
          }

          @keyframes spinLoop {
            0%   { transform: translateX(-80px) scale(0.6); opacity:0; }
            25%  { transform: translateX(0px) scale(1); opacity:1; }
            50%  { transform: translateX(80px) scale(0.8); opacity:1; }
            75%  { transform: translateX(140px) scale(0.6); opacity:0.6; }
            100% { transform: translateX(-80px) scale(0.6); opacity:0; }
          }

        `}
      </style>
    </main>
  );
                   }
      
