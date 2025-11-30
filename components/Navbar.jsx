"use client";

import { useState } from "react";
import Link from "next/link";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav
      style={{
        width: "100%",
        background: "#07111f",
        padding: "18px 20px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        boxShadow: "0 0 20px rgba(0, 180, 255, 0.15)",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >
      {/* Brand Name */}
      <Link
        href="/"
        style={{
          fontSize: "1.8rem",
          fontWeight: "700",
          color: "#00b7ff",
          textDecoration: "none",
          letterSpacing: "1px",
        }}
      >
        OodlesNet
      </Link>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          background: "#00b7ff",
          border: "none",
          padding: "12px 16px",
          borderRadius: "12px",
          color: "white",
          fontSize: "1.3rem",
          boxShadow: "0 0 15px rgba(0, 183, 255, 0.6)",
        }}
      >
        ☰
      </button>

      {/* Dropdown Menu */}
      {open && (
        <div
          style={{
            position: "absolute",
            top: "70px",
            right: "20px",
            width: "180px",
            background: "#ffffff",
            borderRadius: "12px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
            padding: "10px 0",
            animation: "fadeIn 0.2s",
          }}
        >
          {/* MENU ITEMS */}
          <MenuItem href="/">Home</MenuItem>
          <MenuItem href="/products">Products</MenuItem>
          <MenuItem href="/about">About</MenuItem>
          <MenuItem href="/contact">Contact</MenuItem>
        </div>
      )}
    </nav>
  );
}

/* Reusable Menu Link Component */
function MenuItem({ href, children }) {
  return (
    <Link
      href={href}
      style={{
        display: "block",
        padding: "12px 20px",
        color: "#0b1220",
        fontSize: "1.05rem",
        textDecoration: "none",
        borderBottom: "1px solid #eee",
      }}
    >
      {children}
    </Link>
  );
}
