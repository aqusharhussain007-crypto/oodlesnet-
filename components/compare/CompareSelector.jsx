"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase-app";
import { canCompare } from "./compareRules";

/**
 * Loads products from the current product category only, then applies the
 * same compatibility rules used by the comparison engine.
 */
export default function CompareSelector({
  currentProduct,
  selectedId,
  onSelect,
}) {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(Boolean(currentProduct?.id));
  const [loadError, setLoadError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let active = true;

    async function loadOptions() {
      const categorySlug = currentProduct?.categorySlug;
      if (!currentProduct?.id || !categorySlug) {
        setOptions([]);
        setLoading(false);
        setLoadError(false);
        return;
      }

      setLoading(true);
      setLoadError(false);

      try {
        const productsRef = collection(db, "products");
        const normalizedCategory = String(categorySlug).trim().toLowerCase();
        const productsQuery =
          normalizedCategory === "smartphone" ||
          normalizedCategory === "smartphones"
            ? query(
                productsRef,
                where("categorySlug", "in", ["smartphone", "smartphones"])
              )
            : query(productsRef, where("categorySlug", "==", categorySlug));

        const snapshot = await getDocs(productsQuery);
        if (!active) return;

        const compatible = snapshot.docs
          .map((document) => ({ id: document.id, ...document.data() }))
          .filter((product) => product.id !== currentProduct.id)
          .filter((product) => canCompare(currentProduct, product).allowed)
          .sort((a, b) =>
            String(a.name || "").localeCompare(String(b.name || ""))
          );

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
  }, [currentProduct?.id, currentProduct?.categorySlug, retryCount]);

  function handleChange(event) {
    const nextId = event.target.value;
    onSelect?.(options.find((product) => product.id === nextId) || null);
  }

  const statusMessage = loading
    ? "Loading compatible products…"
    : loadError
    ? "Product options could not be loaded. Please retry."
    : options.length === 0
    ? "No other compatible products are currently available in this category."
    : `${options.length} compatible product${options.length === 1 ? "" : "s"} available.`;

  return (
    <div aria-busy={loading}>
      <label
        htmlFor="compare-product-selector"
        style={{
          display: "block",
          marginBottom: 7,
          color: "#164e63",
          fontSize: 14,
          fontWeight: 800,
        }}
      >
        Choose a product
      </label>
      <select
        id="compare-product-selector"
        value={selectedId || ""}
        disabled={loading || options.length === 0}
        onChange={handleChange}
        aria-label="Choose a compatible product to compare"
        aria-describedby="compare-selector-help"
        style={{
          width: "100%",
          minHeight: 48,
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
            ? "Could not load products. Please retry."
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

      <p
        id="compare-selector-help"
        role="status"
        aria-live="polite"
        style={{
          margin: "7px 2px 0",
          minHeight: 18,
          color: loadError ? "#b91c1c" : "#64748b",
          fontSize: 12,
          lineHeight: 1.5,
        }}
      >
        {statusMessage}
      </p>

      {loadError && (
        <div role="status" style={{ marginTop: 8 }}>
          <p style={{ color: "#b91c1c", fontSize: 13 }}>
            Product options could not be loaded.
          </p>
          <button
            type="button"
            onClick={() => setRetryCount((count) => count + 1)}
            disabled={loading}
            style={{
              marginTop: 6,
              padding: "8px 12px",
              borderRadius: 10,
              border: "1px solid #10b981",
              background: "#ecfdf5",
              color: "#065f46",
              fontWeight: 700,
            }}
          >
            Retry loading products
          </button>
        </div>
      )}
    </div>
  );
}
