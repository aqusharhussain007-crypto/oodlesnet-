"use client";

export default function TermsPage() {
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
        Terms & Conditions
      </h1>

      <div style={cardStyle}>
        <p>
          By accessing or using <strong>Oodlesnet</strong>, you agree to comply
          with these Terms & Conditions.
        </p>
      </div>

      <div style={cardStyle}>
        <h3>Service Nature</h3>
        <p>
          Oodlesnet is a price comparison platform. We do not sell products
          directly.
        </p>
      </div>

      <div style={cardStyle}>
        <h3>Accuracy of Information</h3>
        <p>
          While we strive to keep information accurate, prices and availability
          may change without notice.
        </p>
      </div>

      <div style={cardStyle}>
        <h3>External Links</h3>
        <p>
          We are not responsible for third-party websites linked from Oodlesnet.
        </p>
      </div>

      <div style={cardStyle}>
        <p>
          Continued use of the site means acceptance of these terms.
        </p>
      </div>
    </main>
  );
}
