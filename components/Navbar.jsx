"use client";

import Link from "next/link";

export default function Navbar() {
  return (
    <header
      style={{
        width: "100%",
        background: "#ffffff",
        padding: "14px 0",
        boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}
    >
      {/* LOGO */}
      <h1
        style={{
          textAlign: "center",
          fontSize: "28px",
          fontWeight: "700",
          color: "#0bbcff",
          marginBottom: "10px",
          textShadow: "0 0 8px rgba(11,188,255,0.5)",
        }}
      >
        OodlesNet
      </h1>

      {/* MENU ROW */}
      <nav
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "12px",
        }}
      >
        {[
          { name: "Home", link: "/" },
          { name: "Products", link: "/products" },
          { name: "About", link: "/about" },
          { name: "Contact", link: "/contact" },
        ].map((item) => (
          <Link
            key={item.name}
            href={item.link}
            style={{
              padding: "8px 14px",
              borderRadius: "6px",
              border: "2px solid #0bbcff",
              fontWeight: "600",
              textDecoration: "none",
              color: "#0bbcff",
              transition: "0.2s ease",
            }}
            className="nav-item-neon"
          >
            {item.name}
          </Link>
        ))}
      </nav>
    </header>
  );
}
