"use client";

import { useEffect, useState } from "react";

export default function FilterDrawer({
  isOpen,
  onClose,
  products = [],
  initial = {},
  onApply,
}) {
  /* ---------------------------------------------------
     AUTO PRICE RANGE (MIN = 1, MAX = highest price)
  -----------------------------------------------------*/
  const prices = products.map((p) => Number(p.price || 0)).filter(Boolean);

  const absoluteMin = 1;
  const absoluteMax = prices.length ? Math.max(...prices) : 99999;

  const [selMin, setSelMin] = useState(initial.min ?? absoluteMin);
  const [selMax, setSelMax] = useState(initial.max ?? absoluteMax);
  const [sort, setSort] = useState(initial.sort ?? "none");
  const [discountOnly, setDiscountOnly] = useState(initial.discountOnly ?? false);

  /* Keep updated when product list changes */
  useEffect(() => {
    setSelMin(initial.min ?? absoluteMin);
    setSelMax(initial.max ?? absoluteMax);
  }, [absoluteMax]);

  /* RESET */
  function handleReset() {
    setSelMin(absoluteMin);
    setSelMax(absoluteMax);
    setSort("none");
    setDiscountOnly(false);
  }

  /* APPLY */
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
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.25)",
        zIndex: 1000,
      }}
    >
      <div
        className="filter-drawer"
        style={{
          position: "absolute",
          right: 0,
          top: 0,
          width: "86%",
          height: "100%",
          background: "#fff",
          borderTopLeftRadius: 26,
          borderBottomLeftRadius: 26,
          padding: 18,
          overflowY: "auto",
          boxShadow: "-4px 0 18px rgba(0,0,0,0.15)",
        }}
      >
        {/* HEADER */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 12,
            alignItems: "center",
          }}
        >
          <h2 style={{ fontSize: 22, fontWeight: 700, color: "#0077b6" }}>
            Filters
          </h2>

          <button
            onClick={onClose}
            style={{
              background: "#e6f6ff",
              padding: "8px 14px",
              borderRadius: 12,
              color: "#0077b6",
              fontWeight: 700,
              border: "none",
              fontSize: 15,
            }}
          >
            Close ✕
          </button>
        </div>

        {/* PRICE RANGE */}
        <div style={{ marginTop: 8 }}>
          <label style={{ fontWeight: 700, fontSize: 18 }}>Price Range</label>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 15,
              marginTop: 6,
              color: "#444",
            }}
          >
            <span>₹ {absoluteMin}</span>
            <span>₹ {absoluteMax}</span>
          </div>

          {/* Range Sliders */}
          <input
            type="range"
            min={absoluteMin}
            max={absoluteMax}
            value={selMin}
            onChange={(e) =>
              setSelMin(Math.min(Number(e.target.value), selMax))
            }
            style={{ width: "100%", marginTop: 8 }}
          />

          <input
            type="range"
            min={absoluteMin}
            max={absoluteMax}
            value={selMax}
            onChange={(e) =>
              setSelMax(Math.max(Number(e.target.value), selMin))
            }
            style={{ width: "100%", marginTop: 6 }}
          />

          {/* VALUE BOXES */}
          <div
            style={{
              display: "flex",
              gap: 10,
              marginTop: 14,
            }}
          >
            {/* MIN BOX */}
            <input
              type="number"
              value={selMin}
              min={absoluteMin}
              max={selMax}
              onChange={(e) =>
                setSelMin(Math.min(Number(e.target.value || 1), selMax))
              }
              style={{
                flex: 1,
                padding: "10px 14px",
                borderRadius: 14,
                border: "2px solid #9ddcff",
                fontSize: 17,
                fontWeight: 600,
                textAlign: "center",
                background: "#f8fdff",
              }}
            />

            {/* MAX BOX */}
            <input
              type="number"
              value={selMax}
              min={selMin}
              max={absoluteMax}
              onChange={(e) =>
                setSelMax(Math.max(Number(e.target.value || absoluteMax), selMin))
              }
              style={{
                flex: 1,
                padding: "10px 14px",
                borderRadius: 14,
                border: "2px solid #9ddcff",
                fontSize: 17,
                fontWeight: 600,
                textAlign: "center",
                background: "#f8fdff",
              }}
            />
          </div>
        </div>

        {/* SORT OPTIONS */}
        <div style={{ marginTop: 28 }}>
          <label style={{ fontWeight: 700, fontSize: 18 }}>Sort By</label>

          {/* Options */}
          {[
            ["none", "None"],
            ["price-asc", "Price: Low → High"],
            ["price-desc", "Price: High → Low"],
            ["trending", "Trending"],
            ["newest", "Newest"],
          ].map(([val, label]) => (
            <label
              key={val}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginTop: 10,
                fontSize: 16,
              }}
            >
              <input
                type="radio"
                name="sort"
                checked={sort === val}
                onChange={() => setSort(val)}
              />
              {label}
            </label>
          ))}
        </div>

        {/* DISCOUNT ONLY */}
        <div style={{ marginTop: 28 }}>
          <label style={{ fontWeight: 700, fontSize: 18 }}>Discount</label>

          <label
            style={{
              display: "flex",
              gap: 10,
              alignItems: "center",
              marginTop: 12,
              fontSize: 16,
            }}
          >
            <input
              type="checkbox"
              checked={discountOnly}
              onChange={(e) => setDiscountOnly(e.target.checked)}
            />
            Show discounted items only
          </label>
        </div>

        {/* ACTION BUTTONS */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginTop: 28,
          }}
        >
          <button
            onClick={handleReset}
            style={{
              padding: "10px 16px",
              fontWeight: 700,
              background: "#eefaff",
              borderRadius: 12,
              border: "2px solid #c4edff",
              color: "#0077b6",
              fontSize: 16,
            }}
          >
            Reset
          </button>

          <div style={{ flex: 1 }} />

          <button
            onClick={handleApply}
            style={{
              padding: "12px 20px",
              borderRadius: 14,
              border: "none",
              background: "linear-gradient(90deg,#00c6ff,#00e3aa)",
              color: "#fff",
              fontWeight: 700,
              fontSize: 17,
              boxShadow: "0 4px 14px rgba(0,0,0,0.2)",
            }}
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
    }
