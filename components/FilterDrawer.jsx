"use client";

import { useEffect, useMemo, useState } from "react";

/**
 * FilterDrawer
 * - isOpen, onClose, products (array), onApply(filters)
 * - removed category selection (categories exist above product grid)
 * - absoluteMin = 1, absoluteMax = highest product price
 * - auto-detect brands and stores
 * - outputs: { min, max, sort, discountOnly, brand, store, latest }
 */

export default function FilterDrawer({ isOpen, onClose, products = [], onApply }) {
  // compute prices & lists
  const prices = useMemo(() => products.map((p) => Number(p.price || 0)).filter((v) => !isNaN(v)), [products]);
  const absoluteMin = prices.length ? 1 : 1; // always min 1
  const absoluteMax = prices.length ? Math.max(...prices) : 10000;

  // brands (auto)
  const brands = useMemo(() => {
    const set = new Set();
    products.forEach((p) => {
      if (p.brand) set.add(p.brand);
    });
    return Array.from(set).sort();
  }, [products]);

  // stores detection: check amazonUrl/meeshoUrl/ajioUrl fields (and label with key)
  const stores = useMemo(() => {
    const s = [];
    const any = (k) => products.some((p) => p[k]);
    if (any("amazonUrl") || any("amazonPrice")) s.push("amazon");
    if (any("meeshoUrl") || any("meeshoPrice")) s.push("meesho");
    if (any("ajioUrl") || any("ajioPrice")) s.push("ajio");
    return s;
  }, [products]);

  // local state
  const [min, setMin] = useState(absoluteMin);
  const [max, setMax] = useState(absoluteMax);
  const [selMin, setSelMin] = useState(absoluteMin);
  const [selMax, setSelMax] = useState(absoluteMax);
  const [sort, setSort] = useState("none");
  const [discountOnly, setDiscountOnly] = useState(false);
  const [brand, setBrand] = useState("");
  const [store, setStore] = useState("");
  const [latest, setLatest] = useState(false);

  // sync when products change
  useEffect(() => {
    setMin(absoluteMin);
    setMax(absoluteMax);
    setSelMin(absoluteMin);
    setSelMax(absoluteMax);
  }, [absoluteMin, absoluteMax]);

  function handleReset() {
    setSelMin(min);
    setSelMax(max);
    setSort("none");
    setDiscountOnly(false);
    setBrand("");
    setStore("");
    setLatest(false);
  }

  function handleApply() {
    const filters = {
      min: Number(selMin),
      max: Number(selMax),
      sort,
      discountOnly,
      brand: brand || null,
      store: store || null,
      latest,
    };
    onApply?.(filters);
    onClose?.();
  }

  if (!isOpen) return null;

  return (
    <div
      className="filter-drawer-backdrop"
      onClick={(e) => {
        if (e.target.className === "filter-drawer-backdrop") onClose?.();
      }}
    >
      <div className="filter-drawer" style={{ maxHeight: "92vh", overflow: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ color: "#0bbcff", margin: 0 }}>Filters</h3>

          <button onClick={onClose} style={{ background: "#e8f8ff", borderRadius: 18, padding: "8px 12px", border: "none", color: "#0077aa", fontWeight: 700 }}>
            Close ✕
          </button>
        </div>

        {/* PRICE RANGE */}
        <div className="filter-section" style={{ marginTop: 14 }}>
          <label className="filter-label">Price range</label>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
            <div style={{ fontSize: 14, color: "#666" }}>₹ {selMin}</div>
            <div style={{ flex: 1 }}>
              {/* Two overlapping range inputs provide min/max control */}
              <input
                type="range"
                min={min}
                max={max}
                value={selMin}
                onChange={(e) => setSelMin(Math.min(Number(e.target.value), selMax))}
                aria-label="min-price"
                style={{ width: "100%" }}
              />
              <input
                type="range"
                min={min}
                max={max}
                value={selMax}
                onChange={(e) => setSelMax(Math.max(Number(e.target.value), selMin))}
                aria-label="max-price"
                style={{ width: "100%", marginTop: 6 }}
              />
            </div>
            <div style={{ fontSize: 14, color: "#666" }}>₹ {selMax}</div>
          </div>

          {/* pill boxes small */}
          <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
            <div style={{ flex: 1 }}>
              <input
                type="number"
                value={selMin}
                onChange={(e) => {
                  const v = Number(e.target.value || min);
                  setSelMin(Math.min(v, selMax));
                }}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: 12,
                  border: "2px solid rgba(11,188,255,0.25)",
                  textAlign: "center",
                  fontWeight: 700,
                }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <input
                type="number"
                value={selMax}
                onChange={(e) => {
                  const v = Number(e.target.value || max);
                  setSelMax(Math.max(v, selMin));
                }}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: 12,
                  border: "2px solid rgba(11,188,255,0.25)",
                  textAlign: "center",
                  fontWeight: 700,
                }}
              />
            </div>
          </div>
        </div>

        {/* BRAND */}
        <div className="filter-section" style={{ marginTop: 14 }}>
          <label className="filter-label">Brand</label>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button onClick={() => setBrand("")} style={{ padding: "8px 12px", borderRadius: 999, border: brand === "" ? "2px solid #00c6ff" : "1px solid #ddd", background: brand === "" ? "#eafffb" : "#fff" }}>
              Any
            </button>
            {brands.map((b) => (
              <button key={b} onClick={() => setBrand(b)} style={{ padding: "8px 12px", borderRadius: 999, border: brand === b ? "2px solid #00c6ff" : "1px solid #ddd", background: brand === b ? "#eafffb" : "#fff" }}>
                {b}
              </button>
            ))}
          </div>
        </div>

        {/* STORE */}
        <div className="filter-section" style={{ marginTop: 12 }}>
          <label className="filter-label">Store</label>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button onClick={() => setStore("")} style={{ padding: "8px 12px", borderRadius: 999, border: store === "" ? "2px solid #00c6ff" : "1px solid #ddd", background: store === "" ? "#eafffb" : "#fff" }}>
              Any
            </button>
            {stores.map((s) => (
              <button key={s} onClick={() => setStore(s)} style={{ padding: "8px 12px", borderRadius: 999, border: store === s ? "2px solid #00c6ff" : "1px solid #ddd", background: store === s ? "#eafffb" : "#fff", textTransform: "capitalize" }}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Latest */}
        <div className="filter-section" style={{ marginTop: 12 }}>
          <label className="filter-label">Latest</label>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <input id="latest" type="checkbox" checked={latest} onChange={(e) => setLatest(e.target.checked)} />
            <label htmlFor="latest">Show newest items first</label>
          </div>
        </div>

        {/* Sort */}
        <div className="filter-section" style={{ marginTop: 12 }}>
          <label className="filter-label">Sort by</label>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <label><input type="radio" name="sort" checked={sort === "none"} onChange={() => setSort("none")} /> None</label>
            <label><input type="radio" name="sort" checked={sort === "price-asc"} onChange={() => setSort("price-asc")} /> Price: Low → High</label>
            <label><input type="radio" name="sort" checked={sort === "price-desc"} onChange={() => setSort("price-desc")} /> Price: High → Low</label>
            <label><input type="radio" name="sort" checked={sort === "trending"} onChange={() => setSort("trending")} /> Trending</label>
            <label><input type="radio" name="sort" checked={sort === "newest"} onChange={() => setSort("newest")} /> Newest</label>
          </div>
        </div>

        {/* Discount */}
        <div className="filter-section" style={{ marginTop: 12 }}>
          <label className="filter-label">Discount</label>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input id="discount" type="checkbox" checked={discountOnly} onChange={(e) => setDiscountOnly(e.target.checked)} />
            <label htmlFor="discount">Show discounted items only</label>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 12, marginTop: 18, alignItems: "center" }}>
          <button onClick={handleReset} style={{ padding: "10px 14px", borderRadius: 12, border: "2px solid rgba(11,188,255,0.15)", background: "#fff", color: "#0077aa", fontWeight: 700 }}>
            Reset
          </button>

          <div style={{ flex: 1 }} />

          <button onClick={handleApply} style={{ padding: "12px 18px", borderRadius: 12, border: "none", background: "linear-gradient(90deg,#00c6ff,#00ff95)", color: "#001", fontWeight: 900 }}>
            Apply
          </button>
        </div>
      </div>
    </div>
  );
            }
      
