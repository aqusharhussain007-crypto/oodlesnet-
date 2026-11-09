"use client";

import { useEffect, useId, useState } from "react";
import { canCompare } from "./compareRules";

export default function CompareSelector({ currentProduct, selectedId, onSelect, demoProducts }) {
  const id = useId();
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setLoadError(false);
    try {
      if (!Array.isArray(demoProducts)) throw new Error("Test catalogue data is unavailable.");
      const compatible = demoProducts
        .filter((product) => product && product.id !== currentProduct?.id)
        .filter((product) => canCompare(currentProduct, product).allowed)
        .sort((a, b) => String(a.name || "").localeCompare(String(b.name || "")));
      if (active) setOptions(compatible);
    } catch (error) {
      console.error("Test CompareSelector error:", error);
      if (active) { setOptions([]); setLoadError(true); }
    } finally {
      if (active) setLoading(false);
    }
    return () => { active = false; };
  }, [currentProduct?.id, currentProduct?.categorySlug, demoProducts]);

  const status = loading ? "Loading test products…" :
    loadError ? "Test products could not be loaded." :
    options.length ? options.length + " compatible test products available." :
    "No compatible products available in this category.";

  return (
    <div aria-busy={loading}>
      <label htmlFor={id + "-compare"} style={{ display: "block", marginBottom: 7, fontWeight: 800 }}>Choose a product from TEST catalogue</label>
      <select id={id + "-compare"} value={selectedId || ""} disabled={loading || !options.length}
        onChange={(event) => onSelect?.(options.find((p) => p.id === event.target.value) || null)}
        style={{ width: "100%", minHeight: 48, padding: "12px 14px", borderRadius: 12, border: "2px solid #10b981", fontSize: 16, background: "#fff", color: "#111827" }}>
        <option value="">{loading ? "Loading…" : "Select a compatible product"}</option>
        {options.map((product) => <option key={product.id} value={product.id}>{product.name || "Unnamed product"}</option>)}
      </select>
      <p role="status" style={{ marginTop: 7, fontSize: 12, color: loadError ? "#b91c1c" : "#64748b" }}>{status}</p>
    </div>
  );
}
