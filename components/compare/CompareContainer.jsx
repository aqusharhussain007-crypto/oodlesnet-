"use client";

import { useEffect, useRef, useState } from "react";
import CompareSelector from "./CompareSelector";
import MultiCompareResult from "./MultiCompareResult";

const MAX_PRODUCTS = 4;

export default function CompareContainer({ currentProduct, demoProducts, attributeDefinitions = [] }) {
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [slotCount, setSlotCount] = useState(1);
  const [resultReady, setResultReady] = useState(false);
  const [error, setError] = useState(null);
  const selectorRefs = useRef([]);

  useEffect(() => {
    setSelectedProducts([]);
    setSlotCount(1);
    setResultReady(false);
    setError(null);
  }, [currentProduct?.id]);

  if (!currentProduct?.id) return null;

  const allSelected = [currentProduct, ...selectedProducts.filter(Boolean)];
  const uniqueSelected = allSelected.filter((product, index, list) =>
    list.findIndex((item) => item?.id === product?.id) === index
  );

  function handleSelect(index, product) {
    setSelectedProducts((previous) => {
      const next = [...previous];
      next[index] = product || null;
      return next;
    });
    setResultReady(false);
    setError(null);
  }

  function handleCompare() {
    if (uniqueSelected.length < 2) return;
    setError(null);
    setResultReady(true);
  }

  function reset() {
    setSelectedProducts([]);
    setSlotCount(1);
    setResultReady(false);
    setError(null);
  }

  return (
    <>
      <section style={{ minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 10 }}>
          <h3 style={{ fontSize: 16, fontWeight: 900, color: "#0f766e", margin: 0 }}>PRODUCT B{slotCount > 1 ? "–D" : ""}</h3>
          <span style={{ fontSize: 11, color: "#64748b", fontWeight: 700 }}>Up to {MAX_PRODUCTS} products</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 210px), 1fr))", gap: 12, minWidth: 0 }}>
          {Array.from({ length: slotCount }, (_, index) => {
            const excludedIds = new Set([currentProduct.id, ...selectedProducts.filter((p) => p && p.id !== selectedProducts[index]?.id).map((p) => p.id)]);
            const availableProducts = (demoProducts || []).filter((product) => !excludedIds.has(product.id));
            return (
              <section key={index} ref={(node) => { selectorRefs.current[index] = node; }} style={{ minWidth: 0, border: "1px solid #dbe3ec", borderRadius: 12, padding: 10, background: "#ffffff" }}>
                <div style={{ fontSize: 12, fontWeight: 900, color: "#0f766e", marginBottom: 6 }}>PRODUCT {String.fromCharCode(66 + index)}</div>
                <CompareSelector
                  currentProduct={currentProduct}
                  demoProducts={availableProducts}
                  selectedId={selectedProducts[index]?.id || ""}
                  onSelect={(product) => handleSelect(index, product)}
                />
              </section>
            );
          })}
        </div>
        {slotCount < MAX_PRODUCTS && (
          <button type="button" onClick={() => { setSlotCount((count) => Math.min(MAX_PRODUCTS - 1, count + 1)); setResultReady(false); }} style={{ marginTop: 12, padding: "10px 15px", borderRadius: 999, border: "1px solid #0d9488", background: "#ecfdf5", color: "#065f46", fontWeight: 800 }}>
            + Add another product
          </button>
        )}
        {slotCount > 1 && (
          <button type="button" onClick={() => { setSlotCount(1); setSelectedProducts((items) => items.slice(0, 1)); setResultReady(false); }} style={{ marginLeft: 8, marginTop: 12, padding: "10px 15px", borderRadius: 999, border: "1px solid #cbd5e1", background: "#fff", color: "#475569", fontWeight: 800 }}>
            Remove extra slots
          </button>
        )}
      </section>
      <div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "center", width: "100%", marginTop: 10 }}>
        <button type="button" disabled={uniqueSelected.length < 2} onClick={handleCompare} style={{ width: "min(72%, 340px)", minWidth: 190, minHeight: 48, padding: "11px 18px", borderRadius: 12, border: 0, fontWeight: 900, fontSize: 15, color: "#fff", background: uniqueSelected.length >= 2 ? "linear-gradient(135deg,#0f4c81,#10b981)" : "#9ca3af", boxShadow: uniqueSelected.length >= 2 ? "0 6px 14px rgba(16,185,129,.25)" : "none", cursor: uniqueSelected.length >= 2 ? "pointer" : "not-allowed" }}>
          Compare {uniqueSelected.length} products
        </button>
      </div>
      {error && <p role="alert" style={{ gridColumn: "1 / -1", color: "#b91c1c", marginTop: 10, fontWeight: 700, fontSize: 13 }}>{error}</p>}
      {resultReady && (
        <div style={{ gridColumn: "1 / -1", width: "100%", marginTop: 12 }}>
          <MultiCompareResult
            products={uniqueSelected}
            attributeDefinitions={attributeDefinitions}
            onReset={reset}
            onChangeProducts={() => {
              setResultReady(false);
              selectorRefs.current[0]?.scrollIntoView({ behavior: "smooth", block: "center" });
            }}
          />
        </div>
      )}
    </>
  );
}
