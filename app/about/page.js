"use client";

import Link from "next/link";

/* ---------- SEO META (App Router way) ---------- */
export const metadata = {
  title: "About OodlesNet – Smart Price Comparison Platform",
  description:
    "Learn about OodlesNet, a smart price comparison platform that helps you compare prices across stores and find the best deals quickly and reliably.",
  keywords: [
    "price comparison",
    "compare prices online",
    "best deals India",
    "online shopping comparison",
    "OodlesNet",
  ],
};

const CARD_BG = "#ecfffb";
const BLUE = "#0b5ed7"; // darker, sharper blue

export default function AboutPage() {
  return (
    <main
      style={{
        maxWidth: 820,
        margin: "0 auto",
        padding: "24px 16px 80px",
        color: "#0f172a",
      }}
    >
      {/* HERO */}
      <h1
        style={{
          fontSize: 34,
          fontWeight: 800,
          textAlign: "center",
          color: BLUE,
          marginBottom: 12,
        }}
      >
        About OodlesNet
      </h1>

      <p
        style={{
          textAlign: "center",
          fontSize: "1.05rem",
          color: "#334155",
          marginBottom: 28,
        }}
      >
        Compare smarter. Discover the best prices across stores — without the
        noise, without the hassle.
      </p>

      {/* INTRO CARD */}
      <section style={cardStyle()}>
        <p style={bodyText()}>
          OodlesNet is your trusted hub for smart online shopping. We bring
          together products, prices, and store comparisons so you can make the
          best choice — quickly and confidently.
        </p>
      </section>

      {/* WHAT WE DO */}
      <SectionTitle>What We Do</SectionTitle>
      <CardItem icon="check">
        Compare lowest prices across stores
      </CardItem>
      <CardItem icon="plus">
        Show real-time product details
      </CardItem>
      <CardItem icon="minus">
        Provide clean and fast user experience
      </CardItem>
      <CardItem icon="pin">
        Reduce the hassle of opening multiple websites
      </CardItem>

      {/* HOW IT WORKS */}
      <SectionTitle>How It Works</SectionTitle>
      <CardItem icon="search">Search for a product</CardItem>
      <CardItem icon="compare">Compare prices across stores</CardItem>
      <CardItem icon="tick">Buy from the best available option</CardItem>

      {/* MISSION */}
      <SectionTitle>Our Mission</SectionTitle>
      <section style={cardStyle()}>
        <p style={bodyText()}>
          Our aim is simple:{" "}
          <strong style={{ color: BLUE }}>
            help you save money and time
          </strong>{" "}
          by giving you the best price in one place — transparently and
          reliably.
        </p>
      </section>

      {/* CTA */}
      <Link href="/" style={{ textDecoration: "none" }}>
        <div
          style={{
            marginTop: 32,
            padding: "18px 20px",
            borderRadius: 20,
            textAlign: "center",
            fontWeight: 800,
            color: "#fff",
            background: "linear-gradient(135deg,#0b5ed7,#0891b2)",
            boxShadow: "0 12px 26px rgba(11,94,215,0.35)",
          }}
        >
          Start comparing smarter with OodlesNet
        </div>
      </Link>
    </main>
  );
}

/* ---------- SMALL COMPONENTS ---------- */

function SectionTitle({ children }) {
  return (
    <h2
      style={{
        marginTop: 32,
        marginBottom: 14,
        fontSize: 22,
        fontWeight: 800,
        color: "#0b5ed7",
      }}
    >
      {children}
    </h2>
  );
}

function CardItem({ icon, children }) {
  return (
    <div style={cardStyle(true)}>
      <Icon type={icon} />
      <span style={{ fontWeight: 600 }}>{children}</span>
    </div>
  );
}

/* ---------- ICONS (SVG) ---------- */
function Icon({ type }) {
  const common = {
    width: 22,
    height: 22,
    stroke: "#0b5ed7",
    strokeWidth: 2,
    fill: "none",
  };

  switch (type) {
    case "check":
      return (
        <svg {...common} viewBox="0 0 24 24">
          <path d="M5 12l4 4L19 6" />
        </svg>
      );
    case "plus":
      return (
        <svg {...common} viewBox="0 0 24 24">
          <path d="M12 5v14M5 12h14" />
        </svg>
      );
    case "minus":
      return (
        <svg {...common} viewBox="0 0 24 24">
          <path d="M5 12h14" />
        </svg>
      );
    case "pin":
      return (
        <svg {...common} viewBox="0 0 24 24">
          <path d="M12 21s7-7 7-11a7 7 0 10-14 0c0 4 7 11 7 11z" />
        </svg>
      );
    case "search":
      return (
        <svg {...common} viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20l-3.5-3.5" />
        </svg>
      );
    case "compare":
      return (
        <svg {...common} viewBox="0 0 24 24">
          <rect x="3" y="4" width="18" height="6" />
          <rect x="3" y="14" width="18" height="6" />
        </svg>
      );
    case "tick":
      return (
        <svg {...common} viewBox="0 0 24 24">
          <path d="M5 12l4 4L19 6" />
        </svg>
      );
    default:
      return null;
  }
}

/* ---------- STYLES ---------- */
function cardStyle(row = false) {
  return {
    background: CARD_BG,
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    display: row ? "flex" : "block",
    gap: row ? 12 : 0,
    alignItems: row ? "center" : "unset",
    boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
  };
}

function bodyText() {
  return {
    fontSize: "1.05rem",
    lineHeight: 1.7,
    color: "#0f172a",
  };
          }
          
