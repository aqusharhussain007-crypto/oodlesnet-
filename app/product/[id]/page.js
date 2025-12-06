"use client";

import { useEffect, useState, useRef } from "react";
import { db } from "@/lib/firebase-app";
import { doc, getDoc } from "firebase/firestore";
import Image from "next/image";

export default function ProductDetail({ params }) {
  const { id } = params;
  const [product, setProduct] = useState(null);

  // LOGO CAROUSEL (smooth 1-by-1 slide)
  const [index, setIndex] = useState(0);
  const running = useRef(true);
  const resumeTimer = useRef(null);

  const logos = [
    { name: "Amazon", src: "/logos/amazon.png" },
    { name: "Meesho", src: "/logos/meesho.png" },
    { name: "AJIO", src: "/logos/ajio.png" },
  ];

  // Fetch product
  useEffect(() => {
    async function load() {
      const snap = await getDoc(doc(db, "products", id));
      if (snap.exists()) setProduct(snap.data());
    }
    load();
  }, [id]);

  // AUTO SLIDE (one by one)
  useEffect(() => {
    const interval = setInterval(() => {
      if (running.current) {
        setIndex((prev) => (prev + 1) % logos.length);
      }
    }, 1700);

    return () => clearInterval(interval);
  }, []);

  // Pause on user touch + resume after 1 sec
  const userPause = () => {
    running.current = false;
    clearTimeout(resumeTimer.current);
    resumeTimer.current = setTimeout(() => {
      running.current = true;
    }, 1000);
  };

  if (!product) return <p style={{ padding: 16 }}>Loading...</p>;

  // Compact card width for 2.5 layout
  const CARD_WIDTH = "58%";

  return (
    <div style={{ padding: 16, paddingBottom: 80 }}>
      {/* Title */}
      <h1 style={{ fontSize: 32, fontWeight: 800, color: "#00b7ff", lineHeight: 1.1 }}>
        {product.name}
      </h1>

      <p style={{ color: "#666", marginTop: 6 }}>{product.description}</p>

      {/* Product Image */}
      <div style={{ marginTop: 12 }}>
        <Image
          src={product.imageUrl}
          width={700}
          height={500}
          alt={product.name}
          style={{
            width: "100%",
            borderRadius: 16,
            boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
          }}
        />
      </div>

      {/* LOGO SLIDER (One-by-one, smooth, NO blinking) */}
      <h3
        style={{
          marginTop: 20,
          color: "#00b7ff",
          fontSize: 22,
          fontWeight: 700,
        }}
      >
        Available On
      </h3>

      <div
        onTouchStart={userPause}
        onTouchMove={userPause}
        onWheel={userPause}
        style={{
          position: "relative",
          height: 120,
          overflow: "hidden",
          marginTop: 10,
        }}
      >
        {logos.map((store, i) => {
          const isActive = i === index;

          return (
            <div
              key={i}
              style={{
                position: "absolute",
                top: isActive ? 0 : 10,
                left: isActive ? "50%" : "120%",
                transform: "translateX(-50%)",
                transition: "0.8s ease",
                opacity: isActive ? 1 : 0,
                textAlign: "center",
              }}
            >
              <div
                style={{
                  width: 90,
                  height: 90,
                  borderRadius: "50%",
                  background: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 10px 25px rgba(0,195,255,0.25)",
                }}
              >
                <Image
                  src={store.src}
                  width={60}
                  height={60}
                  alt={store.name}
                  style={{ objectFit: "contain" }}
                />
              </div>

              <p style={{ marginTop: 6, fontWeight: 600 }}>{store.name}</p>
            </div>
          );
        })}
      </div>

      {/* Compare Prices */}
      <h2
        style={{
          marginTop: 20,
          fontSize: 26,
          fontWeight: 800,
          color: "#00b7ff",
        }}
      >
        Compare Prices
      </h2>

      {/* PRICE CARDS — Compact — 2.5 Visible */}
      <div
        style={{
          display: "flex",
          gap: 12,
          overflowX: "auto",
          marginTop: 12,
          paddingBottom: 16,
        }}
      >
        {[
          {
            name: "Amazon",
            price: product.amazonPrice,
            offer: product.amazonOffer,
            url: product.amazonUrl,
            key: "amazon",
          },
          {
            name: "Meesho",
            price: product.meeshoPrice,
            offer: product.meeshoOffer,
            url: product.meeshoUrl,
            key: "meesho",
          },
          {
            name: "AJIO",
            price: product.ajioPrice,
            offer: product.ajioOffer,
            url: product.ajioUrl,
            key: "ajio",
          },
        ].map((store, i) => (
          <div
            key={i}
            style={{
              minWidth: CARD_WIDTH,
              background: "white",
              borderRadius: 14,
              padding: 12,
              boxShadow: "0 8px 25px rgba(0,0,0,0.08)",
            }}
          >
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <Image
                  src={`/logos/${store.key}.png`}
                  width={28}
                  height={28}
                  alt={store.name}
                  style={{
                    background: "#fff",
                    borderRadius: 8,
                    padding: 4,
                  }}
                />
                <strong style={{ fontSize: 18 }}>{store.name}</strong>
              </div>

              <div style={{ fontWeight: 800, color: "#00b7ff", fontSize: 20 }}>
                ₹{store.price}
              </div>
            </div>

            {/* Offer */}
            <p style={{ marginTop: 6, color: "#666" }}>{store.offer}</p>

            {/* BUY BUTTON */}
            <a
              href={store.url}
              target="_blank"
              style={{
                display: "inline-block",
                marginTop: 8,
                padding: "6px 18px",
                background: "linear-gradient(90deg,#00c6ff,#00ff99)",
                borderRadius: 30,
                fontWeight: 700,
                color: "black",
                boxShadow: "0 8px 25px rgba(0,200,255,0.3)",
                textDecoration: "none",
              }}
            >
              Buy →
            </a>
          </div>
        ))}
      </div>
    </div>
  );
        }
                    
