export default function CompareResult({
  result,
  productA,
  productB,
  onReset,
}) {
  const { totals, winner, maxScore = 3 } = result;

  const safeMaxScore =
    Number.isFinite(maxScore) && maxScore > 0 ? maxScore : 3;
  const percentA = Math.max(0, Math.min(100, (totals.A / safeMaxScore) * 100));
  const percentB = Math.max(0, Math.min(100, (totals.B / safeMaxScore) * 100));

  let winnerProduct = null;
  if (winner === "A") winnerProduct = productA;
  if (winner === "B") winnerProduct = productB;

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
        Better listed value based on available prices and offers — not a
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
          {productB.name} — {totals.B}/{safeMaxScore}
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
