"use client";
import Image from "next/image";
import Link from "next/link";

export default function ProductCard({ product }) {
  return (
    <Link href={`/product/${product.id}`}>
      <div
        style={{
          background: "linear-gradient(135deg, #e0f7ff, #e6ffef)", // ⭐ very light blue → green
          borderRadius: "20px",
          padding: "12px",
          boxShadow: "0 0 14px rgba(0,195,255,0.35)",
          border: "1px solid rgba(0,195,255,0.35)",
          cursor: "pointer",
          transition: "all 0.25s ease",
        }}
        className="hover:scale-[1.02]"
      >
        {/* PRODUCT IMAGE */}
        <div
          style={{
            width: "100%",
            height: "170px",
            borderRadius: "14px",
            overflow: "hidden",
          }}
        >
          <Image
            src={product.imageUrl}
            alt={product.name}
            width={500}
            height={500}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        </div>

        {/* PRODUCT NAME */}
        <h3
          style={{
            fontSize: "1.05rem",
            fontWeight: "700",
            marginTop: "10px",
            color: "#00aaff",
            lineHeight: "1.3",
          }}
        >
          {product.name}
        </h3>

        {/* PRODUCT PRICE */}
        <p
          style={{
            fontSize: "1.1rem",
            fontWeight: "700",
            marginTop: "4px",
            color: "#0097e6",
          }}
        >
          ₹ {product.price}
        </p>
      </div>
    </Link>
  );
}
