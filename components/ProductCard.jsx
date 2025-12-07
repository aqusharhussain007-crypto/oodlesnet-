"use client";
import Image from "next/image";
import Link from "next/link";

export default function ProductCard({ product }) {
  return (
    <Link
      href={`/product/${product.id}`}
      style={{
        display: "block",
        width: "92%",               // ⭐ breathing space left & right
        maxWidth: "420px",          // ⭐ still centered & neat
        margin: "0 auto 18px auto", // ⭐ center every card
        background: "linear-gradient(135deg, #e6faff, #e4ffee)",
        borderRadius: "22px",
        padding: "16px",
        boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
        textDecoration: "none",
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
    </Link>
  );
            }
            
