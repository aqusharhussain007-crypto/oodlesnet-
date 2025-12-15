"use client";

import { useState } from "react";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header
      style={{
        background: "linear-gradient(90deg,#020024,#090979,#00d4ff)",
        padding: "12px 14px",
        position: "relative",
        zIndex: 1000,
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
        <div
          style={{
            fontSize: 24,
            fontWeight: 900,
            color: "#00e5ff",
            letterSpacing: 0.5,
          }}
        >
          OodlesNet
        </div>

        {/* MENU BUTTON */}
        <button
          onClick={() => setOpen(!open)}
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: "#0bbcff",
            border: "none",
            color: "white",
            fontSize: 20,
          }}
        >
          ☰
        </button>
      </div>

      {/* DROPDOWN MENU */}
      {open && (
        <div
          style={{
            position: "absolute",
            top: 64,
            right: 14,
            background: "#111",
            borderRadius: 14,
            padding: 16,
            minWidth: 180,
            boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
          }}
        >
          <div style={{ color: "white", marginBottom: 12 }}>Home</div>

          <div style={{ color: "white", marginBottom: 12 }}>
            Language
            <div style={{ marginTop: 6, display: "flex", gap: 8 }}>
              <button className="btn-small">English</button>
              <button className="btn-small">हिंदी</button>
            </div>
          </div>

          <div style={{ color: "white", marginBottom: 12 }}>
            Dark Mode
          </div>

          <div style={{ color: "white" }}>Contact</div>
        </div>
      )}
    </header>
  );
}
