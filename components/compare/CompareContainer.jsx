"use client";

import { useEffect, useRef, useState } from "react";
import { compareProducts } from "./compareRules";
import CompareSelector from "./CompareSelector";
import CompareResult from "./CompareResult";

const ERROR_MESSAGES = {
  CATEGORY_MISMATCH: "These products belong to different categories and cannot be compared.",
  TYPE_MISMATCH: "These products are different product types and cannot be compared.",
  PRODUCT_TYPE_REQUIRED: "A specific product type is missing. Add or select a verified type for both products before comparing.",
  UNSUPPORTED_TYPE: "The product type is not identified well enough for a reliable comparison.",
  INVALID_PRODUCT: "One of the selected products is missing required information. Please select again.",
  COMPARISON_FAILED: "The comparison could not be completed. Please select the products again.",
};

export default function CompareContainer({ currentProduct, demoProducts, attributeDefinitions = [] }) {
  const [productB, setProductB] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const selectorSectionRef = useRef(null);

  useEffect(() => {
    setProductB(null);
    setResult(null);
    setError(null);
  }, [currentProduct?.id]);

  if (!currentProduct?.id) return null;

  function handleSelect(product) {
    setProductB(product);
    setResult(null);
    setError(null);
  }

  function handleCompare() {
    if (!productB) return;
    try {
      const comparison = compareProducts(currentProduct, productB, attributeDefinitions);
      if (comparison.error) {
        setError(comparison.error);
        setResult(null);
        return;
      }
      setError(null);
      setResult(comparison);
    } catch (comparisonError) {
      console.error("Product comparison failed:", comparisonError);
      setError("COMPARISON_FAILED");
      setResult(null);
    }
  }

  function reset() {
    setProductB(null);
    setResult(null);
    setError(null);
  }

  return (
    <>
      <section style={{ minWidth: 0 }}>
        <h3 style={{ fontSize: 16, fontWeight: 900, color: "#0f766e", margin: "0 0 10px" }}>PRODUCT B</h3>
        <div ref={selectorSectionRef} style={{ scrollMarginTop: 100 }}>
          <CompareSelector
            currentProduct={currentProduct}
            demoProducts={demoProducts}
            selectedId={productB?.id || ""}
            onSelect={handleSelect}
          />
        </div>
      </section>
      <div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "center", width: "100%", marginTop: 2 }}>
        <button
          type="button"
          disabled={!productB}
          onClick={handleCompare}
          style={{
            width: "min(62%, 320px)",
            minWidth: 190,
            minHeight: 48,
            padding: "11px 18px",
            borderRadius: 12,
            border: "none",
            fontWeight: 900,
            fontSize: 15,
            color: "#fff",
            background: productB ? "linear-gradient(135deg,#0f4c81,#10b981)" : "#9ca3af",
            boxShadow: productB ? "0 6px 14px rgba(16,185,129,0.25)" : "none",
            cursor: productB ? "pointer" : "not-allowed",
          }}
        >
          Compare now
        </button>
      </div>
      {error && (
        <p role="alert" style={{ gridColumn: "1 / -1", color: error === "CATEGORY_MISMATCH" ? "#b45309" : "#b91c1c", marginTop: 10, fontWeight: 700, fontSize: 13 }}>
          {ERROR_MESSAGES[error] || ERROR_MESSAGES.COMPARISON_FAILED}
        </p>
      )}
      {result && (
        <div style={{ gridColumn: "1 / -1", width: "100%", marginTop: 12 }}>
          <CompareResult
            result={result}
            productA={currentProduct}
            productB={productB}
            onReset={reset}
            onChangeProducts={() => {
              setResult(null);
              setError(null);
              selectorSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
            }}
          />
        </div>
      )}
    </>
  );
}
