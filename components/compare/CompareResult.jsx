function safeDisplayValue(value) {
  if (value === undefined || value === null) return "Not available";
  if (typeof value === "string" && value.trim() === "") return "Not available";
  if (Array.isArray(value)) {
    const formatted = value.map(safeDisplayValue).filter((item) => item !== "Not available");
    return formatted.length ? formatted.join(", ") : "Not available";
  }
  if (typeof value === "object") {
    try {
      return JSON.stringify(value);
    } catch {
      return "Not available";
    }
  }
  return String(value);
}

function safeCount(value) {
  return Number.isFinite(value) && value >= 0 ? value : 0;
}

function comparisonCellStyle(valueA, valueB) {
  const displayA = safeDisplayValue(valueA);
  const displayB = safeDisplayValue(valueB);
  const differs =
    displayA !== displayB &&
    (displayA !== "Not available" || displayB !== "Not available");

  return {
    padding: 12,
    borderBottom: "1px solid #e5e7eb",
    background: differs ? "#fff7ed" : "#ffffff",
    verticalAlign: "top",
    lineHeight: 1.5,
  };
}

const rowHeadingStyle = {
  position: "sticky",
  left: 0,
  zIndex: 1,
  minWidth: 120,
  width: 120,
  maxWidth: 120,
  textAlign: "left",
  padding: 12,
  borderBottom: "1px solid #e5e7eb",
  background: "#f8fafc",
  boxShadow: "2px 0 4px rgba(15, 23, 42, 0.06)",
};

