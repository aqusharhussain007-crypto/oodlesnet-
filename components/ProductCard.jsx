export default function ProductCard({ store, name, price, link }) {
  return (
    <div
      style={{
        border: "1px solid #ccc",
        borderRadius: "8px",
        padding: "15px",
        margin: "10px",
        width: "250px",
        boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
      }}
    >
      <h3 style={{ margin: "0 0 10px 0" }}>{name}</h3>
      <p style={{ margin: "0 0 5px 0", fontWeight: "bold" }}>{store}</p>
      <p style={{ margin: "0 0 10px 0" }}>₹ {price}</p>
      <a
        href={link}
        target="_blank"
        style={{
          display: "inline-block",
          padding: "8px 12px",
          backgroundColor: "#1e40af",
          color: "#fff",
          borderRadius: "4px",
          textDecoration: "none",
        }}
      >
        Buy Now
      </a>
    </div>
  );
}
