"use client";

import { useState } from "react";
import Link from "next/link";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav
      style={{
        width: "100%",
        background: "#071018",
        padding: "6px 14px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        position: "sticky",
        top: 0,
        zIndex: 100,
        boxShadow: "0 2px 12px rgba(0,0,0,0.35)",
      }}
    >
      {/* LOGO */}
      <Link href="/" style={{ display: "flex", alignItems: "center" }}>
        <img
          src="/logo.png"
          alt="logo"
          style={{
            height: "80px",
            width: "220",
            objectFit: "contain",
            cursor: "pointer",
            display: "block",
          }}
        />
      </Link>

      {/* MENU BUTTON */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          background: "#00b7ff",
          borderRadius: "12px",
          width: "48px",
          height: "48px",
          border: "none",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontSize: "26px",
          color: "#fff",
          boxShadow: "0 0 15px rgba(0,183,255,0.7)",
        }}
      >
        ☰
      </button>

      {/* DROPDOWN MENU */}
      {open && (
        <div
          style={{
            position: "absolute",
            right: "18px",
            top: "75px",
            background: "#0a1824",
            borderRadius: "10px",
            padding: "14px 18px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            boxShadow: "0 0 20px rgba(0,183,255,0.4)",
          }}
        >
          <Link href="/" className="nav-link">Home</Link>
          <Link href="/products" className="nav-link">Products</Link>
          <Link href="/about" className="nav-link">About</Link>
          <Link href="/contact" className="nav-link">Contact</Link>
        </div>
      )}
    </nav>
  );
}
