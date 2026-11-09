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
      <ProductSearchPicker
        products={options}
        selectedId={selectedId || ""}
        onSelect={onSelect}
        label="Search for the second product"
        placeholder="Type a product name or brand…"
        categoryFilter={false}
        emptyMessage="No compatible products match that search."
      />
      <p style={{ marginTop: 6, fontSize: 12, color: "#64748b" }}>
        Showing only products compatible with {currentProduct?.name || "Product A"}.
        {options.length ? " " + options.length + " compatible products found." : " No compatible products are currently available."}
      </p>
    </div>
  );
}
