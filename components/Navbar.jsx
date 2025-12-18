"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("darkMode");
    if (saved === "true") {
      document.documentElement.classList.add("dark");
      setDark(true);
    }
  }, []);

  function toggleDark() {
    const next = !dark;
    setDark(next);

    if (next) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("darkMode", "true");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("darkMode", "false");
    }
  }

  return (
    <>
      {/* NAVBAR */}
      <header
        style={{
          height: 56,
          padding: "0 14px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "linear-gradient(90deg,#021526,#041f3a)",
          position: "sticky",
          top: 0,
          zIndex: 2000,
        }}
      >
        <Link href="/">
          <Image
            src="/logo.png"
            alt="OodlesNet"
            width={140}
            height={32}
            priority
          />
        </Link>

        {/* MENU BUTTON */}
        <button
          onClick={() => setOpen((v) => !v)}
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: "linear-gradient(135deg,#0ea5e9,#10b981)",
            border: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
            <path d="M3 6h18v2H3V6zm0 5h18v2H3v-2zm0 5h18v2H3v-2z" />
          </svg>
        </button>
      </header>

      {/* BACKDROP */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            zIndex: 2100,
          }}
        />
      )}

      {/* MENU PANEL – RIGHT ANCHORED */}
      {open && (
        <div
          style={{
            position: "fixed",
            top: 66,              // 👈 below navbar
            right: 14,            // 👈 aligned with button
            width: "60%",
            maxWidth: 300,
            padding: 20,
            borderRadius: 20,
            background: "linear-gradient(180deg,#041f3a,#052a4f)",
            color: "#e6f7ff",
            zIndex: 2200,
            boxShadow: "0 20px 60px rgba(0,0,0,0.45)",
          }}
        >
          <h3
            style={{
              fontSize: 20,
              fontWeight: 800,
              marginBottom: 16,
              color: "#7dd3fc",
            }}
          >
            OodlesNet Menu
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Link href="/" onClick={() => setOpen(false)}>Home</Link>
            <Link href="/about" onClick={() => setOpen(false)}>About</Link>
            <Link href="/contact" onClick={() => setOpen(false)}>Contact</Link>
          </div>

          <div style={{ marginTop: 20 }}>
            <div style={{ fontSize: 14, opacity: 0.8 }}>Language</div>
            <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
              <button
                style={{
                  flex: 1,
                  padding: "8px 0",
                  borderRadius: 10,
                  background: "#0ea5e9",
                  color: "white",
                  border: "none",
                  fontWeight: 700,
                }}
              >
                English
              </button>
              <button
                style={{
                  flex: 1,
                  padding: "8px 0",
                  borderRadius: 10,
                  background: "#020617",
                  color: "white",
                  border: "1px solid #1e293b",
                  fontWeight: 700,
                }}
              >
                हिंदी
              </button>
            </div>
          </div>

          <div
            style={{
              marginTop: 18,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span style={{ opacity: 0.85 }}>Dark Mode</span>
            <input type="checkbox" checked={dark} onChange={toggleDark} />
          </div>

          <div
            style={{
              textAlign: "center",
              marginTop: 18,
              fontSize: 12,
              opacity: 0.6,
            }}
          >
            © OodlesNet
          </div>
        </div>
      )}
    </>
  );
}
