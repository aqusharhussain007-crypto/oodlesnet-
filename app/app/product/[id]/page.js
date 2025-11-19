import { products } from "../../../data/products";

export default function ProductPage({ params }) {
  const productId = parseInt(params.id);
  const product = products.find((p) => p.id === productId);

  if (!product) {
    return <h2 style={{ padding: 30 }}>Product not found</h2>;
  }

  return (
    <div style={{ padding: "40px", fontFamily: "Arial" }}>
      <h1>{product.name}</h1>

      <img
        src={product.image}
        alt={product.name}
        style={{
          width: "350px",
          borderRadius: "10px",
          margin: "20px 0",
        }}
      />

      <p>{product.description}</p>

      <h3>Price Comparison</h3>

      {product.stores.map((s, index) => (
        <div
          key={index}
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "8px 0",
            borderBottom: "1px solid #eee",
          }}
        >
          <span>{s.name}</span>
          <strong>₹{s.price}</strong>
        </div>
      ))}
    </div>
  );
}
