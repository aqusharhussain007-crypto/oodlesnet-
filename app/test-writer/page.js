"use client";

import { useState } from "react";

export default function TestWriterPage() {
  const [token, setToken] = useState("");
  const [result, setResult] = useState("");
  const [busy, setBusy] = useState(false);

  async function runDryRun(event) {
    event.preventDefault();
    setBusy(true);
    setResult("");
    const submittedToken = token.trim();
    try {
      const response = await fetch("/api/test-writer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${submittedToken}`,
        },
        body: JSON.stringify({
          confirmWrite: false,
          product: {
            name: "Test Sample Product",
            brand: "Test Brand",
            categorySlug: "test-products",
            description: "Temporary validation sample; dry-run only.",
            imageUrl: "",
            tags: ["test", "dry-run"],
            store: [
              {
                name: "Example Store",
                price: 999,
                offer: "Dry-run sample only",
                url: "https://example.com/test-product",
              },
            ],
          },
        }),
      });
      const data = await response.json().catch(() => ({ error: "Response was not valid JSON." }));
      setResult(JSON.stringify({ httpStatus: response.status, ...data }, null, 2));
    } catch {
      setResult("Request failed. Check the connection and try again.");
    } finally {
      setToken("");
      setBusy(false);
    }
  }

  return (
    <main style={{ maxWidth: 640, margin: "40px auto", padding: 20, fontFamily: "Arial, sans-serif" }}>
      <h1>Test Firestore Writer</h1>
      <p>This page sends a dry-run request only. It uses a fixed sample product and sets confirmWrite to false. It does not save your token in browser storage.</p>
      <form onSubmit={runDryRun}>
        <label htmlFor="writer-token" style={{ display: "block", marginBottom: 8 }}>TEST_WRITER_TOKEN</label>
        <input
          id="writer-token"
          type="password"
          autoComplete="off"
          value={token}
          onChange={(event) => setToken(event.target.value)}
          required
          style={{ boxSizing: "border-box", width: "100%", padding: 12, marginBottom: 16 }}
        />
        <button type="submit" disabled={busy || !token.trim()} style={{ padding: "12px 18px" }}>
          {busy ? "Testing…" : "Run dry-run test"}
        </button>
      </form>
      {result && <pre style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere", marginTop: 24, padding: 14, background: "#eee", color: "#111" }}>{result}</pre>}
      <p style={{ marginTop: 24, fontSize: 14 }}>Never use this page to submit a real write. Close the page after testing.</p>
    </main>
  );
}
