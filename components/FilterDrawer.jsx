"use client";

import { useEffect, useState } from "react";

export default function FilterDrawer({
  isOpen,
  onClose,
  products = [],
  initial = {},
  onApply,
}) {
  const storePrices = products.flatMap((p) =>
    p.store?.length ? p.store.map((s) => Number(s.price)) : []
  );

  const absoluteMax = storePrices.length ? Math.max(...storePrices) : 1000;

  const [min, setMin] = useState(initial.min ?? 0);
  const [max, setMax] = useState(initial.max ?? absoluteMax);
  const [sort, setSort] = useState(initial.sort ?? "none");

  useEffect(() => {
    setMin(0);
    setMax(absoluteMax);
  }, [absoluteMax]);

  if (!isOpen) return null;

  function applyFilter() {
    onApply({ min, max, sort });
    onClose();
  }

  return (
    <div
      className="filter-drawer-backdrop"
      onClick={(e) => {
        if (e.target.classList.contains("filter-drawer-backdrop")) onClose();
      }}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.4)",
        zIndex: 999,
      }}
    >
      <div
        className="filter-drawer"
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          background: "#ffffff",
          borderTopLeftRadius: "20px",
          borderTopRightRadius: "20px",
          padding: "20px",
          animation: "slideUp 0.25s ease",
        }}
      >
        <h3 style={{ fontWeight: 700, color: "#0077b6" }}>Filters</h3>

        {/* PRICE RANGE */}
        <div style={{ marginTop: 16 }}>
          <label style={{ fontWeight: 600 }}>Price Range</label>

          <div style={{ display: "flex", gap: 12, marginTop: 10 }}>
            <input
              type="number"
              value={min}
              onChange={(e) => setMin(Number(e.target.value))}
              style={{
                flex: 1,
                padding: "8px",
                borderRadius: "10px",
                border: "1px solid #ccc",
              }}
            />

            <input
              type="number"
              value={max}
              onChange={(e) => setMax(Number(e.target.value))}
              style={{
                flex: 1,
                padding: "8px",
                borderRadius: "10px",
                border: "1px solid #ccc",
              }}
            />
          </div>
        </div>

        {/* SORT OPTIONS */}
        <div style={{ marginTop: 20 }}>
          <label style={{ fontWeight: 600 }}>Sort By</label>

          <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
            <label><input type="radio" checked={sort === "none"} onChange={() => setSort("none")} /> None</label>
            <label><input type="radio" checked={sort === "price-asc"} onChange={() => setSort("price-asc")} /> Price Low → High</label>
            <label><input type="radio" checked={sort === "price-desc"} onChange={() => setSort("price-desc")} /> Price High → Low</label>
            <label><input type="radio" checked={sort === "trending"} onChange={() => setSort("trending")} /> Trending</label>
          </div>
        </div>

        {/* BUTTONS */}
        <div style={{ marginTop: 20, display: "flex", gap: 10 }}>
          <button
            onClick={applyFilter}
            style={{
              flex: 1,
              background: "linear-gradient(90deg,#0094ff,#00e0ff)",
              padding: "10px",
              borderRadius: "12px",
              color: "white",
              fontWeight: 700,
            }}
          >
            Apply
          </button>

          <button
            onClick={onClose}
            style={{
              flex: 1,
              background: "#eee",
              padding: "10px",
              borderRadius: "12px",
              fontWeight: 700,
            }}
          >
            Cancel
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
          
