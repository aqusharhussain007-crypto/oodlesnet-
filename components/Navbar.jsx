"use client";

import { useState } from "react";
import Link from "next/link";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav
      style={{
        backgroundColor: "#000D1A",
        padding: "4px 12px",
        height: "54px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >
      {/* Logo */}
      <Link href="/">
        <img
          src="/logo.png"
          alt="OodlesNet"
          style={{ height: "40px", cursor: "pointer" }}
        />
      </Link>

      {/* Hamburger */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: "40px",
          height: "40px",
          borderRadius: "8px",
          background: "#00c3ff",
          border: "none",
          boxShadow: "0 0 10px #00c3ff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
        }}
      >
        ☰
      </button>

      {/* Dropdown Menu */}
      {open && (
        <div
          style={{
            position: "absolute",
            top: "54px",
            right: "12px",
            background: "#00172A",
            borderRadius: "8px",
            padding: "10px",
            boxShadow: "0 0 12px rgba(0,255,255,0.3)",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            zIndex: 200,
          }}
        >
          <Link href="/" className="nav-link">Home</Link>
          <Link href="/products" className="nav-link">Products</Link>
          <Link href="/contact" className="nav-link">Contact</Link>
        </div>
      )}
    </nav>
  );
      }
      
