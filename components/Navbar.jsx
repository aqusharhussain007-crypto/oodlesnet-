"use client";

import { useState } from "react";
import Link from "next/link";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav
      style={{
        width: "100%",
        padding: "16px",
        position: "sticky",
        top: 0,
        zIndex: 100,
        background: "#071424",
        boxShadow: "0 0 18px rgba(0, 200, 255, 0.35)",
      }}
    >
      {/* Top Section */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {/* Logo */}
        <Link href="/" style={{ color: "#00c8ff", fontSize: "24px", fontWeight: "bold" }}>
          OodlesNet
        </Link>

        {/* Menu Toggle Button */}
        <button
          onClick={() => setOpen(!open)}
          style={{
            background: "#0bbcff",
            border: "none",
            padding: "10px 16px",
            borderRadius: "10px",
            boxShadow: "0 0 12px rgba(11,188,255,0.5)",
            cursor: "pointer",
          }}
        >
          ☰
        </button>
      </div>

      {/* Dropdown Menu */}
      {open && (
        <div
          style={{
            marginTop: "12px",
            background: "#0d2237",
            padding: "20px",
            borderRadius: "12px",
            boxShadow: "0 0 16px rgba(11,188,255,0.4)",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "14px",
            }}
          >
            <Link href="/" style={menuItemStyle}>Home</Link>
            <Link href="/products" style={menuItemStyle}>Products</Link>
            <Link href="/about" style={menuItemStyle}>About</Link>
            <Link href="/contact" style={menuItemStyle}>Contact</Link>
          </div>
        </div>
      )}
    </nav>
  );
}

const menuItemStyle = {
  color: "white",
  fontSize: "18px",
  textDecoration: "none",
  padding: "10px 12px",
  borderRadius: "8px",
  background: "rgba(255,255,255,0.08)",
  boxShadow: "0 0 8px rgba(0, 180, 255, 0.25)",
};
              
