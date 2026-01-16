"use client";

const IconMail = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 4h16v16H4z" />
    <path d="M22 6l-10 7L2 6" />
  </svg>
);

const IconGlobe = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20" />
  </svg>
);

const IconClock = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 6v6l4 2" />
  </svg>
);

export default function ContactPage() {
  return (
    <main
      className="page-container"
      style={{
        maxWidth: 900,
        margin: "0 auto",
        padding: "32px 14px",
      }}
    >
      {/* TITLE */}
      <h1
        style={{
          fontSize: 34,
          textAlign: "center",
          fontWeight: 800,
          color: "var(--accent, #0bbcff)",
          marginBottom: 12,
        }}
      >
        Contact Us
      </h1>

      <p
        style={{
          textAlign: "center",
          maxWidth: 640,
          margin: "0 auto 32px",
          fontSize: "1.1rem",
          lineHeight: 1.7,
          color: "var(--text-muted, #475569)",
        }}
      >
        Questions, feedback, partnerships, or support — we’re always happy to hear from you.
      </p>

      {/* CARDS */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: 24,
        }}
      >
        {/* CONTACT INFO */}
        <div
          style={{
            background: "var(--card-bg, #ffffff)",
            borderRadius: 18,
            padding: 22,
            boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
            border: "1px solid var(--card-border, #e5e7eb)",
          }}
        >
          <h2
            style={{
              fontSize: 22,
              fontWeight: 800,
              marginBottom: 16,
              color: "var(--accent, #0bbcff)",
            }}
          >
            Contact Information
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <IconMail />
              <a
                href="mailto:contact@oodlesnet.com"
                style={{ color: "var(--accent, #0bbcff)", fontWeight: 600 }}
              >
                contact@oodlesnet.com
              </a>
            </div>

            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <IconGlobe />
              <a
                href="https://oodlesnet.com"
                target="_blank"
                style={{ color: "var(--accent, #0bbcff)", fontWeight: 600 }}
              >
                oodlesnet.com
              </a>
            </div>

            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <IconClock />
              <span style={{ fontWeight: 600 }}>
                Mon – Sat · 10:00 AM – 6:00 PM
              </span>
            </div>
          </div>
        </div>

        {/* MESSAGE FORM */}
        <div
          style={{
            background: "var(--card-bg, #ffffff)",
            borderRadius: 18,
            padding: 22,
            boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
            border: "1px solid var(--card-border, #e5e7eb)",
          }}
        >
          <h2
            style={{
              fontSize: 22,
              fontWeight: 800,
              marginBottom: 12,
              color: "var(--accent, #0bbcff)",
            }}
          >
            Send Us a Message
          </h2>

          <form
            onSubmit={(e) => e.preventDefault()}
            style={{ display: "flex", flexDirection: "column", gap: 14 }}
          >
            <input type="text" placeholder="Your Name" className="search-bar" />
            <input type="email" placeholder="Your Email" className="search-bar" />
            <textarea
              rows={4}
              placeholder="Your Message"
              className="search-bar"
              style={{ paddingTop: 10 }}
            />

            <button className="btn-glow" style={{ padding: 14, fontWeight: 800 }}>
              Send Message
            </button>

            <small style={{ color: "var(--text-muted, #64748b)" }}>
              We usually respond within 24 hours.
            </small>
          </form>
        </div>
      </div>

      {/* TRUST NOTE */}
      <p
        style={{
          marginTop: 32,
          textAlign: "center",
          fontSize: 13,
          color: "var(--text-muted, #64748b)",
        }}
      >
        By contacting us, you agree to our Terms & Privacy Policy.
      </p>
    </main>
  );
  }
  
