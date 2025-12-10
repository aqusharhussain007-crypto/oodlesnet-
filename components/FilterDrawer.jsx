"use client";

import { useEffect, useState } from "react";

export default function FilterDrawer({
  isOpen,
  onClose,
  products = [],
  onApply,
}) {

  // --- FIND MIN/MAX FROM PRODUCTS ---
  const prices = products.map((p) => Number(p.price || 0)).filter(Boolean);
  const absoluteMin = 1; // always 1
  const absoluteMax = prices.length ? Math.max(...prices) : 999999;

  // STATES
  const [selMin, setSelMin] = useState(absoluteMin);
  const [selMax, setSelMax] = useState(absoluteMax);
  const [sort, setSort] = useState("none");
  const [discountOnly, setDiscountOnly] = useState(false);

  // RESET WHEN PRODUCTS CHANGE
  useEffect(() => {
    setSelMin(absoluteMin);
    setSelMax(absoluteMax);
  }, [absoluteMax]);

  // RESET BUTTON
  function handleReset() {
    setSelMin(absoluteMin);
    setSelMax(absoluteMax);
    setSort("none");
    setDiscountOnly(false);
  }

  // APPLY
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

        {/* PRICE RANGE */}
        <div className="filter-section">
          <label className="filter-label">Price Range</label>

          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <div>₹ {selMin}</div>

            <div style={{ flex: 1 }}>
              {/* Min Slider */}
              <input
                type="range"
                min={absoluteMin}
                max={absoluteMax}
                value={selMin}
                onChange={(e) =>
                  setSelMin(Math.min(Number(e.target.value), selMax))
                }
              />

              {/* Max Slider */}
              <input
                type="range"
                min={absoluteMin}
                max={absoluteMax}
                value={selMax}
                onChange={(e) =>
                  setSelMax(Math.max(Number(e.target.value), selMin))
                }
              />
            </div>

            <div>₹ {selMax}</div>
          </div>

          {/* Number Inputs */}
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <input
              type="number"
              className="filter-num"
              value={selMin}
              min={absoluteMin}
              max={selMax}
              onChange={(e) =>
                setSelMin(Math.min(Number(e.target.value || absoluteMin), selMax))
              }
            />
            <input
              type="number"
              className="filter-num"
              value={selMax}
              min={selMin}
              max={absoluteMax}
              onChange={(e) =>
                setSelMax(Math.max(Number(e.target.value || absoluteMax), selMin))
              }
            />
          </div>
        </div>

        {/* SORT */}
        <div className="filter-section">
          <label className="filter-label">Sort By</label>
          <div className="filter-row">
            <label className="radio">
              <input type="radio" checked={sort === "none"} onChange={() => setSort("none")} />
              None
            </label>

            <label className="radio">
              <input type="radio" checked={sort === "price-asc"} onChange={() => setSort("price-asc")} />
              Price: Low → High
            </label>

            <label className="radio">
              <input type="radio" checked={sort === "price-desc"} onChange={() => setSort("price-desc")} />
              Price: High → Low
            </label>

            <label className="radio">
              <input type="radio" checked={sort === "trending"} onChange={() => setSort("trending")} />
              Trending
            </label>

            <label className="radio">
              <input type="radio" checked={sort === "newest"} onChange={() => setSort("newest")} />
              Newest
            </label>
          </div>
        </div>

        {/* DISCOUNT */}
        <div className="filter-section">
          <label className="filter-label">Discount</label>
          <label className="radio">
            <input
              type="checkbox"
              checked={discountOnly}
              onChange={(e) => setDiscountOnly(e.target.checked)}
            />
            Show discounted items only
          </label>
        </div>

        {/* ACTIONS */}
        <div className="filter-actions">
          <button className="btn-ghost" onClick={handleReset}>Reset</button>
          <div style={{ flex: 1 }}></div>
          <button className="btn-primary" onClick={handleApply}>Apply</button>
        </div>
      </div>
    </div>
  );
  }
    
