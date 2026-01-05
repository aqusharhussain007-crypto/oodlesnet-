"use client";

export default function AboutPage() {
  const cardStyle = {
    background: "#ecfffb",
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    boxShadow: "0 6px 18px rgba(0,0,0,0.12)",
    color: "#0f172a",
  };

  const iconStyle = {
    width: 22,
    height: 22,
    marginRight: 12,
    stroke: "#0ea5e9",
    flexShrink: 0,
  };

  return (
    <main
      style={{
        maxWidth: 800,
        margin: "0 auto",
        padding: 16,
        background: "#f1f5f9",
      }}
    >
      <h1
        style={{
          marginBottom: 12,
          fontSize: 32,
          color: "#2563eb",
          textAlign: "center",
          fontWeight: 800,
        }}
      >
        About Oodlesnet
      </h1>

      <p
        style={{
          textAlign: "center",
          fontSize: "1.05rem",
          color: "#334155",
          marginBottom: 20,
        }}
      >
        Compare smarter. Discover the best prices across stores — without noise,
        without hassle.
      </p>

      <div style={cardStyle}>
        <p style={{ fontSize: "1.05rem", lineHeight: 1.7 }}>
          Oodlesnet is a smart product comparison platform that helps you find
          the best prices across multiple online stores in one place.
        </p>
      </div>

      <h2 style={{ marginTop: 28, marginBottom: 12, color: "#2563eb" }}>
        What We Do
      </h2>

      {[
        "Compare lowest prices across stores",
        "Show clear and real-time product details",
        "Offer a fast and clutter-free experience",
        "Save time by avoiding multiple websites",
      ].map((text, i) => (
        <div style={cardStyle} key={i}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <svg style={iconStyle} fill="none" viewBox="0 0 24 24">
              <path d="M5 13l4 4L19 7" strokeWidth="2" />
            </svg>
            {text}
          </div>
        </div>
      ))}

      <h2 style={{ marginTop: 28, marginBottom: 12, color: "#2563eb" }}>
        Our Mission
      </h2>

      <div style={cardStyle}>
        <p style={{ fontSize: "1.05rem", lineHeight: 1.7 }}>
          Our mission is to help users{" "}
          <strong style={{ color: "#2563eb" }}>
            save money and make confident buying decisions
          </strong>{" "}
          by showing transparent price comparisons.
        </p>
      </div>
    </main>
  );
        }
            
