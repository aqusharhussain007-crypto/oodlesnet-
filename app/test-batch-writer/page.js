"use client";

import { useState } from "react";

const sampleJson = JSON.stringify([{
  name: "OodlesNet TEST ONLY Batch Sample",
  brand: "OodlesNet Test",
  categorySlug: "test-products",
  description: "Clearly labelled test-only batch import sample.",
  imageUrl: "",
  tags: ["test-only", "batch-writer"],
  store: [{ name: "Example Store (Test)", price: 499, offer: "Test only", url: "https://example.com/test-batch-product" }]
}], null, 2);

const sampleCsv = `name,brand,categorySlug,description,imageUrl,tags,store,documentId
"OodlesNet TEST ONLY CSV Sample","OodlesNet Test","test-products","Test-only batch sample","","[""test-only"",""csv-import""]","[{""name"":""Example Store (Test)"",""price"":499,""offer"":""Test only"",""url"":""https://example.com/test-csv-product""}]"""`;

export default function TestBatchWriterPage() {
  const [token, setToken] = useState("");
  const [format, setFormat] = useState("json");
  const [data, setData] = useState(sampleJson);
  const [confirmWrite, setConfirmWrite] = useState(false);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState("");

  async function submit(event) {
    event.preventDefault();
    const action = event.nativeEvent.submitter?.value || "dry-run";
    const write = action === "write";
    if (write && !confirmWrite) {
      setResult("Tick the confirmation box before writing test records.");
      return;
    }
    setBusy(true);
    setResult("");
    const submittedToken = token.trim();
    try {
      const response = await fetch("/api/test-batch-writer", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${submittedToken}` },
        body: JSON.stringify({ format, data, confirmWrite: write }),
      });
      const json = await response.json().catch(() => ({ error: "Response was not valid JSON." }));
      setResult(JSON.stringify({ httpStatus: response.status, ...json }, null, 2));
    } catch {
      setResult("Request failed. Check the connection and try again.");
    } finally {
      setToken("");
      setBusy(false);
    }
  }

  function changeFormat(next) {
    setFormat(next);
    setData(next === "json" ? sampleJson : sampleCsv);
    setResult("");
  }

  return (
    <main style={{ maxWidth: 820, margin: "32px auto", padding: 20, fontFamily: "Arial, sans-serif" }}>
      <h1>Test CSV / JSON Batch Writer</h1>
      <p>This tool targets only the isolated <strong>oodlesnet-test</strong> Firestore project. Maximum 50 products per request. All rows are validated before any writes are attempted.</p>
      <p><strong>JSON:</strong> paste an array of product objects using the product schema. <strong>CSV:</strong> required columns are name, brand, categorySlug, and store. The store column must contain a JSON array; tags may also contain a JSON array. Optional columns: description, imageUrl, tags, documentId. Quote CSV fields containing commas or newlines.</p>
      <form onSubmit={submit}>
        <label htmlFor="batch-token" style={{ display: "block", marginBottom: 8 }}>TEST_WRITER_TOKEN</label>
        <input id="batch-token" type="password" autoComplete="off" value={token} onChange={(event) => setToken(event.target.value)} required style={{ boxSizing: "border-box", width: "100%", padding: 12, marginBottom: 16 }} />
        <label htmlFor="batch-format" style={{ display: "block", marginBottom: 8 }}>Input format</label>
        <select id="batch-format" value={format} onChange={(event) => changeFormat(event.target.value)} style={{ padding: 10, marginBottom: 16 }}>
          <option value="json">JSON array</option>
          <option value="csv">CSV</option>
        </select>
        <label htmlFor="batch-data" style={{ display: "block", marginBottom: 8 }}>Product data</label>
        <textarea id="batch-data" value={data} onChange={(event) => setData(event.target.value)} rows={16} required style={{ boxSizing: "border-box", width: "100%", padding: 12, fontFamily: "monospace", fontSize: 13, marginBottom: 16 }} />
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          <button type="submit" value="dry-run" disabled={busy || !token.trim() || !data.trim()} style={{ padding: "12px 18px" }}>{busy ? "Working…" : "Validate / Dry-run"}</button>
          <button type="submit" value="write" disabled={busy || !token.trim() || !data.trim() || !confirmWrite} style={{ padding: "12px 18px" }}>{busy ? "Working…" : "Write test batch"}</button>
        </div>
        <label style={{ display: "block", marginTop: 20 }}>
          <input type="checkbox" checked={confirmWrite} onChange={(event) => setConfirmWrite(event.target.checked)} style={{ marginRight: 8 }} />
          I confirm these are test-only records for the oodlesnet-test project.
        </label>
      </form>
      {result && <pre style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere", marginTop: 24, padding: 14, background: "#eee", color: "#111" }}>{result}</pre>}
      <p style={{ marginTop: 24, fontSize: 14 }}>Writes are create-only: existing document IDs are rejected, never overwritten. Use dry-run first. Never paste credentials into the data field or chat. This page is not for production products.</p>
    </main>
  );
}
