"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const [lang, setLang] = useState("en");

  /* ---------- DARK MODE ---------- */
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
        background: "#020617",
        padding: "6px 14px",
        height: 52,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        zIndex: 2000,
        boxShadow: "0 4px 14px rgba(0,0,0,0.35)",
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

      {/* HAMBURGER */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: 40,
          height: 40,
          borderRadius: 12,
          background:
            "linear-gradient(135deg,#0f4c81,#0bbcff)",
          border: "none",
          color: "#fff",
          fontSize: 22,
          fontWeight: 700,
          boxShadow: "0 6px 18px rgba(15,76,129,0.6)",
        }}
      >
        ☰
      </button>

      {/* MENU DRAWER */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.55)",
            zIndex: 3000,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "absolute",
              top: 60,
              right: 12,
              width: 260,
              background: "#020617",
              borderRadius: 18,
              padding: 16,
              boxShadow: "0 10px 30px rgba(0,0,0,0.6)",
              display: "flex",
              flexDirection: "column",
              gap: 14,
            }}
          >
            {/* HEADER */}
            <div style={{ color: "#7dd3fc", fontWeight: 800 }}>
              OodlesNet Menu
            </div>

            {/* LINKS */}
            <Link className="nav-link" href="/">Home</Link>
            <Link className="nav-link" href="/about">About</Link>
            <Link className="nav-link" href="/contact">Contact</Link>

            {/* LANGUAGE */}
            <div style={{ marginTop: 8 }}>
              <div style={{ color: "#94a3b8", fontSize: 13 }}>
                Language
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                <button
                  onClick={() => setLang("en")}
                  style={{
                    flex: 1,
                    padding: "6px 0",
                    borderRadius: 10,
                    border: "none",
                    fontWeight: 700,
                    background:
                      lang === "en"
                        ? "linear-gradient(90deg,#0bbcff,#22d3ee)"
                        : "#020617",
                    color: "#fff",
                    borderColor: "#0bbcff",
                  }}
                >
                  English
                </button>
                <button
                  onClick={() => setLang("hi")}
                  style={{
                    flex: 1,
                    padding: "6px 0",
                    borderRadius: 10,
                    border: "none",
                    fontWeight: 700,
                    background:
                      lang === "hi"
                        ? "linear-gradient(90deg,#0bbcff,#22d3ee)"
                        : "#020617",
                    color: "#fff",
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
                marginTop: 6,
              }}
            >
              <span style={{ color: "#94a3b8" }}>Dark Mode</span>
              <input
                type="checkbox"
                checked={dark}
                onChange={() => setDark(!dark)}
              />
            </div>

            {/* FOOTER */}
            <div
              style={{
                marginTop: 12,
                fontSize: 12,
                color: "#64748b",
                textAlign: "center",
              }}
            >
              © OodlesNet
            </div>
          </div>
        </div>
      )}
    </nav>
  );
        }
      
