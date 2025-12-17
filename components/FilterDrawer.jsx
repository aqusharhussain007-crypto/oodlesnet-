"use client";

import { useState } from "react";

export default function FilterDrawer({ onClose }) {
  const [min, setMin] = useState("");
  const [max, setMax] = useState("");
  const [sort, setSort] = useState("none");

  // Store filter
  const [stores, setStores] = useState([]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [discountOnly, setDiscountOnly] = useState(false);

  const toggleStore = (store) => {
    setStores((prev) =>
      prev.includes(store)
        ? prev.filter((s) => s !== store)
        : [...prev, store]
    );
  };

  const STORE_LIST = ["Amazon", "Flipkart", "Meesho", "Croma", "Reliance"];

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.35)",
        zIndex: 1200,
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-end",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 600,
          background: "#fff",
          borderTopLeftRadius: 22,
          borderTopRightRadius: 22,
          padding: 18,
          animation: "slideUp 0.25s ease",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 14,
          }}
        >
          <h3 style={{ fontWeight: 800, color: "#0077b6" }}>
            Filters
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

        {/* Price (UNCHANGED) */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontWeight: 800, marginBottom: 6 }}>
            Price Range
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <input
              placeholder="Min"
              value={min}
              onChange={(e) => setMin(e.target.value)}
              className="pill-number"
            />
            <input
              placeholder="Max"
              value={max}
              onChange={(e) => setMax(e.target.value)}
              className="pill-number"
            />
          </div>
        </div>

        {/* ✅ Store Filter – Horizontal Chips */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontWeight: 800, marginBottom: 8 }}>
            Stores
          </div>

          <div
            style={{
              display: "flex",
              gap: 10,
              overflowX: "auto",
              paddingBottom: 4,
            }}
          >
            {STORE_LIST.map((store) => {
              const active = stores.includes(store);
              return (
                <button
                  key={store}
                  onClick={() => toggleStore(store)}
                  style={{
                    whiteSpace: "nowrap",
                    padding: "8px 14px",
                    borderRadius: 999,
                    border: active
                      ? "2px solid #0077b6"
                      : "2px solid #ddd",
                    background: active ? "#e6f4fb" : "#fff",
                    color: active ? "#0077b6" : "#333",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  {store}
                </button>
              );
            })}
          </div>
        </div>

        {/* Availability */}
        <div style={{ marginBottom: 16 }}>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              fontWeight: 700,
            }}
          >
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={() => setInStockOnly(!inStockOnly)}
            />
            In stock only
          </label>
        </div>

        {/* Discount */}
        <div style={{ marginBottom: 16 }}>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              fontWeight: 700,
            }}
          >
            <input
              type="checkbox"
              checked={discountOnly}
              onChange={() => setDiscountOnly(!discountOnly)}
            />
            Discounted only
          </label>
        </div>

        {/* Sort (UNCHANGED) */}
        <div>
          <div style={{ fontWeight: 800, marginBottom: 6 }}>
            Sort By
          </div>

          {[
            ["none", "None"],
            ["price-asc", "Price ↑"],
            ["price-desc", "Price ↓"],
            ["trending", "Trending"],
          ].map(([v, label]) => (
            <label
              key={v}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 8,
                fontWeight: 600,
              }}
            >
              <input
                type="radio"
                checked={sort === v}
                onChange={() => setSort(v)}
              />
              {label}
            </label>
          ))}
        </div>

        {/* Actions (UNCHANGED) */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 18,
          }}
        >
          <button onClick={onClose} className="btn-ghost">
            Cancel
          </button>

          <button onClick={onClose} className="btn-primary">
            Apply
          </button>
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
      
