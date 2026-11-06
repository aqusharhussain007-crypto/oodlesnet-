export default function CompareResult({
  result,
  productA,
  productB,
  onReset,
}) {
  const { totals, winner, maxScore = 3, specifications = {}, variants = {} } = result;

  const safeMaxScore =
    Number.isFinite(maxScore) && maxScore > 0 ? maxScore : 3;
  const percentA = Math.max(0, Math.min(100, (totals.A / safeMaxScore) * 100));
  const percentB = Math.max(0, Math.min(100, (totals.B / safeMaxScore) * 100));

  let winnerProduct = null;
  if (winner === "A") winnerProduct = productA;
  if (winner === "B") winnerProduct = productB;

  const rowsA = Array.isArray(specifications.A) ? specifications.A : [];
  const rowsB = Array.isArray(specifications.B) ? specifications.B : [];
  const specRows = rowsA.length ? rowsA : rowsB;
  const variantA = Array.isArray(variants.A) ? variants.A : [];
  const variantB = Array.isArray(variants.B) ? variants.B : [];
  const variantRows = [
    ...new Map(
      [...variantA, ...variantB].map((item) => [
        item.key,
        { key: item.key, label: item.label || item.key },
      ])
    ).values(),
  ];
  const variantValue = (items, key) =>
    items.find((item) => item.key === key)?.value ?? null;
  const displayValue = (value) =>
    value === undefined || value === null || String(value).trim() === ""
      ? "Not available"
      : String(value);

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
          {productA.name} — {totals.A}/{safeMaxScore}
        </div>
        <div style={{ height: 10, borderRadius: 999, background: "#e5e7eb", overflow: "hidden", marginBottom: 10 }}>
          <div style={{ width: `${percentA}%`, height: "100%", background: "#2563eb" }} />
        </div>
        <div style={{ fontSize: 13, fontWeight: 700 }}>
          {productB.name} — {totals.B}/{safeMaxScore}
        </div>
        <div style={{ height: 10, borderRadius: 999, background: "#e5e7eb", overflow: "hidden" }}>
          <div style={{ width: `${percentB}%`, height: "100%", background: "#16a34a" }} />
        </div>
      </div>

      <h4 style={{ marginTop: 24, marginBottom: 10, fontSize: 16, fontWeight: 900 }}>
        Side-by-side specifications
      </h4>
      <div style={{ overflowX: "auto", width: "100%" }}>
        <table style={{ width: "100%", minWidth: 420, borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr>
              <th scope="col" style={{ textAlign: "left", padding: 10, background: "#f1f5f9" }}>Specification</th>
              <th scope="col" style={{ textAlign: "left", padding: 10, background: "#f1f5f9" }}>{productA.name}</th>
              <th scope="col" style={{ textAlign: "left", padding: 10, background: "#f1f5f9" }}>{productB.name}</th>
            </tr>
          </thead>
          <tbody>
            {variantRows.map((field) => (
              <tr key={`variant-${field.key}`}>
                <th scope="row" style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #e5e7eb" }}>{field.label} (variant)</th>
                <td style={{ padding: 10, borderBottom: "1px solid #e5e7eb" }}>{displayValue(variantValue(variantA, field.key))}</td>
                <td style={{ padding: 10, borderBottom: "1px solid #e5e7eb" }}>{displayValue(variantValue(variantB, field.key))}</td>
              </tr>
            ))}
            {specRows.map((field, index) => (
              <tr key={field.key || index}>
                <th scope="row" style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #e5e7eb" }}>{field.label}</th>
                <td style={{ padding: 10, borderBottom: "1px solid #e5e7eb" }}>{displayValue(rowsA.find((item) => item.key === field.key)?.value)}</td>
                <td style={{ padding: 10, borderBottom: "1px solid #e5e7eb" }}>{displayValue(rowsB.find((item) => item.key === field.key)?.value)}</td>
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
        {productA.name}: {result.retailerCoverage?.A ?? 0} listed stores
        {" · "}
        {productB.name}: {result.retailerCoverage?.B ?? 0} listed stores
      </p>

      <button
        type="button"
        onClick={onReset}
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
