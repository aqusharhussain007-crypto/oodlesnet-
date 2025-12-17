"use client";

import { useState } from "react";

export default function FilterDrawer({ onClose }) {
  const [min, setMin] = useState("");
  const [max, setMax] = useState("");
  const [sort, setSort] = useState("none");

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

  const GRADIENT = "linear-gradient(135deg, #023e8a, #0096c7, #00b4a8)";

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.45)",
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
          borderTopLeftRadius: 26,
          borderTopRightRadius: 26,
          padding: 18,
          animation: "slideUp 0.25s ease",
          boxShadow: "0 -10px 30px rgba(0,0,0,0.2)",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 18,
          }}
        >
          <h3
            style={{
              fontWeight: 900,
              background: GRADIENT,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Filters
          </h3>
          <button
            onClick={onClose}
            style={{
              border: "none",
              background: "#f1f5f9",
              borderRadius: 12,
              padding: "6px 12px",
              fontWeight: 800,
            }}
          >
            ✕
          </button>
        </div>

        {/* Price */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontWeight: 800, marginBottom: 8 }}>
            Price Range
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <input
              placeholder="Min"
              value={min}
              onChange={(e) => setMin(e.target.value)}
              style={{
                flex: 1,
                padding: "10px 14px",
                borderRadius: 14,
                border: "2px solid transparent",
                background:
                  "linear-gradient(#fff, #fff) padding-box, " +
                  GRADIENT +
                  " border-box",
                fontWeight: 700,
              }}
            />
            <input
              placeholder="Max"
              value={max}
              onChange={(e) => setMax(e.target.value)}
              style={{
                flex: 1,
                padding: "10px 14px",
                borderRadius: 14,
                border: "2px solid transparent",
                background:
                  "linear-gradient(#fff, #fff) padding-box, " +
                  GRADIENT +
                  " border-box",
                fontWeight: 700,
              }}
            />
          </div>
        </div>

        {/* Store Chips */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontWeight: 800, marginBottom: 10 }}>
            Stores
          </div>
          <div
            style={{
              display: "flex",
              gap: 10,
              overflowX: "auto",
              paddingBottom: 6,
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
                    padding: "9px 16px",
                    borderRadius: 999,
                    border: "2px solid transparent",
                    background: active
                      ? GRADIENT
                      : "linear-gradient(#fff,#fff) padding-box, " +
                        GRADIENT +
                        " border-box",
                    color: active ? "#fff" : "#023e8a",
                    fontWeight: 800,
                    boxShadow: active
                      ? "0 4px 12px rgba(0,150,199,0.35)"
                      : "none",
                  }}
                >
                  {store}
                </button>
              );
            })}
          </div>
        </div>

        {/* Toggles */}
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

        {/* Sort */}
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

        {/* Actions */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 22,
          }}
        >
          <button onClick={onClose} className="btn-ghost">
            Cancel
          </button>

          <button
            onClick={onClose}
            style={{
              padding: "12px 20px",
              borderRadius: 16,
              border: "none",
              background: GRADIENT,
              color: "#fff",
              fontWeight: 900,
              boxShadow: "0 6px 18px rgba(0,150,199,0.45)",
            }}
          >
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
        
