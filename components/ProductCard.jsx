import Image from "next/image";
import Link from "next/link";

export default function ProductCard({ product }) {
  return (
    <Link href={`/product/${product.id}`}>
      <div
        style={{
          background: "linear-gradient(135deg, #d7faff, #e9ffee)",
          borderRadius: "18px",
          padding: "12px",
          boxShadow: "0 4px 14px rgba(0,200,255,0.25)",
        }}
      >
        {/* IMAGE */}
        <div style={{ width: "100%", borderRadius: "14px", overflow: "hidden" }}>
          <Image
            src={product.imageUrl}
            alt={product.name}
            width={400}
            height={300}
            style={{
              width: "100%",
              height: "auto",
              objectFit: "cover",
              display: "block",
            }}
          />
        </div>

        {/* TITLE */}
        <h3
          style={{
            fontSize: "1rem",
            fontWeight: "700",
            marginTop: "10px",
            color: "#0098dd",
          }}
        >
          {product.name}
        </h3>

        {/* PRICE */}
        <p
          style={{
            fontSize: "1.1rem",
            marginTop: "4px",
            fontWeight: "600",
            color: "#0077cc",
          }}
        >
          ₹ {product.price}
        </p>
      </div>
    </Link>
  );
}
