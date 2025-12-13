"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function Navbar({ onOpenFilter, onOpenCategory }) {
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const [language, setLanguage] = useState("en");

  useEffect(() => {
    const savedDark = localStorage.getItem("dark-mode");
    const savedLang = localStorage.getItem("language");

    if (savedDark === "true") {
      setDark(true);
      document.documentElement.classList.add("dark");
    }

    if (savedLang) setLanguage(savedLang);
  }, []);

  function toggleDarkMode() {
    const newDark = !dark;
    setDark(newDark);
    localStorage.setItem("dark-mode", newDark);

    if (newDark) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }

  function changeLanguage(lang) {
    setLanguage(lang);
    localStorage.setItem("language", lang);
  }

  return (
    <nav
      style={{
        backgroundColor: dark ? "#000" : "#000D1A",
        padding: "6px 12px",
        height: "54px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        zIndex: 999,
      }}
    >
      {/* LOGO */}
      <Link href="/">
        <img
          src="/logo.png"
          alt="OodlesNet"
          style={{ height: "36px", cursor: "pointer" }}
        />
      </Link>

      {/* MENU BUTTON */}
      <div style={{ position: "relative" }}>
        <button
          onClick={() => setOpen(!open)}
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "10px",
            background: dark ? "#333" : "#00c3ff",
            border: "none",
            color: "white",
            fontSize: "22px",
          }}
        >
          ☰
        </button>

        {/* DROPDOWN */}
        {open && (
          <div
            style={{
              position: "absolute",
              top: "48px",
              right: 0,
              background: dark ? "#0e0e0e" : "#00172A",
              padding: "12px",
              borderRadius: "12px",
              boxShadow: "0 0 12px rgba(0,0,0,0.4)",
              minWidth: "170px",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            {/* HOME */}
            <Link href="/" style={{ color: "white" }}>
              Home
            </Link>

            {/* OPEN CATEGORY DRAWER */}
            <button
              onClick={() => {
                onOpenCategory();
                setOpen(false);
              }}
              style={{
                color: "white",
                background: "none",
                border: "none",
                textAlign: "left",
                fontSize: "15px",
                cursor: "pointer",
              }}
            >
              Categories
            </button>

            {/* OPEN FILTER DRAWER */}
            <button
              onClick={() => {
                onOpenFilter();
                setOpen(false);
              }}
              style={{
                color: "white",
                background: "none",
                border: "none",
                textAlign: "left",
                fontSize: "15px",
                cursor: "pointer",
              }}
            >
              Filters
            </button>

            {/* LANGUAGE */}
            <div style={{ color: "white" }}>
              <strong>Language</strong>
              <div style={{ marginTop: 6, display: "flex", gap: 10 }}>
                <button
                  onClick={() => changeLanguage("en")}
                  style={{
                    padding: "4px 10px",
                    borderRadius: "8px",
                    background: language === "en" ? "#00c3ff" : "#333",
                    border: "none",
                    color: "white",
                  }}
                >
                  English
                </button>

                <button
                  onClick={() => changeLanguage("hi")}
                  style={{
                    padding: "4px 10px",
                    borderRadius: "8px",
                    background: language === "hi" ? "#00c3ff" : "#333",
                    border: "none",
                    color: "white",
                  }}
                >
                  हिंदी
                </button>
              </div>
            </div>

            {/* DARK MODE */}
            <div style={{ color: "white" }}>
              <strong>Dark Mode</strong>
              <div
                onClick={toggleDarkMode}
                style={{
                  marginTop: 6,
                  width: "48px",
                  height: "26px",
                  borderRadius: "30px",
                  background: dark ? "#00c3ff" : "#555",
                  position: "relative",
                  cursor: "pointer",
                  transition: "0.3s",
                }}
              >
                <div
                  style={{
                    width: "22px",
                    height: "22px",
                    background: "white",
                    borderRadius: "50%",
                    position: "absolute",
                    top: "2px",
                    left: dark ? "24px" : "2px",
                    transition: "0.3s",
                  }}
                ></div>
              </div>
            </div>

            <Link href="/contact" style={{ color: "white" }}>
              Contact
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
        }
            
