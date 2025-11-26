export default function ProductCard({ product }) {
  return (
    <a
      href={`/product/${product.id}`}
      style={{ textDecoration: "none", color: "inherit" }}
    >
      <div className="card">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-48 object-cover rounded"
        />

        <h2 className="text-xl font-semibold mt-2">{product.name}</h2>

        {product.lowestPrice ? (
          <p style={{ marginTop: "8px", color: "#0bbcff", fontWeight: "bold" }}>
            Starting from ₹{product.lowestPrice}
          </p>
        ) : (
          <p style={{ marginTop: "8px", color: "#555" }}>
            Price not available
          </p>
        )}
      </div>
    </a>
  );
}
