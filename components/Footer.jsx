export default function Footer() {
  return (
    <footer
      style={{
        marginTop: "60px",
        padding: "2rem",
        background: "#ffffff",
        borderTop: "1px solid #ddd",
        textAlign: "center",
        fontSize: "14px"
      }}
    >
      <p style={{ marginBottom: "8px" }}>
        © {new Date().getFullYear()} OodlesNet — All Rights Reserved
      </p>

      <div style={{ marginTop: "10px" }}>
        <a
          href="/privacy"
          style={{
            marginRight: "15px",
            textDecoration: "none",
            color: "#555"
          }}
        >
          Privacy Policy
        </a>

        <a
          href="/terms"
          style={{
            marginRight: "15px",
            textDecoration: "none",
            color: "#555"
          }}
        >
          Terms & Conditions
        </a>

        <a
          href="/contact"
          style={{
            textDecoration: "none",
            color: "#555"
          }}
        >
          Contact Us
        </a>
      </div>
    </footer>
  );
        }
      
