"use client";

import { useMemo, useState } from "react";

function categoryLabel(value) {
  return String(value || "uncategorized")
    .replace(/[-_]+/g, " ")
    .replace(/\\b\\w/g, (letter) => letter.toUpperCase());
}

function productTypeLabel(product) {
  const value = String(product?.productType || "").trim();
  return value
    ? value.replace(/[-_]+/g, " ")
    : "Type not assigned";
}

export default function ProductSearchPicker({
  products = [],
  selectedId = "",
  onSelect,
  label = "Search products",
  placeholder = "Search by product, brand or model…",
  categoryFilter = true,
  emptyMessage = "No matching products found.",
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [showResults, setShowResults] = useState(false);

  const categories = useMemo(() => [...new Set(
    products.map((product) => String(product?.categorySlug || "").trim()).filter(Boolean)
  )].sort((a, b) => a.localeCompare(b)), [products]);

  const selected = products.find((product) => product?.id === selectedId) || null;

  const matches = useMemo(() => {
    const term = query.trim().toLowerCase();
    return products.filter((product) => {
      if (!product?.id) return false;
      if (category !== "all" && String(product.categorySlug || "") !== category) return false;
      if (!term) return true;
      const searchable = [
        product.name,
        product.brand,
        product.categorySlug,
        product.productType,
        product.subcategory,
        ...(Array.isArray(product.tags) ? product.tags : []),
      ].filter(Boolean).join(" ").toLowerCase();
      return searchable.includes(term);
    }).slice(0, 12);
  }, [products, query, category]);

  return (
    <div style={{ marginTop: 0, minWidth: 0 }}>
      {label ? <label style={{ display: "block", marginBottom: 7, fontWeight: 800 }}>{label}</label> : null}
      <div style={{ minHeight: 210, height: 210, display: "flex", flexDirection: "column", justifyContent: selected ? "flex-start" : "center", alignItems: "center", minWidth: 0, padding: "4px 0 8px", marginBottom: 8, boxSizing: "border-box", textAlign: "center", overflow: "hidden" }}>
        {selected ? (
          <>
            <button type="button" onClick={() => { onSelect?.(null); setQuery(""); setShowResults(true); }} aria-label="Change selected product" title={selected.name || "Selected product"} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, width: "100%", maxWidth: "100%", minWidth: 0, boxSizing: "border-box", padding: 0, border: 0, background: "transparent", color: "inherit", cursor: "pointer", overflow: "hidden" }}>
              <span style={{ width: "100%", height: 72, flex: "0 0 72px", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", borderRadius: 10, background: "#fff" }}>
                {selected.imageUrl ? <img src={selected.imageUrl} alt={selected.name || "Selected product"} loading="lazy" style={{ display: "block", maxWidth: "100%", width: "100%", height: "100%", objectFit: "contain" }} /> : <span style={{ color: "#94a3b8", fontSize: 11 }}>Image unavailable</span>}
              </span>
              <span style={{ display: "-webkit-box", width: "100%", maxWidth: "100%", minWidth: 0, boxSizing: "border-box", padding: "0 3px", fontWeight: 800, fontSize: 13, lineHeight: 1.3, textAlign: "center", overflowWrap: "anywhere", wordBreak: "normal", WebkitLineClamp: 4, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{selected.name || "Unnamed product"}</span>
              <span style={{ color: "#0f766e", fontSize: 11, fontWeight: 800 }}>{categoryLabel(selected.categorySlug)} · {productTypeLabel(selected)}</span>
            </button>
            <button type="button" onClick={() => { onSelect?.(null); setQuery(""); setShowResults(true); }} style={{ flex: "0 0 auto", marginTop: 6, border: 0, borderRadius: 999, padding: "6px 12px", background: "#d1fae5", color: "#065f46", fontWeight: 800, fontSize: 12, cursor: "pointer" }}>Change product</button>
          </>
        ) : (
          <div aria-hidden="true" style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", borderRadius: 12, background: "linear-gradient(145deg,rgba(15,118,110,0.045),rgba(16,185,129,0.015))", color: "rgba(15,118,110,0.22)" }}>
            <span style={{ fontSize: 29, fontWeight: 900, letterSpacing: -1 }}>OodlesNet</span>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>Choose a product</span>
          </div>
        )}
      </div>
      <input
        type="search"
        value={query}
        onChange={(event) => { if (selected) onSelect?.(null); setQuery(event.target.value); setShowResults(true); }}
        onFocus={() => setShowResults(true)}
        placeholder={placeholder}
        aria-label={label}
        style={{ width: "100%", minHeight: 40, height: 42, boxSizing: "border-box", padding: "8px 12px", borderRadius: 11, border: "2px solid #10b981", fontSize: 15, background: "#fff", color: "#111827" }}
      />
      {categoryFilter && (
        <div style={{ marginTop: 10 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: "#475569", marginBottom: 7 }}>CATEGORY · SWIPE TO EXPLORE</div>
          <div role="group" aria-label="Filter products by category" style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 7, WebkitOverflowScrolling: "touch" }}>
            <button type="button" onClick={() => { setCategory("all"); setShowResults(true); }} aria-pressed={category === "all"} style={{ flex: "0 0 auto", border: "1px solid #0d9488", borderRadius: 999, padding: "9px 14px", background: category === "all" ? "#0f766e" : "#fff", color: category === "all" ? "#fff" : "#134e4a", fontWeight: 800 }}>All ({products.length})</button>
            {categories.map((item) => (
              <button key={item} type="button" onClick={() => { setCategory(item); setShowResults(true); }} aria-pressed={category === item} style={{ flex: "0 0 auto", border: "1px solid #0d9488", borderRadius: 999, padding: "9px 14px", background: category === item ? "#0f766e" : "#fff", color: category === item ? "#fff" : "#134e4a", fontWeight: 800, whiteSpace: "nowrap" }}>{categoryLabel(item)} ({products.filter((p) => p?.categorySlug === item).length})</button>
            ))}
          </div>
        </div>
      )}
      {showResults && !selected && (
        <div role="listbox" aria-label="Matching products" style={{ marginTop: 8, maxHeight: 300, overflowY: "auto", border: "1px solid #cbd5e1", borderRadius: 12, background: "#fff" }}>
          {matches.length ? matches.map((product) => (
            <button key={product.id} type="button" role="option" aria-selected={false} onClick={() => { onSelect?.(product); setQuery(""); setShowResults(false); }} style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", textAlign: "left", padding: "9px 11px", border: 0, borderBottom: "1px solid #e2e8f0", background: "#fff", color: "#0f172a", cursor: "pointer" }}>
              {product.imageUrl ? <img src={product.imageUrl} alt="" loading="lazy" style={{ width: 48, height: 48, flex: "0 0 48px", objectFit: "contain", borderRadius: 7, background: "#f8fafc" }} /> : <span style={{ width: 48, height: 48, flex: "0 0 48px", borderRadius: 7, background: "#f1f5f9" }} />}
              <span style={{ minWidth: 0 }}>
                <span style={{ display: "block", fontWeight: 800, overflowWrap: "anywhere" }}>{product.name || "Unnamed product"}</span>
                <span style={{ display: "block", marginTop: 3, color: "#64748b", fontSize: 12 }}>{categoryLabel(product.categorySlug)} · {productTypeLabel(product)}{product.brand ? " · " + product.brand : ""}</span>
              </span>
            </button>
          )) : <p style={{ padding: 13, color: "#64748b" }}>{emptyMessage}</p>}
        </div>
      )}
    </div>
  );
}
