"use client";

import { useEffect, useState } from "react";

export default function FilterDrawer({
  isOpen,
  onClose,
  products = [],
  categories = [],
  initial = {},
  onApply,
}) {
  // compute absolute min/max from products
  const prices = products.map((p) => Number(p.price || 0)).filter(Boolean);
  const absoluteMin = prices.length ? Math.min(...prices) : 0;
  const absoluteMax = prices.length ? Math.max(...prices) : 100000;

  const [min, setMin] = useState(initial.min ?? absoluteMin);
  const [max, setMax] = useState(initial.max ?? absoluteMax);
  const [selMin, setSelMin] = useState(initial.min ?? absoluteMin);
  const [selMax, setSelMax] = useState(initial.max ?? absoluteMax);
  const [sort, setSort] = useState(initial.sort ?? "none");
  const [discountOnly, setDiscountOnly] = useState(initial.discountOnly ?? false);

  // keep sync when products change
  useEffect(() => {
    setMin(absoluteMin);
    setMax(absoluteMax);
    setSelMin(initial.min ?? absoluteMin);
    setSelMax(initial.max ?? absoluteMax);
  }, [absoluteMin, absoluteMax]);

  // reset to defaults
  function handleReset() {
    setSelMin(min);
    setSelMax(max);
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
        <div className="filter-header">
          <h3>Filters</h3>
          <button className="btn-small" onClick={onClose}>Close</button>
        </div>

        {/* Price Range */}
        <div className="filter-section">
          <label className="filter-label">Price range</label>

          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <div style={{ fontSize: 14, color: "#666" }}>₹ {selMin}</div>
            <div style={{ flex: 1 }}>
              <input
                type="range"
                min={min}
                max={max}
                value={selMin}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setSelMin(Math.min(v, selMax));
                }}
                aria-label="min-price"
              />
              <input
                type="range"
                min={min}
                max={max}
                value={selMax}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setSelMax(Math.max(v, selMin));
                }}
                aria-label="max-price"
              />
            </div>
            <div style={{ fontSize: 14, color: "#666" }}>₹ {selMax}</div>
          </div>

          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <input
              type="number"
              value={selMin}
              onChange={(e) => {
                const v = Number(e.target.value || min);
                setSelMin(Math.min(v, selMax));
              }}
              className="filter-num"
            />
            <input
              type="number"
              value={selMax}
              onChange={(e) => {
                const v = Number(e.target.value || max);
                setSelMax(Math.max(v, selMin));
              }}
              className="filter-num"
            />
          </div>
        </div>

        {/* Sort */}
        <div className="filter-section">
          <label className="filter-label">Sort by</label>
          <div className="filter-row">
            <label className="radio">
              <input type="radio" name="sort" checked={sort === "none"} onChange={() => setSort("none")} />
              None
            </label>
            <label className="radio">
              <input type="radio" name="sort" checked={sort === "price-asc"} onChange={() => setSort("price-asc")} />
              Price: Low → High
            </label>
            <label className="radio">
              <input type="radio" name="sort" checked={sort === "price-desc"} onChange={() => setSort("price-desc")} />
              Price: High → Low
            </label>
            <label className="radio">
              <input type="radio" name="sort" checked={sort === "trending"} onChange={() => setSort("trending")} />
              Trending
            </label>
            <label className="radio">
              <input type="radio" name="sort" checked={sort === "newest"} onChange={() => setSort("newest")} />
              Newest
            </label>
          </div>
        </div>

        {/* Discount Toggle */}
        <div className="filter-section">
          <label className="filter-label">Discount</label>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <input
              id="discount-toggle"
              type="checkbox"
              checked={discountOnly}
              onChange={(e) => setDiscountOnly(e.target.checked)}
            />
            <label htmlFor="discount-toggle">Show discounted items only</label>
          </div>
        </div>

        {/* Actions */}
        <div className="filter-actions">
          <button className="btn-ghost" onClick={handleReset}>Reset</button>
          <div style={{ flex: 1 }} />
          <button className="btn-primary" onClick={handleApply}>Apply</button>
        </div>
      </div>
    </div>
  );
            }
                  
