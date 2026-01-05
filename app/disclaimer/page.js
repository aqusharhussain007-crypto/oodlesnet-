"use client";

export default function DisclaimerPage() {
  const cardStyle = {
    background: "#ecfffb",
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    boxShadow: "0 6px 18px rgba(0,0,0,0.12)",
    color: "#0f172a",
  };

  return (
    <main style={{ maxWidth: 800, margin: "0 auto", padding: 16 }}>
      <h1 style={{ textAlign: "center", color: "#2563eb", fontWeight: 800 }}>
        Disclaimer
      </h1>

      <div style={cardStyle}>
        <p>
          Oodlesnet is provided for informational purposes only. We do not
          guarantee accuracy, completeness, or reliability of listed prices.
        </p>
      </div>

      <div style={cardStyle}>
        <p>
          Product images, descriptions, and offers belong to respective store
          owners.
        </p>
      </div>

      <div style={cardStyle}>
        <p>
          Any purchase made through external links is solely between you and
          the seller.
        </p>
      </div>

      <div style={cardStyle}>
        <p>
          Use of Oodlesnet is at your own discretion and risk.
        </p>
      </div>
    </main>
  );
    }
  
