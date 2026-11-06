"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase-app";
import { canCompare } from "./compareRules";

/**
 * Loads compatible products and returns the complete selected product object.
 * The parent can therefore compare real product data rather than an ID string.
 */
export default function CompareSelector({
  currentProduct,
  selectedId,
  onSelect,
}) {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(Boolean(currentProduct));
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadOptions() {
      if (!currentProduct?.id) {
        setOptions([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setLoadError(false);

      try {
        const snapshot = await getDocs(collection(db, "products"));
        if (!active) return;

        const compatible = snapshot.docs
          .map((document) => ({ id: document.id, ...document.data() }))
          .filter((product) => product.id !== currentProduct.id)
          .filter((product) => canCompare(currentProduct, product).allowed)
          .sort((a, b) => String(a.name || "").localeCompare(String(b.name || "")));

        setOptions(compatible);
      } catch (error) {
        console.error("CompareSelector load error:", error);
        if (active) {
          setOptions([]);
          setLoadError(true);
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadOptions();
    return () => {
      active = false;
    };
  }, [currentProduct?.id]);

  function handleChange(event) {
    const nextId = event.target.value;
    onSelect(options.find((product) => product.id === nextId) || null);
  }

  return (
    <div>
      <select
        value={selectedId || ""}
        disabled={loading || options.length === 0}
        onChange={handleChange}
        aria-label="Choose a compatible product to compare"
        style={{
          width: "100%",
          padding: "12px 14px",
          borderRadius: 14,
          border: "2px solid #10b981",
          fontSize: 16,
          fontWeight: 700,
          background: "#ffffff",
          color: "#111827",
          outline: "none",
          cursor: loading ? "wait" : "pointer",
        }}
      >
        <option value="">
          {loading
            ? "Loading comparable products..."
            : loadError
            ? "Could not load products. Please try again."
            : options.length === 0
            ? "No compatible products available"
            : "Select a product to compare"}
        </option>

        {options.map((product) => (
          <option key={product.id} value={product.id}>
            {product.name || "Unnamed product"}
          </option>
        ))}
      </select>
      {loadError && (
        <p role="status" style={{ color: "#b91c1c", marginTop: 8, fontSize: 13 }}>
          Product options could not be loaded. Refresh the page to try again.
        </p>
      )}
    </div>
  );
}
