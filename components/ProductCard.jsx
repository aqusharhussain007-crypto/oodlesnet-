"use client";

export default function ProductCard({ product }) {
  return (
    <div
      className="product-card pulse-on-hover"
      style={{
        background: "#0b111d",
        border: "2px solid rgba(0, 183, 255, 0.5)",
        borderRadius: "14px",
        padding: "12px",
        boxShadow: "0 0 12px rgba(0, 183, 255, 0.25)",
        transition: "all 0.3s ease",
        cursor: "pointer",
        animation: "fadeIn 0.6s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-6px)";
        e.currentTarget.style.boxShadow =
          "0 0 18px rgba(0, 183, 255, 0.45)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0px)";
        e.currentTarget.style.boxShadow =
          "0 0 12px rgba(0, 183, 255, 0.25)";
      }}
      onClick={() => (window.location.href = `/product/${product.id}`)}
    >
      {/* Product Image */}
      <img
        src={product.image}
        alt={product.name}
        style={{
          width: "100%",
          height: "170px",
          objectFit: "cover",
          borderRadius: "10px",
          marginBottom: "10px",
          boxShadow: "0 0 12px rgba(0, 183, 255, 0.35)",
        }}
      />

      {/* Title */}
      <h3
        style={{
          color: "white",
          fontSize: "1.05rem",
          fontWeight: "600",
          marginBottom: "6px",
          textShadow: "0 0 6px rgba(0, 183, 255, 0.6)",
        }}
      >
        {product.name}
      </h3>

      {/* Lowest Price */}
      {product.lowestPrice && (
        <p
          style={{
            color: "#00eaff",
            fontSize: "1rem",
            fontWeight: "bold",
          }}
        >
          ₹{product.lowestPrice}
        </p>
      )}
    </div>
  );
}
