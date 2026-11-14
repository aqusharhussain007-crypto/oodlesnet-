"use client";

import { compareProducts, canCompare } from "./compareRules";
import { getComparisonSpecRows, getProductVariant } from "./compareSpecTemplates";
import { getLowestPrice, getStoreCount } from "./compareUtils";

const unavailable = "Not available";
const requireCompatibility = canCompare;
function display(value) {
  if (value === undefined || value === null || value === "") return unavailable;
  if (Array.isArray(value)) return value.map(display).filter((v) => v !== unavailable).join(", ") || unavailable;
  if (typeof value === "object") { try { return JSON.stringify(value); } catch { return unavailable; } }
  return String(value);
}
function money(value) {
  return Number.isFinite(value) && value > 0
    ? new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value)
    : unavailable;
}

export default function MultiCompareResult({ products, attributeDefinitions = [], onReset, onChangeProducts }) {
  if (!Array.isArray(products) || products.length < 2) return null;
  const rows = products.map((product) => ({
    product,
    specs: getComparisonSpecRows(product, attributeDefinitions),
    variants: getProductVariant(product),
    price: getLowestPrice(product),
    stores: getStoreCount(product),
    score: 0,
  }));
  const pairErrors = [];
  const relatedPairs = [];
  for (let i = 0; i < products.length; i += 1) {
    for (let j = i + 1; j < products.length; j += 1) {
      const check = requireCompatibility(products[i], products[j]);
      if (check?.match === "related") relatedPairs.push([products[i].name, products[j].name]);
    }
  }
  for (let i = 0; i < products.length; i += 1) {
    for (let j = i + 1; j < products.length; j += 1) {
      const pair = compareProducts(products[i], products[j], attributeDefinitions);
      if (pair.error) { pairErrors.push(pair.error); continue; }
      rows[i].score += Number(pair.totals?.A || 0);
      rows[j].score += Number(pair.totals?.B || 0);
    }
  }
  const maxScore = 3 * (products.length - 1);
  const bestScore = Math.max(...rows.map((row) => row.score));
  const leaders = rows.filter((row) => row.score === bestScore);
  const allFields = [...new Map(rows.flatMap((row) => [...row.variants, ...row.specs])
    .filter((field) => field?.key)
    .map((field) => [field.key, { key: field.key, label: field.label || field.key }])).values()];
  const valueFor = (row, key) => {
    const spec = row.specs.find((field) => field.key === key);
    if (spec && spec.value !== undefined && spec.value !== null && spec.value !== "") return spec.value;
    return row.variants.find((field) => field.key === key)?.value;
  };

  return (
    <section style={{ marginTop: 18, padding: 14, borderRadius: 16, background: "#fff", border: "1px solid #dbe3ec", boxShadow: "0 8px 22px rgba(0,0,0,.08)", minWidth: 0 }}>
      <h3 style={{ margin: "0 0 8px", fontSize: 19, fontWeight: 900, color: "#0f766e" }}>Side-by-side product comparison</h3>
      <p style={{ margin: "0 0 12px", color: "#64748b", fontSize: 12, lineHeight: 1.5 }}>Compare {products.length} products. Swipe horizontally on mobile to view every product column. Missing specifications are not estimated.</p>
      {relatedPairs.length > 0 && <p style={{ margin: "0 0 10px", padding: 9, borderRadius: 8, background: "#eff6ff", color: "#1e40af", fontSize: 12 }}>Related footwear types are being compared. Check the product type labels when interpreting differences.</p>}
      {pairErrors.length > 0 && <p role="alert" style={{ color: "#b91c1c" }}>One or more product pairs could not be scored. Check that all selected products share the same assigned product type.</p>}
      <h4 style={{ margin: "18px 0 8px", fontSize: 15, fontWeight: 900 }}>Product and specification comparison</h4>
      <p style={{ margin: "0 0 8px", color: "#64748b", fontSize: 11 }}>Swipe this shared area sideways. Each product card stays aligned with its specification column.</p>
      <div aria-label="Swipe horizontally to compare product summaries and specifications" style={{ display: "block", width: "100%", maxWidth: "100%", overflowX: "auto", overflowY: "hidden", border: "1px solid #e2e8f0", borderRadius: 10, WebkitOverflowScrolling: "touch", overscrollBehaviorX: "contain", touchAction: "pan-x" }}>
        <div style={{ display: "flex", alignItems: "stretch", gap: 0, width: 150 + rows.length * 190, minWidth: 150 + rows.length * 190, padding: "10px 0 12px", boxSizing: "border-box", background: "#fff" }}>
          <div aria-hidden="true" style={{ flex: "0 0 150px", width: 150 }} />
          {rows.map((row, index) => (
            <article key={row.product.id} style={{ flex: "0 0 190px", width: 190, minWidth: 190, boxSizing: "border-box", margin: 0, border: "1px solid #dbe3ec", borderRadius: 12, padding: 10, background: "#f8fafc" }}>
              <div style={{ fontSize: 11, color: "#0f766e", fontWeight: 900 }}>PRODUCT {String.fromCharCode(65 + index)}</div>
              <div style={{ height: 100, margin: "7px 0", background: "#fff", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                {row.product.imageUrl ? <img src={row.product.imageUrl} alt={row.product.name || "Product"} style={{ width: "100%", height: "100%", objectFit: "contain" }} /> : <span style={{ color: "#94a3b8", fontSize: 12 }}>No image</span>}
              </div>
              <div style={{ minHeight: 52, fontSize: 13, fontWeight: 800, lineHeight: 1.35, overflowWrap: "anywhere" }}>{row.product.name || "Unnamed product"}</div>
              <div style={{ marginTop: 7, fontSize: 13, fontWeight: 900, color: "#0f766e" }}>{money(row.price)}</div>
              <div style={{ marginTop: 4, fontSize: 11, color: "#64748b" }}>{row.stores} listed stores</div>
              <div style={{ marginTop: 8, padding: 7, borderRadius: 8, background: "#ecfdf5", fontSize: 12, fontWeight: 800 }}>{row.score}/{maxScore} comparison points</div>
            </article>
          ))}
        </div>
        <table style={{ borderCollapse: "collapse", tableLayout: "fixed", minWidth: 150 + rows.length * 190, width: 150 + rows.length * 190, fontSize: 12 }}>
          <thead><tr>
            <th style={{ position: "sticky", left: 0, zIndex: 2, width: 150, minWidth: 150, padding: 10, textAlign: "left", background: "#eaf0f7" }}>Specification</th>
            {rows.map((row, index) => <th key={row.product.id} style={{ width: 190, minWidth: 190, padding: 10, textAlign: "left", verticalAlign: "top", background: "#f1f5f9" }}>PRODUCT {String.fromCharCode(65 + index)}<br />{row.product.name}</th>)}
          </tr></thead>
          <tbody>
            {allFields.map((field) => {
              const values = rows.map((row) => display(valueFor(row, field.key)));
              const hasDifference = new Set(values.filter((v) => v !== unavailable)).size > 1;
              return <tr key={field.key}>
                <th scope="row" style={{ position: "sticky", left: 0, zIndex: 1, padding: 10, textAlign: "left", verticalAlign: "top", background: "#f8fafc", borderTop: "1px solid #e2e8f0" }}>{field.label}</th>
                {values.map((value, index) => <td key={rows[index].product.id} style={{ padding: 10, verticalAlign: "top", lineHeight: 1.45, overflowWrap: "anywhere", background: hasDifference && value !== unavailable ? "#fff7ed" : "#fff", borderTop: "1px solid #e2e8f0" }}>{value}</td>)}
              </tr>;
            })}
            {!allFields.length && <tr><td colSpan={rows.length + 1} style={{ padding: 12, color: "#64748b" }}>No structured specifications are available yet.</td></tr>}
          </tbody>
        </table>
      </div>
      <h4 style={{ margin: "16px 0 6px", fontSize: 15, fontWeight: 900 }}>Price-and-offer score leader</h4>
      <p style={{ margin: 0, color: "#475569", fontSize: 13, lineHeight: 1.5 }}>
        {leaders.length === rows.length ? "All selected products are tied." : leaders.map((row) => row.product.name).join(", ") + " lead(s) with " + bestScore + "/" + maxScore + " points."}
        {" "}Scores are accumulated from pairwise listed-price and offer comparisons, not product-quality ratings.
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 9, marginTop: 16 }}>
        <button type="button" onClick={onChangeProducts} style={{ flex: "1 1 180px", padding: 11, borderRadius: 999, border: "1px solid #0f766e", background: "#ecfdf5", color: "#065f46", fontWeight: 800 }}>Change products</button>
        <button type="button" onClick={onReset} style={{ flex: "1 1 140px", padding: 11, borderRadius: 999, border: "1px solid #cbd5e1", background: "#f8fafc", color: "#334155", fontWeight: 800 }}>Reset comparison</button>
      </div>
    </section>
  );
}
