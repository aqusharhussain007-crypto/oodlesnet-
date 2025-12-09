"use client";

import { useState, useEffect } from "react";

export default function FilterDrawer({
  isOpen,
  onClose,
  products = [],
  initial = {},
  onApply,
}) {
  if (!isOpen) return null;

  // Calculate absolute min/max
  const prices = products.map((p) => Number(p.price || 0)).filter(Boolean);
  const absoluteMin = prices.length ? Math.min(...prices) : 0;
  const absoluteMax = prices.length ? Math.max(...prices) : 10000;

  const [selMin, setSelMin] = useState(initial.min ?? absoluteMin);
  const [selMax, setSelMax] = useState(initial.max ?? absoluteMax);
  const [sort, setSort] = useState(initial.sort ?? "none");
  const [discountOnly, setDiscountOnly] = useState(initial.discountOnly ?? false);

  // Reset to defaults
  function resetAll() {
    setSelMin(absoluteMin);
    setSelMax(absoluteMax);
    setSort("none");
    setDiscountOnly(false);
  }

  function applyNow() {
    onApply({
      min: selMin,
      max: selMax,
      sort,
      discountOnly,
    });
    onClose();
  }

  return (
    <div
      className="filter-drawer-backdrop"
      onClick={(e) => {
        if (e.target.className === "filter-drawer-backdrop") onClose();
      }}
    >
      <div className="filter-drawer">

        {/* ---------- HEADER ---------- */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 10,
          }}
        >
          <h2 style={{ color: "#00aaff", fontSize: 22, fontWeight: 700 }}>Filters</h2>

          {/* Modern close pill */}
          <button
            onClick={onClose}
            style={{
              padding: "8px 18px",
              fontWeight: 700,
              borderRadius: 30,
              border: "2px solid #00c3ff",
              background: "#f4fcff",
              color: "#0077aa",
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 15,
            }}
          >
            Close
            <svg width="16" height="16" stroke="#0077aa" viewBox="0 0 24 24">
              <path d="M6 6l12 12M18 6L6 18" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* ---------- PRICE RANGE ---------- */}
        <label style={{ fontWeight: 700, marginTop: 10, display: "block" }}>
          Price range
        </label>

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
          <span>₹ {absoluteMin}</span>
          <span>₹ {absoluteMax}</span>
        </div>

        {/* MIN Slider */}
        <input
          type="range"
          min={absoluteMin}
          max={absoluteMax}
          value={selMin}
          onChange={(e) => setSelMin(Math.min(Number(e.target.value), selMax))}
          style={{ width: "100%", marginTop: 8 }}
        />

        {/* MAX Slider */}
        <input
          type="range"
          min={absoluteMin}
          max={absoluteMax}
          value={selMax}
          onChange={(e) => setSelMax(Math.max(Number(e.target.value), selMin))}
          style={{ width: "100%", marginTop: 6 }}
        />

        {/* ---------- NUMBER INPUT PILL BOXES ---------- */}
        <div
          style={{
            display: "flex",
            gap: 14,
            marginTop: 16,
            justifyContent: "center",
          }}
        >
          {/* MIN PILL */}
          <input
            type="number"
            value={selMin}
            onChange={(e) =>
              setSelMin(Math.min(Number(e.target.value || 0), selMax))
            }
            style={{
              width: 110,
              padding: "10px 14px",
              borderRadius: 40,
              border: "2px solid #00c3ff",
              fontWeight: 700,
              textAlign: "center",
              background: "#f4feff",
              fontSize: 17,
              color: "#0077aa",
            }}
          />

          {/* MAX PILL */}
          <input
            type="number"
            value={selMax}
            onChange={(e) =>
              setSelMax(Math.max(Number(e.target.value || 0), selMin))
            }
            style={{
              width: 110,
              padding: "10px 14px",
              borderRadius: 40,
              border: "2px solid #00c3ff",
              fontWeight: 700,
              textAlign: "center",
              background: "#f4feff",
              fontSize: 17,
              color: "#0077aa",
            }}
          />
        </div>

        {/* ---------- SORT BY ---------- */}
        <label style={{ fontWeight: 700, marginTop: 22, display: "block" }}>
          Sort by
        </label>

        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 6 }}>
          <label><input type="radio" checked={sort === "none"} onChange={() => setSort("none")} /> None</label>
          <label><input type="radio" checked={sort === "price-asc"} onChange={() => setSort("price-asc")} /> Price: Low → High</label>
          <label><input type="radio" checked={sort === "price-desc"} onChange={() => setSort("price-desc")} /> Price: High → Low</label>
          <label><input type="radio" checked={sort === "trending"} onChange={() => setSort("trending")} /> Trending</label>
          <label><input type="radio" checked={sort === "newest"} onChange={() => setSort("newest")} /> Newest</label>
        </div>

        {/* ---------- DISCOUNT ---------- */}
        <label style={{ fontWeight: 700, marginTop: 22, display: "block" }}>
          Discount
        </label>

        <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
          <input
            type="checkbox"
            checked={discountOnly}
            onChange={(e) => setDiscountOnly(e.target.checked)}
          />
          Show discounted items only
        </label>

        {/* ---------- RESET + APPLY ---------- */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 26,
          }}
        >
          <button
            onClick={resetAll}
            style={{
              background: "transparent",
              border: "none",
              color: "#0077cc",
              fontWeight: 800,
              fontSize: 16,
            }}
          >
            Reset
          </button>

          <button
            onClick={applyNow}
            style={{
              padding: "12px 26px",
              borderRadius: 14,
              border: "none",
              background: "linear-gradient(90deg,#00c6ff,#00ff99)",
              color: "#002a33",
              fontWeight: 800,
              fontSize: 16,
              boxShadow: "0 6px 16px rgba(0,200,255,0.2)",
            }}
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
          }
