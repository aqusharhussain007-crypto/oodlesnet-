export default function Footer() {
  return (
    <footer
      style={{
        marginTop: "40px",
        padding: "2rem",
        background: "#ffffff",
        borderTop: "1px solid #ddd",
        textAlign: "center",
        boxShadow: "0 -4px 12px rgba(11,188,255,0.15)"
      }}
    >
      <h2 className="brand-title" style={{ marginBottom: "15px" }}>
        OodlesNet
      </h2>

      <div style={{ marginBottom: "15px" }}>
        <a href="/" style={{ margin: "0 10px", textDecoration: "none" }}>
          Home
        </a>
        <a href="/products" style={{ margin: "0 10px", textDecoration: "none" }}>
          Products
        </a>
        <a href="/about" style={{ margin: "0 10px", textDecoration: "none" }}>
          About
        </a>
        <a href="/contact" style={{ margin: "0 10px", textDecoration: "none" }}>
          Contact
        </a>
      </div>

      <p style={{ fontSize: "0.9rem", color: "#555" }}>
        support@oodlesnet.com
      </p>

      <p style={{ marginTop: "10px", fontSize: "0.8rem", color: "#888" }}>
        © {new Date().getFullYear()} OodlesNet — All Rights Reserved.
      </p>
    </footer>
  );
}
