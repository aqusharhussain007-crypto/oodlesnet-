"use client";

import { useState } from "react";
import { parseProductImport } from "@/lib/product-import.mjs";

export default function TestBulkImportPage() {
  const [file, setFile] = useState(null);
  const [products, setProducts] = useState([]);
  const [token, setToken] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [result, setResult] = useState("");

  async function selectFile(event) {
    const chosen = event.target.files?.[0] || null;
    setFile(chosen);
    setProducts([]);
    setConfirmed(false);
    setMessage("");
    setResult("");
    if (!chosen) return;
    try {
      const content = await chosen.text();
      const parsed = parseProductImport({ filename: chosen.name, content });
      setProducts(parsed);
      setMessage("Validated " + parsed.length + " product(s). No database writes have occurred.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not parse the selected file.");
    }
  }

  async function submitImport(confirmWrite) {
    if (!token || !products.length) {
      setMessage("Enter the test-only writer token and choose a valid CSV/JSON file first.");
      return;
    }
    if (confirmWrite && !confirmed) {
      setMessage("Tick the explicit test-database confirmation before writing.");
      return;
    }
    setBusy(true);
    setResult("");
    try {
      const response = await fetch("/api/admin/products/batch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({
          products,
          sourceFormat: file?.name.toLowerCase().endsWith(".csv") ? "csv" : "json",
          confirmWrite,
        }),
        cache: "no-store",
      });
      const data = await response.json().catch(() => ({ error: "Response was not valid JSON." }));
      setResult(JSON.stringify({ httpStatus: response.status, ...data }, null, 2));
      setMessage(confirmWrite
        ? "Request completed. Review every row result before retrying anything."
        : "Dry run completed. No data should have been written.");
    } catch {
      setMessage("Network result is uncertain. No automatic retry was made.");
    } finally {
      setToken("");
      setBusy(false);
    }
  }

  const fieldStyle = { display: "block", width: "100%", boxSizing: "border-box", padding: 12, marginTop: 6, fontSize: 16 };
  return (
    <main style={{ maxWidth: 760, margin: "24px auto", padding: 18, fontFamily: "Arial, sans-serif", lineHeight: 1.5, color: "#111" }}>
      <h1 style={{ fontSize: 28, fontWeight: 800 }}>Test CSV / JSON Product Import</h1>
      <p><strong>Fixed target:</strong> oodlesnet-test. This page is for testing only and must not be used for production listings.</p>
      <p style={{ border: "2px solid #b45309", padding: 12, borderRadius: 8 }}>No writes occur while selecting a file or previewing. Every product needs a stable documentId. Existing IDs and exact matching name/brand/category records are skipped, never overwritten.</p>
      <label style={{ display: "block", marginTop: 16 }}>Choose products.csv or products.json
        <input type="file" accept=".csv,.json,application/json,text/csv" onChange={selectFile} style={fieldStyle} />
      </label>
      {file && <p>Selected: {file.name}</p>}
      {products.length > 0 && <section style={{ marginTop: 16, border: "1px solid #888", borderRadius: 8, padding: 12 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700 }}>Preview ({products.length} product(s))</h2>
        <pre style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere", maxHeight: 320, overflow: "auto", background: "#eee", padding: 12, color: "#111" }}>{JSON.stringify(products, null, 2)}</pre>
      </section>}
      <h2 style={{ marginTop: 22, fontSize: 21, fontWeight: 700 }}>Test-only access</h2>
      <label style={{ display: "block", marginTop: 12 }}>Test writer token
        <input type="password" autoComplete="off" value={token} onChange={(event) => setToken(event.target.value)} style={fieldStyle} placeholder="Paste the test-only writer token" />
      </label>
      <p style={{ fontSize: 13 }}>This token is restricted to this test Preview deployment. It is held only in page memory and cleared after each request.</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 16 }}>
        <button type="button" disabled={busy || !products.length || !token.trim()} onClick={() => submitImport(false)} style={{ padding: 12 }}>Run dry-run</button>
        <button type="button" disabled={busy || !products.length || !token.trim() || !confirmed} onClick={() => submitImport(true)} style={{ padding: 12, background: "#063c5a", color: "#fff" }}>{busy ? "Working…" : "Write to TEST Firestore"}</button>
      </div>
      <label style={{ display: "flex", gap: 10, alignItems: "flex-start", marginTop: 16 }}>
        <input type="checkbox" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} style={{ marginTop: 5, width: 20, height: 20 }} />
        <span>I explicitly confirm creating eligible products only in <strong>oodlesnet-test</strong>. This is not production.</span>
      </label>
      {message && <p role="status" style={{ marginTop: 16, overflowWrap: "anywhere" }}>{message}</p>}
      {result && <pre style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere", background: "#eee", color: "#111", padding: 12, marginTop: 16 }}>{result}</pre>}
      <p style={{ fontSize: 13, marginTop: 20 }}>CSV columns: documentId, name, brand, categorySlug, description, imageUrl, tags, store. Use pipe-separated tags (tag1|tag2) and a JSON array in the store column. JSON accepts either an array or an object with a products array. Maximum 100 products per file.</p>
    </main>
  );
}
