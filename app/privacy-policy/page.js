"use client";

export default function PrivacyPolicyPage() {
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
        Privacy Policy
      </h1>

      <div style={cardStyle}>
        <p>
          At <strong>Oodlesnet</strong>, your privacy is important to us. We do
          not collect personal information unless you voluntarily provide it.
        </p>
      </div>

      <div style={cardStyle}>
        <h3>Information We Collect</h3>
        <p>
          We may collect non-personal data such as device type, browser, and
          usage statistics to improve performance and user experience.
        </p>
      </div>

      <div style={cardStyle}>
        <h3>Affiliate Links</h3>
        <p>
          Oodlesnet contains affiliate links. When you click and purchase
          through them, we may earn a commission at no extra cost to you.
        </p>
      </div>

      <div style={cardStyle}>
        <h3>Third-Party Services</h3>
        <p>
          Prices, availability, and offers are provided by third-party stores.
          We are not responsible for their policies or content.
        </p>
      </div>

      <div style={cardStyle}>
        <p>
          By using Oodlesnet, you agree to this Privacy Policy.
        </p>
      </div>
    </main>
  );
            }
            
