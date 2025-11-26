"use client";

export default function Navbar() {
  return (
    <nav
      style={{
        width: "100%",
        padding: "1rem 2rem",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        background: "#ffffff",
        borderBottom: "1px solid #ddd",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >
      <h2 className="brand-title" style={{ margin: 0 }}>
        OodlesNet
      </h2>

      <div style={{ display: "flex", gap: "1.5rem" }}>
        <a href="/" style={{ textDecoration: "none" }}>Home</a>
        <a href="/products" style={{ textDecoration: "none" }}>Products</a>
        <a href="/about" style={{ textDecoration: "none" }}>About</a>
        <a href="/contact" style={{ textDecoration: "none" }}>Contact</a>
      </div>
    </nav>
  );
}
