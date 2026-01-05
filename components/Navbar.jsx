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

  function shareApp() {
    if (navigator.share) {
      navigator.share({
        title: "Oodlesnet",
        text: "Compare prices smarter on Oodlesnet",
        url: window.location.origin,
      });
    }
  }

  return (
    <>
      <header
        style={{
          height: 54,
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
            alt="Oodlesnet"
            width={170}
            height={56}
            style={{ maxHeight: 45, width: "auto" }}
            priority
          />
        </Link>

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

      {open && (
        <div
          style={{
            position: "fixed",
            top: 66,
            right: 14,
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
            Oodlesnet Menu
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Link href="/" onClick={() => setOpen(false)}>Home</Link>
            <Link href="/about" onClick={() => setOpen(false)}>About</Link>
            <Link href="/contact" onClick={() => setOpen(false)}>Contact</Link>

            {/* CATEGORY */}
            <button
              onClick={() => {
                setOpen(false);
                window.dispatchEvent(new Event("open-category"));
              }}
              style={{ background: "none", border: "none", color: "inherit", textAlign: "left" }}
            >
              Categories →
            </button>

            {/* FILTER */}
            <button
              onClick={() => {
                setOpen(false);
                window.dispatchEvent(new Event("open-filter"));
              }}
              style={{ background: "none", border: "none", color: "inherit", textAlign: "left" }}
            >
              Filters →
            </button>

            {/* SHARE */}
            <button
              onClick={shareApp}
              style={{
                background: "none",
                border: "none",
                color: "inherit",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <path d="M8.6 13.5l6.8 3.9M15.4 6.6L8.6 10.5" />
              </svg>
              Share
            </button>
          </div>

          <div
            style={{
              marginTop: 20,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span style={{ opacity: 0.85 }}>Dark Mode</span>
            <button
              onClick={toggleDark}
              style={{
                width: 52,
                height: 28,
                borderRadius: 999,
                border: "none",
                padding: 3,
                background: dark
                  ? "linear-gradient(135deg,#0ea5e9,#10b981)"
                  : "#020617",
                display: "flex",
                justifyContent: dark ? "flex-end" : "flex-start",
              }}
            >
              <span
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  background: "#fff",
                }}
              />
            </button>
          </div>
        </div>
      )}
    </>
  );
        }
    
