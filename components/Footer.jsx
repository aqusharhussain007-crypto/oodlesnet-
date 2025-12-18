"use client";

export default function Footer() {
  return (
    <footer
      style={{
        marginTop: "40px",
        width: "100%",
        padding: "18px 0",
        textAlign: "center",
        background: "#0a0f1a",
        borderTop: "2px solid #00b7ff",
        boxShadow: "0 -0px 20px rgba(0, 183, 255, 0.25)",
        color: "#cfeeff",
        position: "relative",
      }}
    >
      <div style={{ fontSize: "1rem", fontWeight: 500, opacity: 0.9 }}>
        © {new Date().getFullYear()}{" "}
        <span style={{ color: "#00c9ff" }}>OodlesNet</span>.{" "}
        All Rights Reserved.
      </div>

      {/* Affiliate Disclaimer */}
      <div
        style={{
          marginTop: 8,
          fontSize: "0.75rem",
          opacity: 0.75,
          maxWidth: 520,
          marginLeft: "auto",
          marginRight: "auto",
          lineHeight: 1.4,
        }}
      >
        Some links on OodlesNet are affiliate links, which means we may earn a
        commission if you make a purchase—at no additional cost to you. Prices
        and availability are subject to change.
      </div>

      {/* Glow line */}
      <div
        style={{
          width: "60%",
          height: "3px",
          background:
            "linear-gradient(90deg, transparent, #00b7ff, transparent)",
          margin: "10px auto 0 auto",
          opacity: 0.7,
        }}
      ></div>
    </footer>
  );
        }
          
