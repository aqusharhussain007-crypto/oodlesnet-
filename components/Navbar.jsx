"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const [language, setLanguage] = useState("en"); // en = English, hi = Hindi

  /* LOAD SETTINGS FROM LOCAL STORAGE */
  useEffect(() => {
    const savedDark = localStorage.getItem("dark-mode");
    const savedLang = localStorage.getItem("language");

    if (savedDark === "true") {
      setDark(true);
      document.documentElement.classList.add("dark");
    }

    if (savedLang) {
      setLanguage(savedLang);
    }
  }, []);

  /* TOGGLE DARK MODE */
  function toggleDarkMode() {
    const newDark = !dark;
    setDark(newDark);
    localStorage.setItem("dark-mode", newDark);

    if (newDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }

  /* CHANGE LANGUAGE */
  function changeLanguage(lang) {
    setLanguage(lang);
    localStorage.setItem("language", lang);
  }

  return (
    <nav
      style={{
        backgroundColor: dark ? "#000000" : "#000D1A",
        padding: "6px 12px",
        height: "54px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        zIndex: 999,
        transition: "0.3s ease",
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

      {/* HAMBURGER */}
      <div style={{ position: "relative" }}>
        <button
          onClick={() => setOpen(!open)}
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "10px",
            background: dark ? "#333" : "#00c3ff",
            border: "none",
            boxShadow: dark ? "0 0 12px #555" : "0 0 12px #00c3ff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            fontSize: "22px",
            color: dark ? "white" : "white",
            transition: "0.3s",
          }}
        >
          ☰
        </button>

        {/* DROPDOWN MENU */}
        {open && (
          <div
            style={{
              position: "absolute",
              top: "48px",
              right: 0,
              background: dark ? "#0e0e0e" : "#00172A",
              padding: "12px",
              borderRadius: "12px",
              boxShadow: "0 0 14px rgba(0,0,0,0.4)",
              minWidth: "170px",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              zIndex: 2000,
              transition: "0.3s",
            }}
          >
            {/* HOME */}
            <Link
              href="/"
              style={{ color: "white", fontSize: "15px" }}
              onClick={() => setOpen(false)}
            >
              Home
            </Link>

            {/* LANGUAGE SELECTOR */}
            <div style={{ color: "white", fontSize: "15px" }}>
              <strong>Language</strong>
              <div style={{ marginTop: 6, display: "flex", gap: 10 }}>
                <button
                  onClick={() => changeLanguage("en")}
                  style={{
                    padding: "4px 10px",
                    borderRadius: "8px",
                    background: language === "en" ? "#00c3ff" : "#333",
                    color: "white",
                    border: "none",
                    cursor: "pointer",
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
                    color: "white",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  हिंदी
                </button>
              </div>
            </div>

            {/* DARK MODE TOGGLE */}
            <div style={{ color: "white", fontSize: "15px" }}>
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

            {/* CONTACT */}
            <Link
              href="/contact"
              style={{ color: "white", fontSize: "15px" }}
              onClick={() => setOpen(false)}
            >
              Contact
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
  }
  
