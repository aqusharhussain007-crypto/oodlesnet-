"use client";

import { useState } from "react";

export default function FilterDrawer({ onClose, onApply }) {
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
  const GRADIENT = "linear-gradient(135deg,#023e8a,#0096c7,#00b4a8)";

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
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          padding: 14,
          animation: "slideUp 0.25s ease",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 12,
          }}
        >
          <h3
            style={{
              fontWeight: 900,
              fontSize: 18,
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
              borderRadius: 10,
              padding: "4px 10px",
              fontWeight: 800,
            }}
          >
            ✕
          </button>
        </div>

        {/* Price */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontWeight: 800, marginBottom: 6 }}>
            Price Range
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <input
              placeholder="Min"
              value={min}
              onChange={(e) => setMin(e.target.value)}
              style={{
                width: "48%",
                padding: "8px 12px",
                borderRadius: 12,
                border: "0.6px solid transparent",
                background:
                  "linear-gradient(#fff,#fff) padding-box," +
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
                width: "48%",
                padding: "8px 12px",
                borderRadius: 12,
                border: "0.6px solid transparent",
                background:
                  "linear-gradient(#fff,#fff) padding-box," +
                  GRADIENT +
                  " border-box",
                fontWeight: 700,
              }}
            />
          </div>
        </div>

        {/* Stores */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontWeight: 800, marginBottom: 8 }}>
            Stores
          </div>
          <div style={{ display: "flex", gap: 8, overflowX: "auto" }}>
            {STORE_LIST.map((store) => {
              const active = stores.includes(store);
              return (
                <button
                  key={store}
                  onClick={() => toggleStore(store)}
                  style={{
                    padding: "7px 14px",
                    borderRadius: 999,
                    border: "1px solid transparent",
                    background: active
                      ? GRADIENT
                      : "linear-gradient(#fff,#fff) padding-box," +
                        GRADIENT +
                        " border-box",
                    color: active ? "#fff" : "#023e8a",
                    fontWeight: 800,
                    fontSize: 13,
                  }}
                >
                  {store}
                </button>
              );
            })}
          </div>
        </div>

        {/* Toggles */}
        <div style={{ marginBottom: 10 }}>
          <label style={{ display: "flex", gap: 8, fontWeight: 700 }}>
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={() => setInStockOnly(!inStockOnly)}
            />
            In stock only
          </label>
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={{ display: "flex", gap: 8, fontWeight: 700 }}>
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
          ].map(([v, label]) => (
            <label
              key={v}
              style={{ display: "flex", gap: 8, marginBottom: 6 }}
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
            marginTop: 16,
          }}
        >
          <button onClick={onClose} className="btn-ghost">
            Cancel
          </button>

          <button
            onClick={() => {
              onApply({
                min,
                max,
                sort,
                stores,
                inStockOnly,
                discountOnly,
              });
              onClose();
            }}
            style={{
              padding: "10px 18px",
              borderRadius: 14,
              border: "none",
              background: GRADIENT,
              color: "#fff",
              fontWeight: 900,
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
            
