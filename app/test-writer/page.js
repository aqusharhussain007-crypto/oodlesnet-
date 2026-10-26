"use client";

import { useState } from "react";

const sampleProduct = {
  name: "OodlesNet TEST ONLY Sample Product",
  brand: "OodlesNet Test",
  categorySlug: "test-products",
  description: "Clearly labelled test record used to verify the isolated test Firestore writer. Not a real product listing.",
  imageUrl: "",
  tags: ["test-only", "writer-verification"],
  store: [
    {
      name: "Example Store (Test)",
      price: 999,
      offer: "Test data only",
      url: "https://example.com/test-product",
    },
  ],
};

export default function TestWriterPage() {
  const [token, setToken] = useState("");
  const [result, setResult] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirmTestWrite, setConfirmTestWrite] = useState(false);

  async function submitRequest(event) {
    event.preventDefault();
    const action = event.nativeEvent.submitter?.value || "dry-run";
    const isWrite = action === "write";
    const isVerify = action === "verify";
    const isDuplicate = action === "duplicate";
    const isInvalid = action === "invalid";
    const isBadAuth = action === "bad-auth";
    if ((isWrite || isDuplicate) && !confirmTestWrite) {
      setResult("Tick the confirmation box before writing the one test record.");
      return;
    }

    setBusy(true);
    setResult("");
    const submittedToken = token.trim();
    try {
      const response = await fetch("/api/test-writer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${isBadAuth ? "deliberately-wrong-test-token" : submittedToken}`,
        },
        body: JSON.stringify(
          isVerify
            ? { action: "verify", documentId: "LMXGtD37utGDi2yWucUr" }
            : {
                confirmWrite: isWrite || isDuplicate,
                ...(isDuplicate ? { documentId: "LMXGtD37utGDi2yWucUr" } : {}),
                product: isInvalid ? { ...sampleProduct, store: [{ name: "", price: -1, url: "not-a-url" }] } : sampleProduct,
              },
        ),
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
      <p>This page targets only the isolated oodlesnet-test project. The sample is clearly labelled test data and is not a real product listing.</p>
      <form onSubmit={submitRequest}>
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
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          <button type="submit" name="action" value="dry-run" disabled={busy || !token.trim()} style={{ padding: "12px 18px" }}>
            {busy ? "Testing…" : "Run dry-run"}
          </button>
          <button type="submit" name="action" value="write" disabled={busy || !token.trim() || !confirmTestWrite} style={{ padding: "12px 18px" }}>
            {busy ? "Working…" : "Write one test record"}
          </button>
          <button type="submit" name="action" value="verify" disabled={busy || !token.trim()} style={{ padding: "12px 18px" }}>
            {busy ? "Checking…" : "Verify saved record"}
          </button>
          <button type="submit" name="action" value="duplicate" disabled={busy || !token.trim() || !confirmTestWrite} style={{ padding: "12px 18px" }}>
            Test duplicate protection
          </button>
          <button type="submit" name="action" value="invalid" disabled={busy || !token.trim()} style={{ padding: "12px 18px" }}>
            Test invalid data
          </button>
          <button type="submit" name="action" value="bad-auth" disabled={busy || !token.trim()} style={{ padding: "12px 18px" }}>
            Test wrong token
          </button>
        </div>
        <label style={{ display: "block", marginTop: 20 }}>
          <input
            type="checkbox"
            checked={confirmTestWrite}
            onChange={(event) => setConfirmTestWrite(event.target.checked)}
            style={{ marginRight: 8 }}
          />
          I confirm this will create one test-only document in the oodlesnet-test Firestore products collection.
        </label>
      </form>
      {result && <pre style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere", marginTop: 24, padding: 14, background: "#eee", color: "#111" }}>{result}</pre>}
      <p style={{ marginTop: 24, fontSize: 14 }}>Test controls check full read-back, duplicate rejection (409), invalid-data rejection (400), and bad-token rejection (401). Duplicate testing requires the confirmation checkbox but must not create or overwrite data. The endpoint is hard-locked to oodlesnet-test. Do not use this form for real product listings.</p>
    </main>
  );
}
