"use client";

import { useEffect, useState } from "react";

export default function FilterDrawer({ isOpen, onClose, products = [], initial = {}, onApply }) {
  // compute absolute min/max from products
  const prices = products.map((p) => Number(p.price || 0)).filter(Boolean);
  const absoluteMin = 1;
  const absoluteMax = prices.length ? Math.max(...prices) : (initial.max || 1000);

  const [min, setMin] = useState(initial.min ?? absoluteMin);
  const [max, setMax] = useState(initial.max ?? absoluteMax);
  const [selMin, setSelMin] = useState(initial.min ?? absoluteMin);
  const [selMax, setSelMax] = useState(initial.max ?? absoluteMax);
  const [sort, setSort] = useState(initial.sort ?? "none");
  const [discountOnly, setDiscountOnly] = useState(initial.discountOnly ?? false);

  useEffect(() => {
    setMin(absoluteMin);
    setMax(absoluteMax);
    setSelMin(initial.min ?? absoluteMin);
    setSelMax(initial.max ?? absoluteMax);
  }, [absoluteMin, absoluteMax, initial.min, initial.max]);

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
    <div className="filter-drawer-backdrop" onClick={(e) => { if (e.target.className === "filter-drawer-backdrop") onClose(); }}>
      <div className="filter-drawer">
        <div className="filter-header">
          <h3>Filters</h3>
          <button className="btn-small" onClick={onClose}>Close ✕</button>
        </div>

        {/* PRICE (only pill inputs) */}
        <div className="filter-section">
          <label className="filter-label">Price range</label>

          <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 8 }}>
            <div style={{ color: "#333" }}>₹ {selMin}</div>
            <div style={{ flex: 1 }}>
              {/* removed range slider by choice - show a visual track for clarity */}
              <div style={{ height: 6, background: "#e6e6e6", borderRadius: 6, position: "relative" }}>
                <div style={{ position: "absolute", left: 0, right: 0, height: 6, borderRadius: 6, background: "linear-gradient(90deg,#00c6ff,#00ff99)" , opacity: 0.12 }} />
              </div>
            </div>
            <div style={{ color: "#333" }}>₹ {selMax}</div>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <input
              type="number"
              value={selMin}
              min={min}
              max={selMax}
              onChange={(e) => {
                const v = Number(e.target.value || min);
                setSelMin(Math.max(min, Math.min(v, selMax)));
              }}
              className="pill-number"
            />
            <input
              type="number"
              value={selMax}
              min={selMin}
              max={max}
              onChange={(e) => {
                const v = Number(e.target.value || max);
                setSelMax(Math.min(max, Math.max(v, selMin)));
              }}
              className="pill-number"
            />
          </div>
        </div>

        {/* SORT */}
        <div className="filter-section">
          <label className="filter-label">Sort by</label>
          <div className="filter-row">
            <label className="radio"><input type="radio" name="sort" checked={sort === "none"} onChange={() => setSort("none")} /> None</label>
            <label className="radio"><input type="radio" name="sort" checked={sort === "price-asc"} onChange={() => setSort("price-asc")} /> Price: Low → High</label>
            <label className="radio"><input type="radio" name="sort" checked={sort === "price-desc"} onChange={() => setSort("price-desc")} /> Price: High → Low</label>
            <label className="radio"><input type="radio" name="sort" checked={sort === "trending"} onChange={() => setSort("trending")} /> Trending</label>
            <label className="radio"><input type="radio" name="sort" checked={sort === "newest"} onChange={() => setSort("newest")} /> Newest</label>
          </div>
        </div>

        {/* DISCOUNT */}
        <div className="filter-section">
          <label className="filter-label">Discount</label>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <input id="discount-toggle" type="checkbox" checked={discountOnly} onChange={(e) => setDiscountOnly(e.target.checked)} />
            <label htmlFor="discount-toggle">Show discounted items only</label>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="filter-actions">
          <button className="btn-ghost" onClick={handleReset}>Reset</button>
          <div style={{ flex: 1 }} />
          <button className="btn-primary" onClick={handleApply}>Apply</button>
        </div>
      </div>
    </div>
  );
}
