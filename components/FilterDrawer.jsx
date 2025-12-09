"use client";

import { useEffect, useState } from "react";

/**
 * FilterDrawer
 * - now shows categories at top (pills inside drawer)
 * - lets user pick a category and apply filters
 * - returns { min, max, sort, discountOnly, category }
 */

export default function FilterDrawer({
  isOpen,
  onClose,
  products = [],
  categories = [],
  initial = {},
  onApply,
}) {
  // compute absolute min/max from products
  const prices = Array.isArray(products) ? products.map((p) => Number(p.price || 0)).filter(Boolean) : [];
  const absoluteMin = prices.length ? Math.min(...prices) : 0;
  const absoluteMax = prices.length ? Math.max(...prices) : 100000;

  const [min] = useState(absoluteMin);
  const [max] = useState(absoluteMax);
  const [selMin, setSelMin] = useState(initial.min ?? absoluteMin);
  const [selMax, setSelMax] = useState(initial.max ?? absoluteMax);
  const [sort, setSort] = useState(initial.sort ?? "none");
  const [discountOnly, setDiscountOnly] = useState(initial.discountOnly ?? false);
  const [category, setCategory] = useState(initial.category ?? (initial.selectedCat ?? null));

  // sync when products or initial change
  useEffect(() => {
    setSelMin(initial.min ?? absoluteMin);
    setSelMax(initial.max ?? absoluteMax);
    setSort(initial.sort ?? "none");
    setDiscountOnly(initial.discountOnly ?? false);
    setCategory(initial.category ?? (initial.selectedCat ?? null));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [absoluteMin, absoluteMax, initial]);

  function handleReset() {
    setSelMin(min);
    setSelMax(max);
    setSort("none");
    setDiscountOnly(false);
    setCategory(null);
  }

  function handleApply() {
    onApply({
      min: Number(selMin),
      max: Number(selMax),
      sort,
      discountOnly,
      category,
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
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 120,
        background: "rgba(0,0,0,0.22)",
        display: "flex",
        justifyContent: "flex-end",
      }}
    >
      <div
        className="filter-drawer"
        style={{
          width: "min(420px, 92%)",
          height: "100%",
          background: "#fff",
          padding: 16,
          boxShadow: "0 30px 80px rgba(0,0,0,0.25)",
          overflowY: "auto",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
          <h3 style={{ margin: 0, color: "#0077aa" }}>Filters</h3>
          <div style={{ flex: 1 }} />
          <button className="btn-small" onClick={onClose} style={{ padding: "6px 10px", borderRadius: 8 }}>Close</button>
        </div>

        {/* Categories pills inside drawer */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontWeight: 800, color: "#0077aa", marginBottom: 8 }}>Categories</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button
              onClick={() => setCategory("all")}
              style={{
                padding: "8px 12px",
                borderRadius: 999,
                background: category === "all" || category === null ? "linear-gradient(90deg,#eafffb,#e9fff0)" : "#f5f9fb",
                border: category === "all" || category === null ? "2px solid rgba(0,198,255,0.6)" : "1px solid rgba(0,0,0,0.06)",
                cursor: "pointer",
              }}
            >
              All
            </button>

            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setCategory(c.slug)}
                style={{
                  padding: "8px 12px",
                  borderRadius: 999,
                  background: category === c.slug ? "linear-gradient(90deg,#eafffb,#e9fff0)" : "#f5f9fb",
                  border: category === c.slug ? "2px solid rgba(0,198,255,0.6)" : "1px solid rgba(0,0,0,0.06)",
                  cursor: "pointer",
                }}
              >
                <span style={{ marginRight: 8 }}>{c.icon}</span>
                <span style={{ fontWeight: 700, color: "#005e85" }}>{c.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Price range */}
        <div className="filter-section" style={{ marginBottom: 14 }}>
          <label style={{ display: "block", marginBottom: 8, color: "#333", fontWeight: 700 }}>Price range</label>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
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
                style={{ width: "100%" }}
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
                style={{ width: "100%", marginTop: 6 }}
              />
            </div>
            <div style={{ fontSize: 14, color: "#666" }}>₹ {selMax}</div>
          </div>

          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <input type="number" value={selMin} onChange={(e) => setSelMin(Number(e.target.value || min))} className="filter-num" style={{ flex: 1, padding: 8, borderRadius: 8 }} />
            <input type="number" value={selMax} onChange={(e) => setSelMax(Number(e.target.value || max))} className="filter-num" style={{ flex: 1, padding: 8, borderRadius: 8 }} />
          </div>
        </div>

        {/* Sort */}
        <div className="filter-section" style={{ marginBottom: 14 }}>
          <label style={{ display: "block", marginBottom: 8, color: "#333", fontWeight: 700 }}>Sort by</label>
          <div style={{ display: "grid", gap: 8 }}>
            <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input type="radio" name="sort" checked={sort === "none"} onChange={() => setSort("none")} />
              None
            </label>
            <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input type="radio" name="sort" checked={sort === "price-asc"} onChange={() => setSort("price-asc")} />
              Price: Low → High
            </label>
            <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input type="radio" name="sort" checked={sort === "price-desc"} onChange={() => setSort("price-desc")} />
              Price: High → Low
            </label>
            <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input type="radio" name="sort" checked={sort === "trending"} onChange={() => setSort("trending")} />
              Trending
            </label>
            <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input type="radio" name="sort" checked={sort === "newest"} onChange={() => setSort("newest")} />
              Newest
            </label>
          </div>
        </div>

        {/* Discount */}
        <div className="filter-section" style={{ marginBottom: 18 }}>
          <label style={{ display: "block", marginBottom: 8, color: "#333", fontWeight: 700 }}>Discount</label>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <input id="discount-toggle" type="checkbox" checked={discountOnly} onChange={(e) => setDiscountOnly(e.target.checked)} />
            <label htmlFor="discount-toggle">Show discounted items only</label>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 6 }}>
          <button className="btn-ghost" onClick={handleReset} style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #ddd" }}>Reset</button>
          <div style={{ flex: 1 }} />
          <button className="btn-primary" onClick={handleApply} style={{ padding: "10px 14px", borderRadius: 10, background: "linear-gradient(90deg,#00c6ff,#00ff99)", border: "none", fontWeight: 800 }}>Apply</button>
        </div>
      </div>
    </div>
  );
}
  
