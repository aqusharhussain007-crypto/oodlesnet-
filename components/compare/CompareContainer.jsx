"use client";

import { useState } from "react";
import { compareProducts } from "./compareRules";
import CompareSelector from "./CompareSelector";
import CompareResult from "./CompareResult";

export default function CompareContainer({ currentProduct }) {
  const [productB, setProductB] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

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
    <div style={{ marginTop: 32 }}>
      <h3 className="section-title">
        Not sure between two options?
      </h3>

      <CompareSelector
        selected={productB}
        onSelect={setProductB}
        excludeId={currentProduct.id}
        category={currentProduct.categorySlug}
      />

      <button
        disabled={!productB}
        onClick={handleCompare}
        style={{ marginTop: 12 }}
      >
        Compare
      </button>

      {error === "CATEGORY_MISMATCH" && (
        <p style={{ color: "orange", marginTop: 8 }}>
          Comparison works best within the same category.
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
          
