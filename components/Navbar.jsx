"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

import CategoryDrawer from "./CategoryDrawer";
import FilterDrawer from "./FilterDrawer";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const [showCategory, setShowCategory] = useState(false);
  const [showFilter, setShowFilter] = useState(false);

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

  const Arrow = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 18l6-6-6-6" />
    </svg>
  );

  return (
    <>
      {/* NAVBAR */}
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

      {/* MENU PANEL */}
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
                setShowCategory(true);
              }}
              style={{ background: "none", border: "none", color: "inherit", display: "flex", justifyContent: "space-between", alignItems: "center" }}
            >
              Categories <Arrow />
            </button>

            {/* FILTER */}
            <button
              onClick={() => {
                setOpen(false);
                setShowFilter(true);
              }}
              style={{ background: "none", border: "none", color: "inherit", display: "flex", justifyContent: "space-between", alignItems: "center" }}
            >
              Filters <Arrow />
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

          {/* DARK MODE */}
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

      {/* DRAWERS */}
      {showCategory && <CategoryDrawer onClose={() => setShowCategory(false)} />}
      {showFilter && (
        <FilterDrawer
          onClose={() => setShowFilter(false)}
          onApply={() => {}}
        />
      )}
    </>
  );
}
