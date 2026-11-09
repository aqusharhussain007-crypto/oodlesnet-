"use client";

import { useMemo, useState } from "react";

function categoryLabel(value) {
  return String(value || "uncategorized")
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
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
    <div style={{ marginTop: 12 }}>
      <label style={{ display: "block", marginBottom: 7, fontWeight: 800 }}>{label}</label>
      {selected && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, minWidth: 0, padding: "4px 0 10px", marginBottom: 8, textAlign: "center" }}>
          <div style={{ width: "100%", height: 82, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", borderRadius: 10, background: "#fff" }}>
            {selected.imageUrl ? <img src={selected.imageUrl} alt={selected.name || "Selected product"} loading="lazy" style={{ display: "block", maxWidth: "100%", width: "100%", height: "100%", objectFit: "contain" }} /> : <span style={{ color: "#94a3b8", fontSize: 11 }}>Image unavailable</span>}
          </div>
          <div style={{ width: "100%", minWidth: 0, fontWeight: 800, fontSize: 13, lineHeight: 1.3, overflowWrap: "anywhere" }}>{selected.name || "Unnamed product"}</div>
          <button type="button" onClick={() => { onSelect?.(null); setQuery(""); setShowResults(true); }} style={{ border: 0, borderRadius: 999, padding: "7px 14px", background: "#d1fae5", color: "#065f46", fontWeight: 800, fontSize: 12, cursor: "pointer" }}>Change product</button>
        </div>
      )}
      <input
        type="search"
        value={query}
        onChange={(event) => { setQuery(event.target.value); setShowResults(true); }}
        onFocus={() => setShowResults(true)}
        placeholder={placeholder}
        aria-label={label}
        style={{ width: "100%", minHeight: 48, boxSizing: "border-box", padding: "12px 14px", borderRadius: 12, border: "2px solid #10b981", fontSize: 16, background: "#fff", color: "#111827" }}
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
                <span style={{ display: "block", marginTop: 3, color: "#64748b", fontSize: 12 }}>{categoryLabel(product.categorySlug)}{product.brand ? " · " + product.brand : ""}</span>
              </span>
            </button>
          )) : <p style={{ padding: 13, color: "#64748b" }}>{emptyMessage}</p>}
        </div>
      )}
      <p role="status" style={{ marginTop: 7, fontSize: 12, color: "#64748b" }}>{products.length} products available{category !== "all" ? " in this category" : ""}. Search by name or brand.</p>
    </div>
  );
}
