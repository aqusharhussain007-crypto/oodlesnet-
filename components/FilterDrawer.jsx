"use client";

import { useEffect, useState } from "react";

export default function FilterDrawer({
  isOpen,
  onClose,
  products = [],
  initial = {},
  onApply,
}) {
  const prices = products.map((p) => Number(p.price || 0)).filter(Boolean);
  const absoluteMin = prices.length ? Math.min(...prices) : 0;
  const absoluteMax = prices.length ? Math.max(...prices) : 10000;

  const [selMin, setSelMin] = useState(initial.min ?? absoluteMin);
  const [selMax, setSelMax] = useState(initial.max ?? absoluteMax);
  const [sort, setSort] = useState(initial.sort ?? "none");
  const [discountOnly, setDiscountOnly] = useState(initial.discountOnly ?? false);

  useEffect(() => {
    setSelMin(initial.min ?? absoluteMin);
    setSelMax(initial.max ?? absoluteMax);
  }, [absoluteMin, absoluteMax]);

  function handleReset() {
    setSelMin(absoluteMin);
    setSelMax(absoluteMax);
    setSort("none");
    setDiscountOnly(false);
  }

  function handleApply() {
    onApply({
      min: Number(selMin),
      max: Number(selMax),
      sort,
      discountOnly,
    });
    onClose();
  }

  if (!isOpen) return null;

  return (
    <div
      className="filter-drawer-backdrop"
      onClick={(e) => {
        if (e.target.className === "filter-drawer-backdrop") onClose();
      }}
    >
      <div className="filter-drawer">

        {/* HEADER */}
        <div className="filter-header" style={{ display: "flex", justifyContent: "space-between" }}>
          <h3 style={{ fontSize: 20, color: "#0bbcff" }}>Filters</h3>

          {/* ⭐ NEW CLOSE BUTTON */}
          <button
            onClick={onClose}
            style={{
              padding: "6px 14px",
              background: "#eef9ff",
              borderRadius: 20,
              border: "1px solid #c9eaff",
              color: "#0077aa",
              fontWeight: 700,
            }}
          >
            Close ✕
          </button>
        </div>

        {/* PRICE RANGE */}
        <div className="filter-section">
          <label className="filter-label">Price range</label>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div>₹ {selMin}</div>
            <input
              type="range"
              min={absoluteMin}
              max={absoluteMax}
              value={selMin}
              onChange={(e) =>
                setSelMin(Math.min(Number(e.target.value), selMax))
              }
            />
            <div>₹ {selMax}</div>
          </div>

          <input
            type="range"
            min={absoluteMin}
            max={absoluteMax}
            value={selMax}
            onChange={(e) =>
              setSelMax(Math.max(Number(e.target.value), selMin))
            }
          />

          {/* ⭐ NEW PILL INPUT BOXES */}
          <div style={{ display: "flex", gap: 16, marginTop: 12 }}>
            <input
              type="number"
              value={selMin}
              onChange={(e) => setSelMin(Math.min(Number(e.target.value), selMax))}
              style={{
                flex: 1,
                padding: "10px 14px",
                borderRadius: 50,
                border: "2px solid #0bbcff",
                fontWeight: 600,
                textAlign: "center",
              }}
            />

            <input
              type="number"
              value={selMax}
              onChange={(e) => setSelMax(Math.max(Number(e.target.value), selMin))}
              style={{
                flex: 1,
                padding: "10px 14px",
                borderRadius: 50,
                border: "2px solid #0bbcff",
                fontWeight: 600,
                textAlign: "center",
              }}
            />
          </div>
        </div>

        {/* SORT */}
        <div className="filter-section">
          <label className="filter-label">Sort by</label>
          <div className="filter-row">
            <label className="radio"><input type="radio" checked={sort==="none"} onChange={()=>setSort("none")} />None</label>
            <label className="radio"><input type="radio" checked={sort==="price-asc"} onChange={()=>setSort("price-asc")} />Price: Low → High</label>
            <label className="radio"><input type="radio" checked={sort==="price-desc"} onChange={()=>setSort("price-desc")} />Price: High → Low</label>
            <label className="radio"><input type="radio" checked={sort==="trending"} onChange={()=>setSort("trending")} />Trending</label>
            <label className="radio"><input type="radio" checked={sort==="newest"} onChange={()=>setSort("newest")} />Newest</label>
          </div>
        </div>

        {/* DISCOUNT */}
        <div className="filter-section">
          <label className="filter-label">Discount</label>
          <label style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <input
              type="checkbox"
              checked={discountOnly}
              onChange={(e) => setDiscountOnly(e.target.checked)}
            />
            Show discounted items only
          </label>
        </div>

        {/* FOOTER BUTTONS */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 20,
          }}
        >
          {/* ⭐ RESET button */}
          <button
            onClick={handleReset}
            style={{
              fontWeight: 700,
              color: "#0077aa",
              background: "transparent",
              border: "none",
            }}
          >
            Reset
          </button>

          {/* APPLY BUTTON */}
          <button
            onClick={handleApply}
            className="btn-primary"
            style={{
              padding: "10px 26px",
              borderRadius: 12,
              background: "linear-gradient(90deg,#00c6ff,#00ff99)",
              color: "#003",
              fontWeight: 800,
              border: "none",
            }}
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}
