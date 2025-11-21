import { products } from "../data/products";

export default function Home() {
  return (
    <div style={{ padding: "30px", fontFamily: "Arial" }}>
      <h1>OodlesNet 🚀</h1>

      <h2>Products</h2>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
        {products.map((product) => (
          <a
            key={product.id}
            href={`/product/${product.id}`}
            style={{
              border: "1px solid #ccc",
              padding: "15px",
              borderRadius: "10px",
              width: "200px",
              textDecoration: "none",
            }}
          >
            <img src={product.image} width="200" />
            <h3>{product.name}</h3>
            <p>{product.price}</p>
          </a>
        ))}
      </div>
    </div>
  );
              }
              
