"use client";

import { useState } from "react";
import Link from "next/link";

export default function Navbar({ openCategory, openFilter }) {
  const [open, setOpen] = useState(false);

  return (
    <nav
      style={{
        backgroundColor: "#000D1A",
        padding: "4px 12px",
        height: "50px",
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
          style={{ height: "34px", cursor: "pointer" }}
        />
      </Link>

      {/* Hamburger */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: "40px",
          height: "40px",
          borderRadius: "10px",
          background: "#00c3ff",
          border: "none",
          boxShadow: "0 0 12px #00c3ff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          fontSize: "22px",
          color: "white",
        }}
      >
        ☰
      </button>

      {/* Menu */}
      {open && (
        <div
          style={{
            position: "absolute",
            top: "50px",
            right: "12px",
            background: "#00172A",
            borderRadius: "10px",
            padding: "14px",
            boxShadow: "0 0 12px rgba(0,255,255,0.3)",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            zIndex: 200,
            width: "160px",
          }}
        >
          <button
            className="nav-link"
            onClick={() => {
              openCategory();
              setOpen(false);
            }}
            style={{ color: "white", textAlign: "left" }}
          >
            Categories
          </button>

          <button
            className="nav-link"
            onClick={() => {
              openFilter();
              setOpen(false);
            }}
            style={{ color: "white", textAlign: "left" }}
          >
            Filters
          </button>

          <Link href="/contact" className="nav-link" style={{ color: "white" }}>
            Contact
          </Link>
        </div>
      )}
    </nav>
  );
            }
              
