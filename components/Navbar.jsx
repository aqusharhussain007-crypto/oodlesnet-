"use client";

import { useState } from "react";

export default function Navbar() {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <header
      style={{
        background: "linear-gradient(90deg,#020024,#020024,#020024)",
        padding: "10px 12px",
      }}
    >
      {/* TOP ROW */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            fontSize: 22,
            fontWeight: 900,
            color: "#00e5ff",
          }}
        >
          OodlesNet
        </div>

        <button
          onClick={() => setShowMenu(!showMenu)}
          style={{
            width: 42,
            height: 42,
            borderRadius: 10,
            background: "#0bbcff",
            color: "white",
            fontSize: 20,
            border: "none",
          }}
        >
          ☰
        </button>
      </div>

      {/* SEARCH BAR */}
      <div style={{ marginTop: 10 }}>
        <input
          placeholder="Search products..."
          className="search-bar compact"
        />
      </div>

      {/* CATEGORY + FILTER (⬅️ MOVED HERE) */}
      <div
        style={{
          display: "flex",
          gap: 10,
          marginTop: 10,
        }}
      >
        <button
          style={{
            flex: 1,
            padding: "12px",
            borderRadius: 14,
            fontWeight: 800,
            color: "white",
            background: "linear-gradient(90deg,#00c6ff,#00ff99)",
            border: "none",
          }}
        >
          Categories
        </button>

        <button
          style={{
            flex: 1,
            padding: "12px",
            borderRadius: 14,
            fontWeight: 800,
            color: "white",
            background: "linear-gradient(90deg,#00c6ff,#00ff99)",
            border: "none",
          }}
        >
          Filters
        </button>
      </div>

      {/* MENU */}
      {showMenu && (
        <div
          style={{
            position: "absolute",
            right: 12,
            top: 60,
            background: "#111",
            padding: 16,
            borderRadius: 14,
            color: "white",
            zIndex: 2000,
          }}
        >
          <div style={{ marginBottom: 10 }}>Home</div>
          <div style={{ marginBottom: 10 }}>Contact</div>
          <div>Dark Mode</div>
        </div>
      )}
    </header>
  );
}
