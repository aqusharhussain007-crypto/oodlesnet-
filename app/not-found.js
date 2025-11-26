export default function NotFound() {
  return (
    <main className="page-container" style={{ textAlign: "center", padding: "40px" }}>
      <h1 style={{ marginBottom: "10px" }}>404 — Page Not Found</h1>
      <p>The page you are looking for does not exist.</p>

      <a href="/" className="btn-glow" style={{ marginTop: "20px", display: "inline-block" }}>
        Return Home
      </a>
    </main>
  );
  }
          
