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
    <div style={{ marginTop: 20 }}>
      {winner === "tie" ? (
        <p>
          🤝 Both products offer similar value right now.
        </p>
      ) : (
        <p>
          🏆 Better value right now:{" "}
          <strong>{winnerProduct.name}</strong>
        </p>
      )}

      <p>
        Scores — A: {totals.A} | B: {totals.B}
      </p>

      <button onClick={onReset} style={{ marginTop: 8 }}>
        Compare another
      </button>
    </div>
  );
}
  
