export default function CompareResult({
  result,
  productA,
  productB,
  onReset,
}) {
  const { totals, winner } = result;

  let winnerProduct = null;
  if (winner === "A") winnerProduct = productA;
  if (winner === "B") winnerProduct = productB;

  return (
    <div
      style={{
        marginTop: 18,
        padding: 16,
        borderRadius: 16,
        background: "#ffffff",
        border: "1px solid #e5e7eb",
        boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
      }}
    >
      {winner === "tie" ? (
        <p style={{ fontWeight: 800 }}>
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

      <p style={{ marginTop: 6, color: "#374151", fontSize: 14 }}>
        Score — A: {totals.A} &nbsp;|&nbsp; B: {totals.B}
      </p>

      <button
        onClick={onReset}
        style={{
          marginTop: 12,
          padding: "10px 14px",
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
                 
