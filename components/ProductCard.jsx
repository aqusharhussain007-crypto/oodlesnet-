"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

export default function ProductCard({ product }) {
  const router = useRouter();

  // ------------------------------
  // 🔥 Add to Recently Viewed
  // ------------------------------
  function saveRecent() {
    if (typeof window === "undefined") return;

    let recent = JSON.parse(localStorage.getItem("recent") || "[]");

    // remove if exists
    recent = recent.filter((p) => p.id !== product.id);

    // add to top
    recent.unshift({
      id: product.id,
      name: product.name,
      imageUrl: product.imageUrl,
    });

    // limit to 12 items
    if (recent.length > 12) recent = recent.slice(0, 12);

    localStorage.setItem("recent", JSON.stringify(recent));
  }

  // ------------------------------
  // 🔥 Handle Click → Save + Navigate
  // ------------------------------
  function openProduct() {
    saveRecent();
    router.push(`/product/${product.id}`);
  }

  return (
    <div
      onClick={openProduct}
      style={{
        display: "block",
        width: "92%",               // ⭐ breathing space
        maxWidth: "420px",
        margin: "0 auto 18px auto", // ⭐ center cards
        background: "linear-gradient(135deg, #e6faff, #e4ffee)",
        borderRadius: "22px",
        padding: "16px",
        boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
        cursor: "pointer",
        transition: "transform 0.2s ease",
      }}
    >
      {/* PRODUCT IMAGE */}
      <div style={{ width: "100%", borderRadius: "16px", overflow: "hidden" }}>
        <Image
          src={product.imageUrl}
          alt={product.name}
          width={500}
          height={350}
          style={{
            width: "100%",
            height: "auto",
            objectFit: "cover",
            borderRadius: "16px",
          }}
        />
      </div>

      {/* PRODUCT NAME */}
      <h3
        style={{
          marginTop: "10px",
          fontSize: "1.15rem",
          fontWeight: 700,
          color: "#0094d9",
        }}
      >
        {product.name}
      </h3>

      {/* PRODUCT PRICE */}
      <p
        style={{
          marginTop: "6px",
          fontSize: "1.1rem",
          fontWeight: 700,
          color: "#0077b6",
        }}
      >
        ₹ {product.price}
      </p>
    </div>
  );
}
