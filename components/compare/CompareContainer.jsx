"use client";

import { useState } from "react";
import { compareProducts } from "./compareRules";
import CompareSelector from "./CompareSelector";
import CompareResult from "./CompareResult";

export default function CompareContainer({ currentProduct }) {
  const [productB, setProductB] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(true);

  if (!currentProduct?.id) return null;

  function handleSelect(product) {
    setProductB(product);
    setResult(null);
    setError(null);
  }

  function handleCompare() {
    if (!productB) return;

    const comparison = compareProducts(currentProduct, productB);
    if (comparison.error) {
      setError(comparison.error);
      setResult(null);
      return;
    }

    setError(null);
    setResult(comparison);
  }

  function reset() {
    setProductB(null);
    setResult(null);
    setError(null);
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{
          marginTop: 20,
          padding: "12px 18px",
          borderRadius: 999,
          border: "none",
          fontWeight: 800,
          color: "#fff",
          background: "linear-gradient(135deg,#0f4c81,#10b981)",
          boxShadow: "0 8px 18px rgba(16,185,129,0.45)",
        }}
      >
        Compare with another product
      </button>
    );
  }

  return (
    <section
      aria-label="Compare products"
      style={{
        marginTop: 28,
        padding: 18,
        borderRadius: 20,
        background: "#f8fffd",
        border: "1px solid #99f6e4",
        boxShadow: "0 10px 24px rgba(0,0,0,0.12)",
        position: "relative",
      }}
    >
      <button
        type="button"
        onClick={() => setOpen(false)}
        aria-label="Close comparison"
        style={{
          position: "absolute",
          top: 12,
          right: 12,
          width: 32,
          height: 32,
          borderRadius: "50%",
          border: "none",
          background: "#e5e7eb",
          fontSize: 18,
          fontWeight: 900,
          cursor: "pointer",
        }}
      >
        ✕
      </button>

      <h3 style={{ fontSize: 18, fontWeight: 900, color: "#0f766e", marginBottom: 12, paddingRight: 36 }}>
        Compare <strong>{currentProduct.name}</strong> with
      </h3>

      <CompareSelector
        currentProduct={currentProduct}
        selectedId={productB?.id || ""}
        onSelect={handleSelect}
      />

      <button
        type="button"
        disabled={!productB}
        onClick={handleCompare}
        style={{
          marginTop: 14,
          width: "100%",
          padding: "14px 0",
          borderRadius: 14,
          border: "none",
          fontWeight: 900,
          fontSize: 15,
          color: "#fff",
          background: productB ? "linear-gradient(135deg,#0f4c81,#10b981)" : "#9ca3af",
          boxShadow: productB ? "0 8px 18px rgba(16,185,129,0.45)" : "none",
          cursor: productB ? "pointer" : "not-allowed",
        }}
      >
        Compare now
      </button>

      {error === "CATEGORY_MISMATCH" && (
        <p role="alert" style={{ color: "#b45309", marginTop: 10, fontWeight: 700 }}>
          These products belong to different categories and cannot be compared.
        </p>
      )}

      {error === "TYPE_MISMATCH" && (
        <p role="alert" style={{ color: "#b91c1c", marginTop: 10, fontWeight: 700 }}>
          These products are not the same product type and cannot be compared.
        </p>
      )}

      {result && (
        <CompareResult
          result={result}
          productA={currentProduct}
          productB={productB}
          onReset={reset}
        />
      )}
    </section>
  );
}
