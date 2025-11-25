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
        background: "#fff",
        borderBottom: "1px solid #ddd",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >
      <h2>OodlesNet</h2>
      <div style={{ display: "flex", gap: "1.5rem" }}>
        <a href="/">Home</a>
      </div>
    </nav>
  );
}
