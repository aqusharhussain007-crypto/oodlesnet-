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

export default function CompareResult({
  result,
  productA,
  productB,
  onReset,
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

  const variantRows = [
    ...new Map(
      [...variantA, ...variantB]
        .filter((item) => item && typeof item.key === "string" && item.key.trim())
        .map((item) => [
          item.key,
          { key: item.key, label: item.label || item.key },
        ])
    ).values(),
  ];

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

  const variantValue = (items, key) =>
    items.find((item) => item && item.key === key)?.value ?? null;
  const specValue = (items, key) =>
    items.find((item) => item && item.key === key)?.value ?? null;
  const retailerA = safeCount(result.retailerCoverage?.A);
  const retailerB = safeCount(result.retailerCoverage?.B);

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
        Listed-value indicator based on available prices and offers — not a
        technical quality rating.
      </p>

      {winner === "tie" ? (
        <p style={{ fontWeight: 900 }}>
          🤝 Both products have a similar listed-value score.
        </p>
      ) : (
        <p style={{ fontWeight: 900, fontSize: 16 }}>
          🏆 Higher listed-value score:
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

      <h4 style={{ marginTop: 24, marginBottom: 10, fontSize: 16, fontWeight: 900 }}>
        Compare product specifications
      </h4>
      <div style={{ overflowX: "auto", width: "100%" }}>
        <table
          style={{
            width: "100%",
            minWidth: 420,
            borderCollapse: "collapse",
            fontSize: 13,
          }}
        >
          <thead>
            <tr>
              <th scope="col" style={{ textAlign: "left", padding: 10, background: "#f1f5f9" }}>
                Specification
              </th>
              <th scope="col" style={{ textAlign: "left", padding: 10, background: "#f1f5f9" }}>
                {productAName}
              </th>
              <th scope="col" style={{ textAlign: "left", padding: 10, background: "#f1f5f9" }}>
                {productBName}
              </th>
            </tr>
          </thead>
          <tbody>
            {variantRows.map((field) => (
              <tr key={`variant-${field.key}`}>
                <th scope="row" style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #e5e7eb" }}>
                  {field.label} (variant)
                </th>
                <td style={{ padding: 10, borderBottom: "1px solid #e5e7eb" }}>
                  {safeDisplayValue(variantValue(variantA, field.key))}
                </td>
                <td style={{ padding: 10, borderBottom: "1px solid #e5e7eb" }}>
                  {safeDisplayValue(variantValue(variantB, field.key))}
                </td>
              </tr>
            ))}
            {specRows.map((field) => (
              <tr key={`spec-${field.key}`}>
                <th scope="row" style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #e5e7eb" }}>
                  {field.label}
                </th>
                <td style={{ padding: 10, borderBottom: "1px solid #e5e7eb" }}>
                  {safeDisplayValue(specValue(rowsA, field.key))}
                </td>
                <td style={{ padding: 10, borderBottom: "1px solid #e5e7eb" }}>
                  {safeDisplayValue(specValue(rowsB, field.key))}
                </td>
              </tr>
            ))}
            {!variantRows.length && !specRows.length && (
              <tr>
                <td colSpan={3} style={{ padding: 12, color: "#64748b" }}>
                  No structured specifications are available for these products yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

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

      <button
        type="button"
        onClick={() => onReset?.()}
        style={{
          marginTop: 16,
          padding: "10px 16px",
          borderRadius: 999,
          border: "1px solid #10b981",
          background: "#ecfdf5",
          fontWeight: 800,
          color: "#065f46",
        }}
      >
        Compare another
      </button>
    </div>
  );
}
