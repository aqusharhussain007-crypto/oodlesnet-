"use client";

import { useEffect, useState } from "react";

export default function FilterDrawer({
  isOpen,
  onClose,
  products = [],
  initial = {},
  onApply,
}) {
  // compute absolute min/max from products
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
        <div className="filter-header">
          <h3>Filters</h3>
          <button className="btn-small" onClick={onClose}>Close</button>
        </div>

        {/* ❌ REMOVED CATEGORY SECTION COMPLETELY */}

        {/* PRICE RANGE */}
        <div className="filter-section">
          <label className="filter-label">Price range</label>

          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
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

          {/* numeric boxes */}
          <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
            <input
              type="number"
              className="filter-num"
              value={selMin}
              onChange={(e) =>
                setSelMin(Math.min(Number(e.target.value), selMax))
              }
            />
            <input
              type="number"
              className="filter-num"
              value={selMax}
              onChange={(e) =>
                setSelMax(Math.max(Number(e.target.value), selMin))
              }
            />
          </div>
        </div>

        {/* SORTING */}
        <div className="filter-section">
          <label className="filter-label">Sort by</label>
          <div className="filter-row">
            <label className="radio">
              <input
                type="radio"
                name="sort"
                checked={sort === "none"}
                onChange={() => setSort("none")}
              />
              None
            </label>

            <label className="radio">
              <input
                type="radio"
                name="sort"
                checked={sort === "price-asc"}
                onChange={() => setSort("price-asc")}
              />
              Price: Low → High
            </label>

            <label className="radio">
              <input
                type="radio"
                name="sort"
                checked={sort === "price-desc"}
                onChange={() => setSort("price-desc")}
              />
              Price: High → Low
            </label>

            <label className="radio">
              <input
                type="radio"
                name="sort"
                checked={sort === "trending"}
                onChange={() => setSort("trending")}
              />
              Trending
            </label>

            <label className="radio">
              <input
                type="radio"
                name="sort"
                checked={sort === "newest"}
                onChange={() => setSort("newest")}
              />
              Newest
            </label>
          </div>
        </div>

        {/* DISCOUNT ONLY */}
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

        {/* ACTION BUTTONS */}
        <div className="filter-actions">
          <button className="btn-ghost" onClick={handleReset}>Reset</button>
          <div style={{ flex: 1 }} />
          <button className="btn-primary" onClick={handleApply}>Apply</button>
        </div>
      </div>
    </div>
  );
    }
                                               
