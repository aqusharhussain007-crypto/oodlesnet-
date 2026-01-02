"use client";

import Link from "next/link";

const Icon = ({ path }) => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#2563eb"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ flexShrink: 0 }}
  >
    <path d={path} />
  </svg>
);

export default function AboutPage() {
  return (
    <main className="page-container" style={{ maxWidth: 820 }}>
      {/* TITLE */}
      <h1
        style={{
          marginBottom: 12,
          fontSize: 32,
          color: "#1e40af",
          textAlign: "center",
          fontWeight: 800,
        }}
      >
        About OodlesNet
      </h1>

      <p
        style={{
          textAlign: "center",
          fontSize: "1.1rem",
          color: "#374151",
          marginBottom: 28,
        }}
      >
        <strong>Compare smarter.</strong> Discover the best prices across stores —
        without the noise, without the hassle.
      </p>

      {/* INTRO CARD */}
      <div
        style={{
          background: "#ecfffb",
          borderRadius: 20,
          padding: 22,
          marginBottom: 28,
          color: "#111827",
        }}
      >
        OodlesNet is your trusted hub for smart online shopping. We bring together
        products, prices, and store comparisons so you can make the best choice —
        quickly and confidently.
      </div>

      {/* WHAT WE DO */}
      <h2 style={sectionTitle}>What We Do</h2>

      <Feature text="Compare lowest prices across stores" icon="M20 6L9 17l-5-5" />
      <Feature text="Show real-time product details" icon="M12 20V10" />
      <Feature text="Provide clean and fast user experience" icon="M5 12h14" />
      <Feature
        text="Reduce the hassle of opening multiple websites"
        icon="M12 2a7 7 0 1 0 7 7"
      />

      {/* HOW IT WORKS */}
      <h2 style={sectionTitle}>How It Works</h2>

      <Feature text="Search for a product" icon="M21 21l-6-6" />
      <Feature text="Compare prices across stores" icon="M3 12h18" />
      <Feature text="Buy from the best available option" icon="M5 13l4 4L19 7" />

      {/* MISSION */}
      <h2 style={sectionTitle}>Our Mission</h2>

      <p style={{ fontSize: "1.05rem", color: "#374151" }}>
        Our aim is simple:{" "}
        <strong style={{ color: "#1e40af" }}>
          help you save money and time
        </strong>{" "}
        by giving you the best price in one place — transparently and reliably.
      </p>

      {/* CTA */}
      <Link href="/" style={{ textDecoration: "none" }}>
        <div
          style={{
            marginTop: 36,
            padding: 22,
            borderRadius: 20,
            background: "linear-gradient(135deg,#0f766e,#059669)",
            color: "#ffffff",
            textAlign: "center",
            fontWeight: 800,
            fontSize: "1.1rem",
            boxShadow: "0 12px 30px rgba(5,150,105,0.35)",
            cursor: "pointer",
          }}
        >
          Start comparing smarter with OodlesNet
        </div>
      </Link>
    </main>
  );
}

/* ---------- SMALL COMPONENTS ---------- */

const sectionTitle = {
  marginTop: 32,
  marginBottom: 14,
  color: "#1e40af",
  fontSize: 22,
  fontWeight: 800,
};

function Feature({ text, icon }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        background: "#ffffff",
        color: "#111827",
        borderRadius: 16,
        padding: 16,
        marginBottom: 14,
      }}
    >
      <Icon path={icon} />
      <span style={{ fontSize: "1rem", fontWeight: 500 }}>{text}</span>
    </div>
  );
      }
           
