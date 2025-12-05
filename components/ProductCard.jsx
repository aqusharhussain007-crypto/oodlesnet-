import Link from "next/link";

export default function ProductCard({ product }) {
  return (
    <Link href={`/product/${product.id}`}>
      <div
        style={{
          padding: "12px",
          borderRadius: "14px",
          background: "rgba(0,0,0,0.7)",
          color: "white",
          boxShadow: "0 0 12px rgba(0,195,255,0.4)",
          cursor: "pointer",
        }}
      >
        <img
          src={product.imageUrl}
          alt={product.name}
          style={{
            width: "100%",
            height: "150px",
            objectFit: "cover",
            borderRadius: "10px",
            marginBottom: "10px",
          }}
        />

        <h3 style={{ margin: 0, fontSize: "1rem" }}>{product.name}</h3>
        <p style={{ marginTop: "6px", fontWeight: "bold", color: "#00c3ff" }}>
          ₹ {product.price}
        </p>
      </div>
    </Link>
  );
}
