export default function CompareResult({
  result,
  productA,
  productB,
  onReset,
}) {
  const { totals, winner } = result;

  const maxScore = 5;
  const percentA = (totals.A / maxScore) * 100;
  const percentB = (totals.B / maxScore) * 100;

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
      {winner === "tie" ? (
        <p style={{ fontWeight: 900 }}>
          🤝 Both products offer similar value right now.
        </p>
      ) : (
        <p style={{ fontWeight: 900, fontSize: 16 }}>
          🏆 Better value right now:
          <br />
          <span style={{ color: "#16a34a" }}>
            {winnerProduct.name}
          </span>
        </p>
      )}

      {/* SCORE BARS */}
      <div style={{ marginTop: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 700 }}>
          {productA.name}
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
          {productB.name}
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
      
