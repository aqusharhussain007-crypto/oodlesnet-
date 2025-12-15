"use client";

import { useState } from "react";

export default function FilterDrawer({ onClose }) {
  const [sort, setSort] = useState("none");

  return (
    <div
      className="filter-drawer-backdrop"
      onClick={onClose}
    >
      <div
        className="filter-drawer"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="filter-header">
          <h3>Filters</h3>
          <button className="btn-small" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* SORT */}
        <div className="filter-section">
          <div className="filter-label">Sort by</div>

          <div className="filter-row">
            {[
              ["none", "None"],
              ["price-asc", "Price: Low → High"],
              ["price-desc", "Price: High → Low"],
              ["trending", "Trending"],
            ].map(([val, label]) => (
              <label key={val} className="radio">
                <input
                  type="radio"
                  checked={sort === val}
                  onChange={() => setSort(val)}
                />
                {label}
              </label>
            ))}
          </div>
        </div>

        {/* ACTIONS */}
        <div className="filter-actions">
          <button className="btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn-primary"
            onClick={onClose}
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}
