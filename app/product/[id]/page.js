import ProductCard from "../../../components/ProductCard";
export default function ProductPage({ params }) {
  const product = products.find(p => p.id === Number(params.id));

  if (!product) {
    return <h1 style={{ padding: "30px", fontFamily: "Arial" }}>Product Not Found</h1>;
  }

  return (
    <div style={{ padding: "30px", fontFamily: "Arial", maxWidth: "600px", margin: "auto" }}>
      <h1>{product.name}</h1>

      <img
        src={product.image}
        alt={product.name}
        style={{ width: "100%", borderRadius: "10px", marginBottom: "20px" }}
      />

      <p style={{ color: "#555" }}>{product.description}</p>

      <h2 style={{ marginTop: "30px" }}>Available Prices</h2>

      <div style={{ marginTop: "15px" }}>
        {product.stores.map((store, index) => (
          <div
            key={index}
            style={{
              background: "#f3f3f3",
              padding: "15px",
              borderRadius: "10px",
              marginBottom: "12px"
            }}
          >
            <strong>{store.name}</strong> — ₹{store.price}
            <br />
            <a
              href={store.link}
              target="_blank"
              style={{
                display: "inline-block",
                marginTop: "8px",
                padding: "8px 14px",
                background: "#0070f3",
                color: "#fff",
                borderRadius: "6px",
              }}
            >
              View on {store.name}
            </a>
          </div>
        ))}
      </div>
    </div>
  );
      }
  
