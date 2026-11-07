"use client";

import { useMemo, useState } from "react";
import { compareProducts } from "@/components/compare/compareRules";
import CompareResult from "@/components/compare/CompareResult";

// Synthetic data only. This route is a temporary, read-only comparison test.
const DEMO_PRODUCTS = [
  {
    id: "demo-phone-a",
    name: "Demo Smartphone A",
    brand: "Demo",
    categorySlug: "smartphones",
    productType: "smartphone",
    description: "Synthetic sample product for testing the comparison interface.",
    store: [{ name: "Demo Store", price: 14999, offer: "Sample offer", url: "#" }],
    specs: {
      display: "6.5-inch AMOLED (demo)",
      processor: "Demo chipset A",
      ram: "8 GB",
      storage: "128 GB",
      rearCamera: "50 MP (demo)",
      battery: "5000 mAh",
      charging: "33 W (demo)",
      operatingSystem: "Demo OS",
      network: "5G",
    },
    variantDetails: { ram: "8 GB", storage: "128 GB", colour: "Black" },
  },
  {
    id: "demo-phone-b",
    name: "Demo Smartphone B",
    brand: "Demo",
    categorySlug: "smartphones",
    productType: "smartphone",
    description: "Synthetic sample product for testing the comparison interface.",
    store: [{ name: "Demo Store", price: 16999, offers: ["Sample offer"] }],
    specs: {
      display: "6.7-inch AMOLED (demo)",
      processor: "Demo chipset B",
      ram: "8 GB",
      storage: "256 GB",
      rearCamera: "64 MP (demo)",
      battery: "5000 mAh",
      charging: "45 W (demo)",
      operatingSystem: "Demo OS",
      network: "5G",
    },
    variantDetails: { ram: "8 GB", storage: "256 GB", color: "Blue" },
  },
  {
    id: "demo-phone-c",
    name: "Demo Smartphone C",
    brand: "Demo",
    categorySlug: "smartphones",
    productType: "smartphone",
    description: "Synthetic sample product with intentionally incomplete specifications.",
    store: [{ name: "Demo Store", price: null }],
    specs: { display: "6.4-inch LCD (demo)", ram: "6 GB", storage: "128 GB" },
  },
];

export default function CompareTestPage() {
  const [productAId, setProductAId] = useState(DEMO_PRODUCTS[0].id);
  const [productBId, setProductBId] = useState(DEMO_PRODUCTS[1].id);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const productA = useMemo(
    () => DEMO_PRODUCTS.find((product) => product.id === productAId),
    [productAId]
  );
  const productB = useMemo(
    () => DEMO_PRODUCTS.find((product) => product.id === productBId),
    [productBId]
  );

  function runComparison() {
    if (!productA || !productB || productA.id === productB.id) {
      setResult(null);
      setError("Choose two different products.");
      return;
    }
    const comparison = compareProducts(productA, productB);
    if (comparison.error) {
      setResult(null);
      setError(comparison.error);
      return;
    }
    setError("");
    setResult(comparison);
  }

  function changeProductA(value) {
    setProductAId(value);
    setResult(null);
    setError("");
  }

  function changeProductB(value) {
    setProductBId(value);
    setResult(null);
    setError("");
  }

  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: "24px 16px 48px", color: "#123047" }}>
      <div style={{ padding: 18, borderRadius: 18, background: "#ecfdf8", border: "1px solid #7ddfd0" }}>
        <p style={{ margin: "0 0 6px", color: "#0f766e", fontWeight: 800, letterSpacing: 1 }}>OODLESNET · INTERNAL PREVIEW TEST</p>
        <h1 style={{ margin: "0 0 8px", fontSize: 26, fontWeight: 900 }}>Product comparison test</h1>
        <p style={{ margin: 0, lineHeight: 1.5 }}>
          This page uses synthetic demo products only. It does not read or write Firestore and does not change the live website.
        </p>
      </div>

      <section style={{ marginTop: 20, padding: 18, border: "1px solid #cbd5e1", borderRadius: 18, background: "#fff" }}>
        <label htmlFor="demo-product-a" style={{ display: "block", fontWeight: 800, marginBottom: 7 }}>Product A</label>
        <select id="demo-product-a" value={productAId} onChange={(event) => changeProductA(event.target.value)} style={{ width: "100%", padding: 12, borderRadius: 10, border: "1px solid #94a3b8", marginBottom: 16, background: "#fff" }}>
          {DEMO_PRODUCTS.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}
        </select>

        <label htmlFor="demo-product-b" style={{ display: "block", fontWeight: 800, marginBottom: 7 }}>Product B</label>
        <select id="demo-product-b" value={productBId} onChange={(event) => changeProductB(event.target.value)} style={{ width: "100%", padding: 12, borderRadius: 10, border: "1px solid #94a3b8", background: "#fff" }}>
          {DEMO_PRODUCTS.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}
        </select>

        <button type="button" onClick={runComparison} style={{ width: "100%", marginTop: 16, padding: 14, border: 0, borderRadius: 12, color: "#fff", fontWeight: 900, fontSize: 16, background: "linear-gradient(135deg,#0f4c81,#10b981)" }}>
          Compare products
        </button>
        {error && <p role="alert" style={{ color: "#b91c1c", fontWeight: 700 }}>{error}</p>}
      </section>

      {result && <CompareResult result={result} productA={productA} productB={productB} onReset={() => setResult(null)} />}

      <p style={{ marginTop: 20, fontSize: 13, color: "#64748b", lineHeight: 1.5 }}>
        Demo prices and specifications are invented test values, not real product information. Any score shown is only a test of the current comparison rules.
      </p>
    </main>
  );
}