export default function CompareResult({
  result,
  productA,
  productB,
  onReset,
  onChangeProducts,
}) {
  if (
    !result ||
    !productA ||
    !productB ||
    !result.totals ||
    typeof result.totals !== "object"
  ) {
    return (
      <div role="alert" style={{ marginTop: 16, color: "#b91c1c" }}>
        Comparison data is incomplete. Please select the products again.
      </div>
    );
  }

  const totalA = safeCount(result.totals.A);
  const totalB = safeCount(result.totals.B);
  const maxScore =
    Number.isFinite(result.maxScore) && result.maxScore > 0
      ? result.maxScore
      : 3;
  const percentA = Math.max(0, Math.min(100, (totalA / maxScore) * 100));
  const percentB = Math.max(0, Math.min(100, (totalB / maxScore) * 100));
  const winner = ["A", "B"].includes(result.winner) ? result.winner : "tie";
  const productAName = productA.name || "Product A";
  const productBName = productB.name || "Product B";
  const winnerProduct = winner === "A" ? productA : winner === "B" ? productB : null;

  const specifications =
    result.specifications && typeof result.specifications === "object"
      ? result.specifications
      : {};
  const variants =
    result.variants && typeof result.variants === "object" ? result.variants : {};
  const rowsA = Array.isArray(specifications.A) ? specifications.A : [];
  const rowsB = Array.isArray(specifications.B) ? specifications.B : [];
  const variantA = Array.isArray(variants.A) ? variants.A : [];
  const variantB = Array.isArray(variants.B) ? variants.B : [];

  const specRows = [
    ...new Map(
      [...rowsA, ...rowsB]
        .filter((item) => item && typeof item.key === "string" && item.key.trim())
        .map((item) => [
          item.key,
          { key: item.key, label: item.label || item.key },
        ])
    ).values(),
  ];

  const variantRows = [
    ...new Map(
      [...variantA, ...variantB]
        .filter((item) => item && typeof item.key === "string" && item.key.trim())
        .filter((item) => !specRows.some((field) => field.key === item.key))
        .map((item) => [
          item.key,
          { key: item.key, label: item.label || item.key },
        ])
    ).values(),
  ];

  const valueFor = (specItems, variantItems, key) => {
    const specValue = specItems.find((item) => item && item.key === key)?.value;
    if (specValue !== undefined && specValue !== null && specValue !== "") {
      return specValue;
    }
    return variantItems.find((item) => item && item.key === key)?.value ?? null;
  };
  const retailerA = safeCount(result.retailerCoverage?.A);
  const retailerB = safeCount(result.retailerCoverage?.B);
  const scoreA = result.scores?.A && typeof result.scores.A === "object" ? result.scores.A : {};
  const scoreB = result.scores?.B && typeof result.scores.B === "object" ? result.scores.B : {};
  const priceA = result.priceComparison?.A;
  const priceB = result.priceComparison?.B;
  const hasBothPrices = Number.isFinite(priceA) && priceA > 0 && Number.isFinite(priceB) && priceB > 0;
  const formatPrice = (value) =>
    Number.isFinite(value) && value > 0
      ? new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value)
      : "Not available";
  const pricePointsA = safeCount(scoreA.price);
  const pricePointsB = safeCount(scoreB.price);
  const offerPointsA = safeCount(scoreA.offers);
  const offerPointsB = safeCount(scoreB.offers);

  return (
    <div
      style={{
        marginTop: 20,
        padding: 18,
        borderRadius: 18,
        background: "#ffffff",
        border: "1px solid #e5e7eb",
        boxShadow: "0 10px 24px rgba(0,0,0,0.12)",
      }}
    >
      <p style={{ fontSize: 12, color: "#64748b", marginBottom: 10 }}>
        Price-and-offer score based only on listed prices and offer availability — not a product-quality rating.
      </p>

      {winner === "tie" ? (
        <p style={{ fontWeight: 900 }}>
          🤝 Both products have the same price-and-offer score.
        </p>
      ) : (
        <p style={{ fontWeight: 900, fontSize: 16 }}>
          🏆 Higher price-and-offer score:
          <br />
          <span style={{ color: "#16a34a" }}>
            {winnerProduct?.name || "Selected product"}
          </span>
        </p>
      )}

      <div style={{ marginTop: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 700 }}>
          {productAName} — {totalA}/{maxScore}
        </div>
        <div
          style={{
            height: 10,
            borderRadius: 999,
            background: "#e5e7eb",
            overflow: "hidden",
            marginBottom: 10,
          }}
        >
          <div
            style={{
              width: `${percentA}%`,
              height: "100%",
              background: "#2563eb",
            }}
          />
        </div>
        <div style={{ fontSize: 13, fontWeight: 700 }}>
          {productBName} — {totalB}/{maxScore}
        </div>
        <div
          style={{
            height: 10,
            borderRadius: 999,
            background: "#e5e7eb",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${percentB}%`,
              height: "100%",
              background: "#16a34a",
            }}
          />
        </div>
      </div>

      <section
        aria-label="Price and offer score breakdown"
        style={{ marginTop: 20, padding: 14, borderRadius: 14, background: "#f8fafc", border: "1px solid #e2e8f0" }}
      >
        <h4 style={{ margin: "0 0 10px", fontSize: 15, fontWeight: 900 }}>
          Why these scores?
        </h4>
        <p style={{ margin: "0 0 12px", fontSize: 12, color: "#64748b", lineHeight: 1.5 }}>
          The score uses listed price and offer availability only. It does not judge performance or product quality.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, fontSize: 12 }}>
          <div style={{ minWidth: 0 }}>
            <strong>{productAName}</strong>
            <p style={{ margin: "6px 0 4px" }}>Price advantage: {pricePointsA}/2</p>
            <p style={{ margin: "0 0 4px" }}>Offer availability: {offerPointsA}/1</p>
            <p style={{ margin: 0, color: "#64748b" }}>Total: {totalA}/{maxScore}</p>
          </div>
          <div style={{ minWidth: 0 }}>
            <strong>{productBName}</strong>
            <p style={{ margin: "6px 0 4px" }}>Price advantage: {pricePointsB}/2</p>
            <p style={{ margin: "0 0 4px" }}>Offer availability: {offerPointsB}/1</p>
            <p style={{ margin: 0, color: "#64748b" }}>Total: {totalB}/{maxScore}</p>
          </div>
        </div>
        <div style={{ marginTop: 12, paddingTop: 10, borderTop: "1px solid #e2e8f0", fontSize: 12, color: "#475569", lineHeight: 1.55 }}>
          <strong>Lowest listed prices:</strong> {productAName}: {formatPrice(priceA)} · {productBName}: {formatPrice(priceB)}
          <p style={{ margin: "6px 0 0" }}>
            Price points: 2 points when one price is at least 10% lower; 1 point when it is 2% to under 10% lower; otherwise 0. Offer availability adds 1 point only when just one product has an offer.
          </p>
          {!hasBothPrices && (
            <p style={{ margin: "6px 0 0" }}>
              A price advantage is not awarded unless both products have valid listed prices.
            </p>
          )}
        </div>
      </section>

      <h4 style={{ marginTop: 24, marginBottom: 10, fontSize: 16, fontWeight: 900 }}>
        Compare product specifications
      </h4>
      <p style={{ margin: "0 0 8px", fontSize: 11, color: "#64748b" }}>
        On mobile, each specification is shown as a readable product-by-product card. Highlighted values differ; this does not indicate which product is better.
      </p>
      <div className="comparison-desktop-table" style={{ overflowX: "auto", width: "100%", borderRadius: 10, overscrollBehaviorX: "contain" }}>
        <table
          aria-label="Product specification comparison"
          style={{ width: "100%", minWidth: 480, tableLayout: "fixed", borderCollapse: "collapse", fontSize: 13 }}
        >
          <thead>
            <tr>
              <th scope="col" style={{ position: "sticky", left: 0, zIndex: 3, minWidth: 112, width: 112, maxWidth: 112, textAlign: "left", verticalAlign: "top", padding: 10, lineHeight: 1.35, background: "#eaf0f7", boxShadow: "2px 0 4px rgba(15, 23, 42, 0.06)", overflowWrap: "anywhere" }}>Specification</th>
              <th scope="col" style={{ textAlign: "left", verticalAlign: "top", padding: 10, width: 184, minWidth: 184, background: "#f1f5f9", lineHeight: 1.35, overflowWrap: "anywhere", wordBreak: "break-word" }}>
                <span style={{ display: "block", fontSize: 10, color: "#64748b", marginBottom: 4 }}>PRODUCT A</span>{productAName}
              </th>
              <th scope="col" style={{ textAlign: "left", verticalAlign: "top", padding: 10, width: 184, minWidth: 184, background: "#f1f5f9", lineHeight: 1.35, overflowWrap: "anywhere", wordBreak: "break-word" }}>
                <span style={{ display: "block", fontSize: 10, color: "#64748b", marginBottom: 4 }}>PRODUCT B</span>{productBName}
              </th>
            </tr>
          </thead>
          <tbody>
            {variantRows.map((field) => (
              <tr key={`variant-${field.key}`}>
                <th scope="row" style={rowHeadingStyle}>{field.label} (variant)</th>
                <td style={comparisonCellStyle(valueFor(rowsA, variantA, field.key), valueFor(rowsB, variantB, field.key))}>{safeDisplayValue(valueFor(rowsA, variantA, field.key))}</td>
                <td style={comparisonCellStyle(valueFor(rowsB, variantB, field.key), valueFor(rowsA, variantA, field.key))}>{safeDisplayValue(valueFor(rowsB, variantB, field.key))}</td>
              </tr>
            ))}
            {specRows.map((field) => (
              <tr key={`spec-${field.key}`}>
                <th scope="row" style={rowHeadingStyle}>{field.label}</th>
                <td style={comparisonCellStyle(valueFor(rowsA, variantA, field.key), valueFor(rowsB, variantB, field.key))}>{safeDisplayValue(valueFor(rowsA, variantA, field.key))}</td>
                <td style={comparisonCellStyle(valueFor(rowsB, variantB, field.key), valueFor(rowsA, variantA, field.key))}>{safeDisplayValue(valueFor(rowsB, variantB, field.key))}</td>
              </tr>
            ))}
            {!variantRows.length && !specRows.length && (
              <tr><td colSpan={3} style={{ padding: 12, color: "#64748b" }}>No structured specifications are available for these products yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="comparison-mobile-cards">
        {[...variantRows.map((field) => ({ ...field, isVariant: true })), ...specRows].map((field) => {
          const valueA = valueFor(rowsA, variantA, field.key);
          const valueB = valueFor(rowsB, variantB, field.key);
          return (
            <section key={`mobile-${field.key}`} className="comparison-mobile-row">
              <h5>{field.label}{field.isVariant ? " (variant)" : ""}</h5>
              <div className="comparison-mobile-values">
                <div className="comparison-mobile-value" style={comparisonCellStyle(valueA, valueB)}>
                  <span>PRODUCT A · {productAName}</span>
                  <p>{safeDisplayValue(valueA)}</p>
                </div>
                <div className="comparison-mobile-value" style={comparisonCellStyle(valueB, valueA)}>
                  <span>PRODUCT B · {productBName}</span>
                  <p>{safeDisplayValue(valueB)}</p>
                </div>
              </div>
            </section>
          );
        })}
        {!variantRows.length && !specRows.length && (
          <p style={{ padding: 12, color: "#64748b" }}>No structured specifications are available for these products yet.</p>
        )}
      </div>
      <style jsx>{`
        .comparison-mobile-cards { display: none; }
        @media (max-width: 640px) {
          .comparison-desktop-table { display: none; }
          .comparison-mobile-cards { display: grid; gap: 10px; }
          .comparison-mobile-row { min-width: 0; overflow: hidden; border: 1px solid #e2e8f0; border-radius: 12px; background: #fff; }
          .comparison-mobile-row h5 { margin: 0; padding: 11px 12px; background: #eaf0f7; color: #172033; font-size: 14px; font-weight: 800; overflow-wrap: anywhere; }
          .comparison-mobile-values { display: grid; grid-template-columns: 1fr 1fr; }
          .comparison-mobile-value { min-width: 0; padding: 10px !important; overflow-wrap: anywhere; word-break: break-word; font-size: 12px; }
          .comparison-mobile-value + .comparison-mobile-value { border-left: 1px solid #e5e7eb; }
          .comparison-mobile-value span { display: block; margin-bottom: 6px; color: #64748b; font-size: 10px; font-weight: 800; line-height: 1.35; }
          .comparison-mobile-value p { margin: 0; line-height: 1.5; }
        }
      `}</style>

      <p style={{ marginTop: 10, fontSize: 12, color: "#64748b" }}>
        Specifications appear only when supplied in the product record. Missing values are not estimated.
      </p>

      <h4 style={{ marginTop: 22, marginBottom: 8, fontSize: 15, fontWeight: 900 }}>
        Retailer coverage
      </h4>
      <p style={{ fontSize: 13, color: "#475569" }}>
        {productAName}: {retailerA} listed stores
        {" · "}
        {productBName}: {retailerB} listed stores
      </p>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 16 }}>
        {typeof onChangeProducts === "function" && (
        <button
          type="button"
          onClick={onChangeProducts}
          style={{
            flex: "1 1 180px",
            padding: "11px 14px",
            borderRadius: 999,
            border: "1px solid #0f766e",
            background: "#ecfdf5",
            fontWeight: 800,
            color: "#065f46",
          }}
        >
          Change compared product
        </button>
        )}
        <button
          type="button"
          onClick={() => onReset?.()}
          style={{
            flex: "1 1 140px",
            padding: "11px 14px",
            borderRadius: 999,
            border: "1px solid #cbd5e1",
            background: "#f8fafc",
            fontWeight: 800,
            color: "#334155",
          }}
        >
          Reset comparison
        </button>
      </div>
    </div>
  );
}
