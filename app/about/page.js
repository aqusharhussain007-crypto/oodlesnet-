"use client";

import Link from "next/link";

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
      className="page-container"
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
        About OodlesNet
      </h1>

      <p
        style={{
          textAlign: "center",
          fontSize: "1.05rem",
          color: "#334155",
          marginBottom: 20,
        }}
      >
        Compare smarter. Discover the best prices across stores — without
        noise, without hassle.
      </p>

      <div style={cardStyle}>
        <p style={{ fontSize: "1.05rem", lineHeight: 1.7 }}>
          OodlesNet is your trusted hub for smart online shopping. We bring
          together products, prices, and store comparisons so you can make the
          best choice — quickly and confidently.
        </p>
      </div>

      <h2
        style={{
          marginTop: 28,
          marginBottom: 12,
          color: "#2563eb",
          fontSize: 22,
          fontWeight: 800,
        }}
      >
        What We Do
      </h2>

      <div style={cardStyle}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <svg style={iconStyle} fill="none" viewBox="0 0 24 24">
            <path d="M5 13l4 4L19 7" strokeWidth="2" />
          </svg>
          Compare lowest prices across stores
        </div>
      </div>

      <div style={cardStyle}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <svg style={iconStyle} fill="none" viewBox="0 0 24 24">
            <path d="M4 6h16M4 12h16M4 18h16" strokeWidth="2" />
          </svg>
          Show real-time product details
        </div>
      </div>

      <div style={cardStyle}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <svg style={iconStyle} fill="none" viewBox="0 0 24 24">
            <path d="M3 12h18" strokeWidth="2" />
          </svg>
          Provide clean and fast user experience
        </div>
      </div>

      <div style={cardStyle}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <svg style={iconStyle} fill="none" viewBox="0 0 24 24">
            <path
              d="M12 2a10 10 0 100 20 10 10 0 000-20z"
              strokeWidth="2"
            />
          </svg>
          Reduce the hassle of opening multiple websites
        </div>
      </div>

      <h2
        style={{
          marginTop: 28,
          marginBottom: 12,
          color: "#2563eb",
          fontSize: 22,
          fontWeight: 800,
        }}
      >
        Our Mission
      </h2>

      <div style={cardStyle}>
        <p style={{ fontSize: "1.05rem", lineHeight: 1.7 }}>
          Our aim is simple:{" "}
          <strong style={{ color: "#2563eb" }}>
            help you save money and time
          </strong>{" "}
          by giving you the best price in one place — transparently and
          reliably.
        </p>
      </div>

      <div
        style={{
          marginTop: 28,
          padding: 18,
          borderRadius: 20,
          background: "linear-gradient(135deg,#2563eb,#10b981)",
          color: "#fff",
          textAlign: "center",
          fontWeight: 800,
          fontSize: "1.1rem",
          cursor: "pointer",
        }}
        onClick={() => (window.location.href = "/")}
      >
        Start comparing smarter with OodlesNet
      </div>
    </main>
  );
          }
            
