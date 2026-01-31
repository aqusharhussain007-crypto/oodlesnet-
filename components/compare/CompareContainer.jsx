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

  if (!open) {
    return (
      <button
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

  function handleCompare() {
    if (!productB) return;
    const res = compareProducts(currentProduct, productB);
    if (res.error) {
      setError(res.error);
      setResult(null);
      return;
    }
    setError(null);
    setResult(res);
  }

  function reset() {
    setProductB(null);
    setResult(null);
    setError(null);
  }

  return (
    <div
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
      {/* CLOSE BUTTON */}
      <button
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

      {/* TITLE */}
      <h3
        style={{
          fontSize: 18,
          fontWeight: 900,
          color: "#0f766e",
          marginBottom: 12,
        }}
      >
        Compare <strong>{currentProduct.name}</strong> with
      </h3>

      {/* SELECTOR */}
      <CompareSelector
        selected={productB}
        onSelect={setProductB}
        excludeId={currentProduct.id}
        category={currentProduct.categorySlug}
      />

      {/* COMPARE BUTTON */}
      <button
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
          background: productB
            ? "linear-gradient(135deg,#0f4c81,#10b981)"
            : "#9ca3af",
          boxShadow: productB
            ? "0 8px 18px rgba(16,185,129,0.45)"
            : "none",
          cursor: productB ? "pointer" : "not-allowed",
        }}
      >
        Compare now
      </button>

      {error === "CATEGORY_MISMATCH" && (
  <p style={{ color: "#b45309", marginTop: 10, fontWeight: 700 }}>
    Comparison works best within the same category.
  </p>
)}

{error === "TYPE_MISMATCH" && (
  <p style={{ color: "#b91c1c", marginTop: 10, fontWeight: 700 }}>
    These products are not the same type and can’t be compared.
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
    </div>
  );
}
  
