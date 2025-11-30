"use client";

export default function AboutPage() {
  return (
    <main className="page-container" style={{ maxWidth: "800px" }}>
      <h1
        style={{
          marginBottom: "20px",
          fontSize: "32px",
          color: "#0bbcff",
          textShadow: "0 0 8px rgba(11,188,255,0.5)",
          textAlign: "center",
          fontWeight: "700",
        }}
      >
        About OodlesNet
      </h1>

      <p
        style={{
          fontSize: "1.15rem",
          lineHeight: "1.7",
          marginBottom: "20px",
        }}
      >
        OodlesNet is your trusted hub for smart online shopping.  
        We bring together products, prices, and store comparisons  
        so you can make the best choice — quickly and confidently.
      </p>

      <h2
        style={{
          marginTop: "25px",
          marginBottom: "10px",
          color: "#0bbcff",
          textShadow: "0 0 6px rgba(11,188,255,0.4)",
          fontSize: "24px",
        }}
      >
        What We Do
      </h2>

      <ul style={{ marginLeft: "18px", lineHeight: "1.7" }}>
        <li>✔ Compare lowest prices across stores</li>
        <li>✔ Show real-time product details</li>
        <li>✔ Provide clean and fast user experience</li>
        <li>✔ Reduce hassle of opening multiple websites</li>
      </ul>

      <h2
        style={{
          marginTop: "25px",
          marginBottom: "10px",
          color: "#0bbcff",
          textShadow: "0 0 6px rgba(11,188,255,0.4)",
          fontSize: "24px",
        }}
      >
        Our Mission
      </h2>

      <p style={{ fontSize: "1.15rem", lineHeight: "1.7" }}>
        Our aim is simple:  
        <strong style={{ color: "#0bbcff" }}>help you save money and time</strong>  
        by giving you the best price in one place.
      </p>

      <h2
        style={{
          marginTop: "25px",
          marginBottom: "10px",
          color: "#0bbcff",
          textShadow: "0 0 6px rgba(11,188,255,0.4)",
          fontSize: "24px",
        }}
      >
        Why Choose OodlesNet?
      </h2>

      <ul style={{ marginLeft: "18px", lineHeight: "1.7" }}>
        <li>⚡ Fast price comparison</li>
        <li>🎯 Accurate product data</li>
        <li>📱 Mobile-friendly experience</li>
        <li>🔍 Smart search and suggestions</li>
      </ul>

      <p
        style={{
          marginTop: "30px",
          fontWeight: "600",
          textAlign: "center",
          color: "#0bbcff",
          textShadow: "0 0 6px rgba(11,188,255,0.4)",
        }}
      >
        Thank you for choosing OodlesNet 💙  
        We’re here to make your shopping smarter.
      </p>
    </main>
  );
          }
          
