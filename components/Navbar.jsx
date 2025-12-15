"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const [lang, setLang] = useState("en");

  /* ---------------- DARK MODE ---------------- */
  useEffect(() => {
    const saved = localStorage.getItem("dark");
    if (saved === "true") {
      document.documentElement.classList.add("dark");
      setDark(true);
    }
  }, []);

  function toggleDark() {
    const next = !dark;
    setDark(next);
    localStorage.setItem("dark", String(next));
    document.documentElement.classList.toggle("dark", next);
  }

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 3000,
        background: "linear-gradient(90deg,#020024,#090979,#00d4ff)",
        padding: "12px 14px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* LOGO */}
        <Link href="/" style={{ textDecoration: "none" }}>
          <div
            style={{
              fontSize: 22,
              fontWeight: 900,
              color: "#00e5ff",
              textShadow: "0 0 12px rgba(0,229,255,0.8)",
            }}
          >
            OodlesNet
          </div>
        </Link>

        {/* MENU BUTTON */}
        <button
          onClick={() => setOpen(!open)}
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: "#0bbcff",
            border: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg width="24" height="24" fill="white" viewBox="0 0 24 24">
            <path d="M3 6h18v2H3V6zm0 5h18v2H3v-2zm0 5h18v2H3v-2z" />
          </svg>
        </button>
      </div>

      {/* DROPDOWN */}
      {open && (
        <div
          style={{
            position: "absolute",
            right: 12,
            top: 64,
            width: 220,
            background: "#111",
            borderRadius: 16,
            padding: 14,
            boxShadow: "0 20px 40px rgba(0,0,0,0.6)",
            color: "white",
          }}
        >
          <Link
            href="/"
            onClick={() => setOpen(false)}
            style={{
              display: "block",
              padding: "10px 8px",
              fontWeight: 700,
              color: "white",
              textDecoration: "none",
            }}
          >
            Home
          </Link>

          {/* LANGUAGE */}
          <div style={{ marginTop: 10 }}>
            <div style={{ fontWeight: 800, marginBottom: 6 }}>Language</div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => setLang("en")}
                style={{
                  flex: 1,
                  padding: 8,
                  borderRadius: 10,
                  background: lang === "en" ? "#00c6ff" : "#333",
                  color: "white",
                  border: "none",
                  fontWeight: 700,
                }}
              >
                English
              </button>
              <button
                onClick={() => setLang("hi")}
                style={{
                  flex: 1,
                  padding: 8,
                  borderRadius: 10,
                  background: lang === "hi" ? "#00c6ff" : "#333",
                  color: "white",
                  border: "none",
                  fontWeight: 700,
                }}
              >
                हिंदी
              </button>
            </div>
          </div>

          {/* DARK MODE */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: 14,
            }}
          >
            <span style={{ fontWeight: 800 }}>Dark Mode</span>
            <button
              onClick={toggleDark}
              style={{
                width: 46,
                height: 26,
                borderRadius: 20,
                background: dark ? "#00c6ff" : "#555",
                border: "none",
                position: "relative",
              }}
            >
              <span
                style={{
                  position: "absolute",
                  top: 3,
                  left: dark ? 24 : 4,
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  background: "white",
                  transition: "0.2s",
                }}
              />
            </button>
          </div>

          {/* CONTACT */}
          <div style={{ marginTop: 14 }}>
            <a
              href="mailto:contact@oodlesnet.com"
              style={{
                display: "block",
                padding: "10px 8px",
                fontWeight: 700,
                color: "white",
                textDecoration: "none",
              }}
            >
              Contact
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
  
