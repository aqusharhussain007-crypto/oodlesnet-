"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const [lang, setLang] = useState("EN");

  /* DARK MODE */
  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [dark]);

  return (
    <nav
      style={{
        background: "#000D1A",
        height: 52,
        padding: "0 12px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        zIndex: 1000,
      }}
    >
      {/* LOGO */}
      <Link href="/">
        <img
          src="/logo.png"
          alt="OodlesNet"
          style={{ height: 34 }}
        />
      </Link>

      {/* MENU BUTTON */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: 40,
          height: 40,
          borderRadius: 10,
          background: "#00c6ff",
          border: "none",
          color: "white",
          fontSize: 22,
          cursor: "pointer",
        }}
      >
        ☰
      </button>

      {/* DROPDOWN */}
      {open && (
        <div
          style={{
            position: "absolute",
            top: 56,
            right: 12,
            background: "#00172A",
            borderRadius: 12,
            padding: 12,
            width: 180,
            boxShadow: "0 8px 20px rgba(0,0,0,0.4)",
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          <Link href="/" style={linkStyle}>Home</Link>

          {/* LANGUAGE */}
          <div
            onClick={() => setLang(lang === "EN" ? "HI" : "EN")}
            style={linkStyle}
          >
            Language: {lang}
          </div>

          {/* DARK MODE */}
          <div
            onClick={() => setDark(!dark)}
            style={linkStyle}
          >
            Dark Mode: {dark ? "ON" : "OFF"}
          </div>

          <Link href="/about" style={linkStyle}>About</Link>
          <Link href="/contact" style={linkStyle}>Contact</Link>
        </div>
      )}
    </nav>
  );
}

const linkStyle = {
  color: "white",
  fontWeight: 600,
  cursor: "pointer",
  textDecoration: "none",
};
    
