"use client";

import { useEffect, useState, useRef } from "react";
import { db } from "@/lib/firebase-app";
import { doc, getDoc } from "firebase/firestore";
import Image from "next/image";

export default function ProductDetail({ params }) {
  const { id } = params;
  const [product, setProduct] = useState(null);

  // small ref just to ensure we can pause/resume if user interacts
  const logoContainerRef = useRef(null);

  useEffect(() => {
    async function load() {
      try {
        const snap = await getDoc(doc(db, "products", id));
        if (snap.exists()) setProduct(snap.data());
      } catch (e) {
        console.error("Product load error:", e);
      }
    }
    load();
  }, [id]);

  if (!product) return <p className="loading">Loading...</p>;

  // store list (keep small; animation duplicates below)
  const stores = [
    { name: "Amazon", logo: "/logos/amazon.png" },
    { name: "Meesho", logo: "/logos/meesho.png" },
    { name: "Ajio", logo: "/logos/ajio.png" },
  ];

  // duplicate once to allow continuous loop (CSS translate uses -50%)
  const logosForLoop = [...stores, ...stores];

  return (
    <main className="page-container">
      <h1 className="product-title">{product.name}</h1>
      <p className="product-desc">{product.description}</p>

      <div className="product-image-wrap">
        <Image
          src={product.imageUrl}
          alt={product.name}
          width={1200}
          height={700}
          className="product-image"
        />
      </div>

      {/* AVAILABLE ON - logo strip (CSS handles continuous horizontal loop) */}
      <h2 className="section-title">Available On</h2>
      <div
        className="logo-strip-outer"
        ref={logoContainerRef}
        onMouseEnter={() => logoContainerRef.current?.classList.add("paused")}
        onMouseLeave={() => logoContainerRef.current?.classList.remove("paused")}
      >
        <div className="logo-strip">
          {logosForLoop.map((s, i) => (
            <div key={i} className="logo-item">
              <div className="logo-circle">
                <Image src={s.logo} alt={s.name} width={58} height={58} className="logo-img" />
              </div>
              <div className="logo-name">{s.name}</div>
            </div>
          ))}
        </div>
      </div>

      {/* COMPARE PRICES - horizontal scroller with 2.5 visible tall rectangular cards */}
      <h2 className="section-title">Compare Prices</h2>

      <div className="price-strip" role="list">
        {[
          {
            name: "Amazon",
            price: product.amazonPrice ?? "",
            offer: product.amazonOffer ?? "No offers",
            url: product.amazonUrl ?? "#",
          },
          {
            name: "Meesho",
            price: product.meeshoPrice ?? "",
            offer: product.meeshoOffer ?? "No offers",
            url: product.meeshoUrl ?? "#",
          },
          {
            name: "Ajio",
            price: product.ajioPrice ?? "",
            offer: product.ajioOffer ?? "No offers",
            url: product.ajioUrl ?? "#",
          },
        ].map((s, idx) => (
          <article className="price-card" key={idx} role="listitem">
            <div className="price-card-top">
              <div className="price-card-title-wrap">
                <div className="price-card-logo-placeholder">
                  {/* small logo inside card (optional) */}
                  <Image src={`/logos/${s.name.toLowerCase()}.png`} alt={s.name} width={28} height={28} />
                </div>
                <h3 className="price-card-title">{s.name}</h3>
              </div>

              <div className="price-amount">₹{s.price || ""}</div>
            </div>

            <p className="price-offer">{s.offer}</p>

            <div className="price-card-bottom">
              {/* small round gradient buy button sized around text */}
              <a className="buy-btn" href={s.url} target="_blank" rel="noreferrer">Buy →</a>

              {/* mini icons/benefits under button */}
              <div className="benefits">
                <span className="benefit-dot" /> <span className="benefit-text">Fast delivery</span>
                <span className="benefit-dot" /> <span className="benefit-text">Prime deals</span>
                <span className="benefit-dot" /> <span className="benefit-text">7-day return</span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
          }
          
