"use client";

import { useEffect, useState } from "react";

export default function FilterDrawer({
  isOpen,
  onClose,
  products = [],
  initial = {},
  onApply,
}) {
  const prices = products.flatMap((p) =>
    p.store?.length ? p.store.map((s) => Number(s.price)) : []
  );

  const absoluteMax = prices.length ? Math.max(...prices) : 1000;

  const [min, setMin] = useState(initial.min ?? 0);
  const [max, setMax] = useState(initial.max ?? absoluteMax);
  const [sort, setSort] = useState(initial.sort ?? "none");

  useEffect(() => {
    setMin(initial.min ?? 0);
    setMax(initial.max ?? absoluteMax);
  }, [absoluteMax, initial.min, initial.max]);

  if (!isOpen) return null;

  function apply() {
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
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          background: "#fff",
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          padding: 20,
          animation: "slideUp .25s ease",
        }}
      >
        <h3 style={{ fontWeight: 700, color: "#0077b6" }}>Filters</h3>

        {/* PRICE */}
        <div style={{ marginTop: 16 }}>
          <label style={{ fontWeight: 600 }}>Price Range</label>

          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            <input
              type="number"
              value={min}
              onChange={(e) => setMin(Number(e.target.value))}
              style={{
                width: 110,
                height: 38,
                borderRadius: 10,
                border: "1px solid #ccc",
                padding: "0 10px",
              }}
            />

            <input
              type="number"
              value={max}
              onChange={(e) => setMax(Number(e.target.value))}
              style={{
                width: 110,
                height: 38,
                borderRadius: 10,
                border: "1px solid #ccc",
                padding: "0 10px",
              }}
            />
          </div>
        </div>

        {/* SORT */}
        <div style={{ marginTop: 18 }}>
          <label style={{ fontWeight: 600 }}>Sort By</label>

          <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
            <label><input type="radio" checked={sort === "none"} onChange={() => setSort("none")} /> None</label>
            <label><input type="radio" checked={sort === "price-asc"} onChange={() => setSort("price-asc")} /> Price Low → High</label>
            <label><input type="radio" checked={sort === "price-desc"} onChange={() => setSort("price-desc")} /> Price High → Low</label>
            <label><input type="radio" checked={sort === "trending"} onChange={() => setSort("trending")} /> Trending</label>
          </div>
        </div>

        {/* ACTIONS */}
        <div style={{ marginTop: 20, display: "flex", gap: 10 }}>
          <button
            onClick={apply}
            style={{
              flex: 1,
              height: 40,
              background: "linear-gradient(90deg,#0094ff,#00e0ff)",
              borderRadius: 12,
              color: "#fff",
              fontWeight: 700,
              border: "none",
            }}
          >
            Apply
          </button>

          <button
            onClick={onClose}
            style={{
              flex: 1,
              height: 40,
              background: "#eee",
              borderRadius: 12,
              fontWeight: 700,
              border: "none",
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
          
