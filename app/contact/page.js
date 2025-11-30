"use client";

export default function ContactPage() {
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
        Contact Us
      </h1>

      <p
        style={{
          fontSize: "1.15rem",
          lineHeight: "1.7",
          marginBottom: "25px",
          textAlign: "center",
        }}
      >
        We’d love to hear from you!  
        Whether it's feedback, support, or a business inquiry — just reach out.
      </p>

      <div
        style={{
          background: "#ffffff",
          padding: "25px",
          borderRadius: "12px",
          boxShadow: "0 0 12px rgba(11,188,255,0.25)",
        }}
      >
        <h2
          style={{
            marginBottom: "10px",
            color: "#0bbcff",
            textShadow: "0 0 6px rgba(11,188,255,0.4)",
            fontSize: "24px",
          }}
        >
          Contact Information
        </h2>

        <p style={{ lineHeight: "1.7", marginBottom: "15px" }}>
          📧 <strong>Email:</strong>{" "}
          <a href="mailto:contact@oodlesnet.com" style={{ color: "#0bbcff" }}>
            contact@oodlesnet.com
          </a>
        </p>

        <p style={{ lineHeight: "1.7", marginBottom: "15px" }}>
          🌐 <strong>Website:</strong>{" "}
          <a
            href="https://oodlesnet.com"
            target="_blank"
            style={{ color: "#0bbcff" }}
          >
            oodlesnet.com
          </a>
        </p>

        <p style={{ lineHeight: "1.7", marginBottom: "25px" }}>
          🕒 <strong>Support Hours:</strong>  
          Monday – Saturday | 10:00 AM – 6:00 PM
        </p>

        <h3
          style={{
            marginBottom: "10px",
            color: "#0bbcff",
            textShadow: "0 0 4px rgba(11,188,255,0.4)",
            fontSize: "22px",
          }}
        >
          Send Us a Message
        </h3>

        <form
          onSubmit={(e) => e.preventDefault()}
          style={{ display: "flex", flexDirection: "column", gap: "12px" }}
        >
          <input
            type="text"
            placeholder="Your Name"
            className="search-bar"
            style={{ width: "100%" }}
          />

          <input
            type="email"
            placeholder="Your Email"
            className="search-bar"
            style={{ width: "100%" }}
          />

          <textarea
            placeholder="Your Message"
            className="search-bar"
            rows={4}
            style={{ width: "100%", paddingTop: "10px" }}
          />

          <button
            className="btn-glow"
            style={{
              width: "100%",
              padding: "12px",
              fontSize: "1rem",
              marginTop: "10px",
            }}
          >
            Send Message
          </button>
        </form>
      </div>

      <p
        style={{
          marginTop: "30px",
          textAlign: "center",
          color: "#0bbcff",
          textShadow: "0 0 6px rgba(11,188,255,0.4)",
          fontWeight: "600",
        }}
      >
        We’ll get back to you as soon as possible 💙
      </p>
    </main>
  );
          }
