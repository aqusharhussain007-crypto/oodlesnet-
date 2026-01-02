"use client";

const Icon = ({ path }) => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#0bbcff"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ marginRight: 10, flexShrink: 0 }}
  >
    <path d={path} />
  </svg>
);

export default function AboutPage() {
  return (
    <main
      className="page-container"
      style={{
        maxWidth: 800,
        margin: "0 auto",
        padding: "20px",
      }}
    >
      {/* HERO */}
      <h1
        style={{
          fontSize: 34,
          color: "#0bbcff",
          textAlign: "center",
          fontWeight: 800,
          textShadow: "0 0 10px rgba(11,188,255,0.5)",
          marginBottom: 8,
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
          borderRadius: 18,
          padding: 20,
          boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
          marginBottom: 30,
        }}
      >
        <p style={{ fontSize: "1.1rem", lineHeight: 1.7 }}>
          OodlesNet is your trusted hub for smart online shopping. We bring
          together products, prices, and store comparisons so you can make the
          best choice — quickly and confidently.
        </p>
      </div>

      {/* WHAT WE DO */}
      <h2 className="about-title">What We Do</h2>
      <ul className="about-list">
        <li>
          <Icon path="M20 6L9 17l-5-5" />
          Compare lowest prices across stores
        </li>
        <li>
          <Icon path="M12 2v20M2 12h20" />
          Show real-time product details
        </li>
        <li>
          <Icon path="M3 12h18" />
          Provide clean and fast user experience
        </li>
        <li>
          <Icon path="M21 10c0 6-9 12-9 12S3 16 3 10a9 9 0 1118 0z" />
          Reduce the hassle of opening multiple websites
        </li>
      </ul>

      {/* HOW IT WORKS */}
      <h2 className="about-title">How It Works</h2>
      <ul className="about-list">
        <li>
          <Icon path="M21 21l-6-6" />
          Search for a product
        </li>
        <li>
          <Icon path="M3 3h18v6H3zM3 15h18v6H3z" />
          Compare prices across stores
        </li>
        <li>
          <Icon path="M5 12l5 5L20 7" />
          Buy from the best available option
        </li>
      </ul>

      {/* MISSION */}
      <h2 className="about-title">Our Mission</h2>
      <p style={{ fontSize: "1.1rem", lineHeight: 1.7 }}>
        Our aim is simple:{" "}
        <strong style={{ color: "#0bbcff" }}>
          help you save money and time
        </strong>{" "}
        by giving you the best price in one place — transparently and reliably.
      </p>

      {/* WHY CHOOSE */}
      <h2 className="about-title">Why Choose OodlesNet?</h2>
      <ul className="about-list">
        <li>
          <Icon path="M13 10V3L4 14h7v7l9-11h-7z" />
          Fast and lightweight performance
        </li>
        <li>
          <Icon path="M12 20l9-5-9-5-9 5 9 5z" />
          Accurate and structured product data
        </li>
        <li>
          <Icon path="M7 2h10v20H7z" />
          Mobile-first design
        </li>
        <li>
          <Icon path="M11 17l-5-5 5-5M13 7l5 5-5 5" />
          Simple, distraction-free experience
        </li>
      </ul>

      {/* FOOTER CTA */}
      <div
        style={{
          marginTop: 40,
          textAlign: "center",
          padding: 20,
          borderRadius: 18,
          background: "linear-gradient(135deg,#0f4c81,#10b981)",
          color: "#fff",
          fontWeight: 700,
          boxShadow: "0 8px 22px rgba(16,185,129,0.4)",
        }}
      >
        Start comparing smarter with OodlesNet 🚀
      </div>

      {/* STYLES */}
      <style jsx>{`
        .about-title {
          margin-top: 30px;
          margin-bottom: 12px;
          color: #0bbcff;
          fontSize: 24px;
          fontWeight: 800;
          text-shadow: 0 0 6px rgba(11, 188, 255, 0.4);
        }

        .about-list {
          list-style: none;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .about-list li {
          display: flex;
          align-items: flex-start;
          fontSize: 1rem;
          line-height: 1.6;
          background: #f9fafb;
          padding: 12px 14px;
          border-radius: 12px;
        }
      `}</style>
    </main>
  );
}
