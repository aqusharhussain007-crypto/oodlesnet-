"use client";

import { useEffect, useState } from "react";

export default function FilterDrawer({
  isOpen,
  onClose,
  products = [],
  initial = {},
  onApply,
}) {
  /* ------------------ GET LOWEST & HIGHEST STORE PRICE ------------------ */

  const getLowest = (p) =>
    p.store && p.store.length
      ? Math.min(...p.store.map((s) => Number(s.price)))
      : Infinity;

  const getHighest = (p) =>
    p.store && p.store.length
      ? Math.max(...p.store.map((s) => Number(s.price)))
      : 0;

  // Find global max price across ALL stores
  const globalMax = products.length
    ? Math.max(...products.map((p) => getHighest(p)))
    : 1000;

  const absoluteMin = 0;
  const absoluteMax = globalMax;

  /* ------------------ STATES ------------------ */

  const [selMin, setSelMin] = useState(initial.min ?? absoluteMin);
  const [selMax, setSelMax] = useState(initial.max ?? absoluteMax);
  const [sort, setSort] = useState(initial.sort ?? "none");
  const [discountOnly, setDiscountOnly] = useState(
    initial.discountOnly ?? false
  );

  /* ------------------ SYNC WHEN PRODUCTS UPDATE ------------------ */
  useEffect(() => {
    setSelMin(initial.min ?? absoluteMin);
    setSelMax(initial.max ?? absoluteMax);
  }, [absoluteMax, initial.min, initial.max]);

  /* ------------------ RESET ------------------ */
  function handleReset() {
    setSelMin(absoluteMin);
    setSelMax(absoluteMax);
    setSort("none");
    setDiscountOnly(false);
  }

  /* ------------------ APPLY ------------------ */
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
        <div className="filter-header">
          <h3>Filters</h3>
          <button className="btn-small" onClick={onClose}>
            Close ✕
          </button>
        </div>

        {/* PRICE RANGE */}
        <div className="filter-section">
          <label className="filter-label">Price range</label>

          {/* Display values */}
          <div
            style={{
              display: "flex",
              gap: 12,
              alignItems: "center",
              marginBottom: 10,
            }}
          >
            <div style={{ color: "#333" }}>₹ {selMin}</div>

            <div style={{ flex: 1 }}>
              <div
                style={{
                  height: 6,
                  background: "#e6e6e6",
                  borderRadius: 6,
                  position: "relative",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    height: 6,
                    borderRadius: 6,
                    background: "linear-gradient(90deg,#00c6ff,#00ff99)",
                    opacity: 0.15,
                  }}
                />
              </div>
            </div>

            <div style={{ color: "#333" }}>₹ {selMax}</div>
          </div>

          {/* Number inputs */}
          <div style={{ display: "flex", gap: 10 }}>
            <input
              type="number"
              value={selMin}
              min={absoluteMin}
              max={selMax}
              onChange={(e) => {
                const v = Number(e.target.value || absoluteMin);
                setSelMin(Math.max(absoluteMin, Math.min(v, selMax)));
              }}
              className="pill-number"
            />

            <input
              type="number"
              value={selMax}
              min={selMin}
              max={absoluteMax}
              onChange={(e) => {
                const v = Number(e.target.value || absoluteMax);
                setSelMax(Math.min(absoluteMax, Math.max(v, selMin)));
              }}
              className="pill-number"
            />
          </div>
        </div>

        {/* SORT SECTION */}
        <div className="filter-section">
          <label className="filter-label">Sort by</label>

          <div className="filter-row">
            <label className="radio">
              <input
                type="radio"
                name="sort"
                checked={sort === "none"}
                onChange={() => setSort("none")}
              />{" "}
              None
            </label>

            <label className="radio">
              <input
                type="radio"
                name="sort"
                checked={sort === "price-asc"}
                onChange={() => setSort("price-asc")}
              />{" "}
              Price: Low → High
            </label>

            <label className="radio">
              <input
                type="radio"
                name="sort"
                checked={sort === "price-desc"}
                onChange={() => setSort("price-desc")}
              />{" "}
              Price: High → Low
            </label>

            <label className="radio">
              <input
                type="radio"
                name="sort"
                checked={sort === "trending"}
                onChange={() => setSort("trending")}
              />{" "}
              Trending
            </label>

            <label className="radio">
              <input
                type="radio"
                name="sort"
                checked={sort === "newest"}
                onChange={() => setSort("newest")}
              />{" "}
              Newest
            </label>
          </div>
        </div>

        {/* DISCOUNT SECTION */}
        <div className="filter-section">
          <label className="filter-label">Discount</label>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <input
              id="discount"
              type="checkbox"
              checked={discountOnly}
              onChange={(e) => setDiscountOnly(e.target.checked)}
            />
            <label htmlFor="discount">Show discounted items only</label>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="filter-actions">
          <button className="btn-ghost" onClick={handleReset}>
            Reset
          </button>

          <div style={{ flex: 1 }}></div>

          <button className="btn-primary" onClick={handleApply}>
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}
