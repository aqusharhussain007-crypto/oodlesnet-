"use client";

import { useEffect, useState } from "react";
import { canCompare } from "./compareRules";
import ProductSearchPicker from "./ProductSearchPicker";

export default function CompareSelector({ currentProduct, selectedId, onSelect, demoProducts }) {
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

  if (loading) return <p role="status">Preparing compatible products…</p>;
  if (loadError) return <p role="alert" style={{ color: "#b91c1c" }}>Test products could not be loaded.</p>;

  return (
    <div aria-busy={loading}>
      <p style={{ margin: "0 0 8px", color: "#64748b", fontSize: 12, lineHeight: 1.4 }}>
        Only products with the same assigned product type are listed. Broad categories alone are not enough.
      </p>
      <ProductSearchPicker
        products={options}
        selectedId={selectedId || ""}
        onSelect={onSelect}
        label=""
        placeholder="Search Product B…"
        categoryFilter={false}
        emptyMessage="No compatible products match that search."
      />
   </div>
  );
}
