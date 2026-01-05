"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase-app";
import { collection, getDocs } from "firebase/firestore";

export default function CategoryDrawer({
  active = "all",
  onSelect,
  onClose,
}) {
  const [categories, setCategories] = useState([
    { slug: "all", name: "All" },
  ]);

  useEffect(() => {
    async function loadCategories() {
      const snap = await getDocs(collection(db, "categories"));
      const items = snap.docs.map((d) => d.data());

      setCategories([
        { slug: "all", name: "All" },
        ...items.map((c) => ({
          slug: c.slug,
          name: c.name,
        })),
      ]);
    }
    loadCategories();
  }, []);

  return (
    <div
      className="category-drawer-backdrop"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.35)",
        zIndex: 1200,
        display: "flex",
        justifyContent: "flex-end",   // ✅ move drawer to right
        alignItems: "flex-end",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "82%",               // ✅ reduced width
          maxWidth: 420,
          background: "#fff",
          borderTopLeftRadius: 22,
          borderTopRightRadius: 0,
          padding: 18,
          animation: "slideUp 0.25s ease",
        }}
      >
        {/* Header (UNCHANGED) */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 12,
          }}
        >
          <h3 style={{ fontWeight: 800, color: "#0077b6" }}>
            Categories
          </h3>
          <button
            onClick={onClose}
            style={{
              border: "none",
              background: "#eee",
              borderRadius: 10,
              padding: "6px 10px",
              fontWeight: 700,
            }}
          >
            ✕
          </button>
        </div>

        {/* SINGLE COLUMN + SCROLL (UNCHANGED LOGIC) */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 10,
            maxHeight: "65vh",
            overflowY: "auto",
          }}
        >
          {categories.map((c) => (
            <button
              key={c.slug}
              onClick={() => onSelect(c.slug)}
              style={{
                width: "100%",        // fills drawer, not screen
                padding: "12px 14px", // ✅ tighter padding
                borderRadius: 14,
                border:
                  active === c.slug
                    ? "2px solid #00c6ff"
                    : "1px solid #ddd",
                background:
                  active === c.slug
                    ? "linear-gradient(90deg,#eafffb,#e9fff0)"
                    : "#fff",
                fontWeight: 700,
                color: "#0077aa",
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
        }
