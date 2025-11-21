// app/page.js
import { products } from "../data/products";

export default function Home() {
  return (
    <div style={{ padding: "30px" }}>
      <nav>
        <h1 className="glow">OodlesNet 🚀</h1>
      </nav>

      {/* Search Bar */}
      <div style={{ margin: "20px 0" }}>
        <input
          type="text"
          placeholder="Search products..."
          style={{ width: "100%" }}
        />
      </div>

      {/* Product Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
          gap: "20px",
        }}
      >
        {products.map((item) => (
          <div key={item.id} className="card">
            <img src={item.image} alt={item.title} />
            <h3 className="glow">{item.title}</h3>
            <p>{item.price}</p>

            <button style={{ marginTop: "10px" }}>View Details</button>
          </div>
        ))}
      </div>

      <footer style={{ marginTop: "40px" }}>
        <p>© 2025 OodlesNet — Compare Smart</p>
      </footer>
    </div>
  );
}
