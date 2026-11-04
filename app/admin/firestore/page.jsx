"use client";

import { useState } from "react";

const FIREBASE_API_KEY = "AIzaSyDAGbs7GATXSzzWzPw_1Zf49ZDgG56mVpw";

export default function FirestoreAdminPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [idToken, setIdToken] = useState("");
  const [collection, setCollection] = useState("products");
  const [documents, setDocuments] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [status, setStatus] = useState("Sign in with your existing authorized Firebase admin account.");
  const [busy, setBusy] = useState(false);
  const [operation, setOperation] = useState("create");
  const [documentId, setDocumentId] = useState("");
  const [jsonData, setJsonData] = useState("");
  const [preview, setPreview] = useState(null);

  async function login(event) {
    event.preventDefault();
    setBusy(true);
    setStatus("Signing in…");
    try {
      const response = await fetch("https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=" + FIREBASE_API_KEY, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password, returnSecureToken: true }),
      });
      const result = await response.json();
      if (!response.ok || !result.idToken) throw new Error(result.error?.message || "Firebase sign-in failed.");
      setIdToken(result.idToken);
      setPassword("");
      setStatus("Signed in. Select a collection and load its records.");
    } catch (error) {
      setStatus(error?.message || "Sign-in failed.");
    } finally {
      setBusy(false);
    }
  }

  async function requestRecords(targetCollection, nextCursor = "") {
    if (!idToken) return;
    setBusy(true);
    setStatus("Reading Firestore…");
    try {
      const params = new URLSearchParams({ collection: targetCollection, limit: "50" });
      if (nextCursor) params.set("cursor", nextCursor);
      const response = await fetch("/api/admin/firestore-audit?" + params.toString(), {
        headers: { Authorization: "Bearer " + idToken },
        cache: "no-store",
      });
      const result = await response.json();
      if (!response.ok || !result.ok) throw new Error(result.error || "Firestore read failed.");
      setDocuments(old => nextCursor ? [...old, ...result.documents] : result.documents);
      setCursor(result.nextCursor);
      setHasMore(result.hasMore);
      setStatus("Loaded " + result.count + " records from " + result.collection + ".");
    } catch (error) {
      setStatus(error?.message || "Request failed.");
    } finally {
      setBusy(false);
    }
  }

  function changeCollection(value) {
    setCollection(value);
    setDocuments([]);
    setCursor(null);
    setHasMore(false);
    setPreview(null);
    setDocumentId("");
    setJsonData("");
  }

  async function prepareChange() {
    if (!idToken) return;
    let data;
    if (operation !== "delete") {
      try { data = JSON.parse(jsonData); }
      catch { setStatus("Enter valid JSON before preparing the change."); return; }
    }
    if (operation !== "create" && !documentId.trim()) {
      setStatus("Enter the existing Firestore document ID.");
      return;
    }
    setBusy(true);
    setPreview(null);
    setStatus("Validating change (dry-run; no records will be changed)…");
    try {
      const response = await fetch("/api/admin/firestore-audit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + idToken },
        body: JSON.stringify({
          operation, collection, ...(documentId.trim() ? { documentId: documentId.trim() } : {}),
          ...(operation !== "delete" ? { data } : {}),
          confirm: false, ...(operation === "delete" ? { confirmDelete: true } : {})
        }),
      });
      const result = await response.json();
      if (!response.ok || !result.ok) throw new Error(result.error || "Validation failed.");
      setPreview(result);
      setStatus("Dry-run passed. No database changes have been made. Review the preview before applying.");
    } catch (error) {
      setStatus(error?.message || "Could not validate change.");
    } finally {
      setBusy(false);
    }
  }

  async function applyChange() {
    if (!preview || !idToken) return;
    const phrase = operation === "delete" ? "DELETE" : "APPLY";
    const target = preview.documentId || "new auto-generated document";
    if (!window.confirm("Final confirmation: " + operation.toUpperCase() + " in " + collection + " (" + target + ")? This affects the LIVE production database. Choose OK only if you intend to proceed.")) return;
    setBusy(true);
    setStatus("Applying approved change…");
    try {
      const data = operation === "delete" ? undefined : JSON.parse(jsonData);
      const response = await fetch("/api/admin/firestore-audit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + idToken },
        body: JSON.stringify({
          operation, collection, ...(documentId.trim() ? { documentId: documentId.trim() } : {}),
          ...(operation !== "delete" ? { data } : {}),
          confirm: true, ...(operation === "delete" ? { confirmDelete: true } : {})
        }),
      });
      const result = await response.json();
      if (!response.ok || !result.ok) throw new Error(result.error || "Change failed.");
      setPreview(null);
      setJsonData("");
      setDocumentId("");
      setStatus("Success: " + result.mode + " " + collection + " document " + result.documentId + ". Backup: " + (result.backupId || "not required") + ". Audit logged.");
      await requestRecords(collection);
    } catch (error) {
      setStatus(error?.message || "Change failed. Check the record before retrying.");
    } finally {
      setBusy(false);
    }
  }

  function logout() {
    setIdToken("");
    setPassword("");
    setDocuments([]);
    setCursor(null);
    setHasMore(false);
    setPreview(null);
    setStatus("Signed out. Close this page if you used a shared device.");
  }

  const example = collection === "products"
    ? (operation === "update"
      ? '{\n  "name": "Updated product name",\n  "brand": "Brand",\n  "categorySlug": "electronics",\n  "description": "Product description",\n  "imageUrl": "https://example.com/image.jpg",\n  "tags": ["tag1"],\n  "store": [\n    { "name": "Amazon", "price": 999, "offer": "", "url": "https://www.amazon.in/" }\n  ]\n}'
      : '{\n  "name": "Product name",\n  "brand": "Brand",\n  "categorySlug": "electronics",\n  "description": "Product description",\n  "imageUrl": "https://example.com/image.jpg",\n  "tags": ["tag1"],\n  "store": [\n    { "name": "Amazon", "price": 999, "offer": "", "url": "https://www.amazon.in/" }\n  ]\n}')
    : '{\n  "slug": "electronics",\n  "name": "Electronics",\n  "icon": "📱",\n  "order": 1\n}';

  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: 20, color: "#e5e7eb", background: "#0b1220", minHeight: "100vh" }}>
      <h1 style={{ fontSize: 24, fontWeight: 700 }}>OodlesNet Firestore Admin</h1>
      <p style={{ color: "#aab4c5", margin: "8px 0 20px" }}>Production access is restricted to authorized Firebase admin accounts. Every write is validated; updates and deletes are backed up and audited.</p>
      {!idToken ? (
        <form onSubmit={login} style={{ display: "grid", gap: 12, maxWidth: 420 }}>
          <label>Email<input required type="email" autoComplete="username" value={email} onChange={e => setEmail(e.target.value)} style={fieldStyle} /></label>
          <label>Password<input required type="password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} style={fieldStyle} /></label>
          <button disabled={busy} style={buttonStyle}>{busy ? "Please wait…" : "Sign in"}</button>
        </form>
      ) : (
        <section style={{ display: "grid", gap: 14 }}>
          <p>Authenticated Firebase session</p>
          <select value={collection} onChange={e => changeCollection(e.target.value)} style={fieldStyle}>
            <option value="products">Products</option><option value="categories">Categories</option>
          </select>
          <div style={rowStyle}>
            <button disabled={busy} onClick={() => requestRecords(collection)} style={buttonStyle}>Load / refresh</button>
            <button disabled={busy} onClick={logout} style={secondaryButtonStyle}>Sign out</button>
          </div>
          <p style={{ color: "#aab4c5" }}>Read view: displays live records. Write tools below require a dry-run and a separate confirmation.</p>
          <p>{documents.length} records displayed</p>
          <pre style={preStyle}>{JSON.stringify(documents, null, 2)}</pre>
          {hasMore && <button disabled={busy} onClick={() => requestRecords(collection, cursor)} style={buttonStyle}>Load next 50</button>}
          <hr style={{ borderColor: "#334155", margin: "12px 0" }} />
          <h2 style={{ fontSize: 21, fontWeight: 700 }}>Manage {collection}</h2>
          <label>Operation
            <select value={operation} onChange={e => { setOperation(e.target.value); setPreview(null); }} style={fieldStyle}>
              <option value="create">Add new record</option><option value="update">Edit existing record</option><option value="delete">Delete record</option>
            </select>
          </label>
          {operation !== "create" && <label>Existing document ID<input value={documentId} onChange={e => { setDocumentId(e.target.value); setPreview(null); }} placeholder="Paste exact Firestore document ID" style={fieldStyle} /></label>}
          {operation !== "delete" && <label>Record data (JSON)
            <textarea value={jsonData} onChange={e => { setJsonData(e.target.value); setPreview(null); }} placeholder={example} rows={collection === "products" ? 14 : 8} spellCheck={false} style={{ ...fieldStyle, fontFamily: "monospace", fontSize: 13, minHeight: 180 }} />
          </label>}
          <p style={{ color: "#fbbf24", fontSize: 13 }}>Important: This changes the LIVE production database. Verify every field, price, image URL and store link before applying. Product system fields (views/impressions) are protected.</p>
          <button disabled={busy} onClick={prepareChange} style={buttonStyle}>{busy ? "Please wait…" : "1. Validate / preview (no changes)"}</button>
          {preview && <div style={{ background: "#17243a", padding: 14, borderRadius: 10, overflowWrap: "anywhere" }}>
            <strong>Dry-run preview — no changes made</strong>
            <pre style={{ ...preStyle, maxHeight: 220 }}>{JSON.stringify(preview, null, 2)}</pre>
            <button disabled={busy} onClick={applyChange} style={dangerButtonStyle}>2. Confirm and apply to LIVE database</button>
            <p style={{ color: "#fbbf24", fontSize: 12 }}>This is irreversible for creates. Updates/deletes create a backup first. Category deletion is blocked while products use it.</p>
          </div>}
        </section>
      )}
      <p role="status" style={{ marginTop: 20, color: "#aab4c5", overflowWrap: "anywhere" }}>{status}</p>
    </main>
  );
}

const fieldStyle = { display: "block", width: "100%", boxSizing: "border-box", padding: 12, marginTop: 6, borderRadius: 8, color: "#111827", background: "#fff", border: "1px solid #64748b" };
const buttonStyle = { padding: "12px 16px", borderRadius: 8, background: "#2563eb", color: "#fff", border: 0, fontWeight: 600 };
const secondaryButtonStyle = { ...buttonStyle, background: "#475569" };
const dangerButtonStyle = { ...buttonStyle, background: "#b91c1c", width: "100%" };
const rowStyle = { display: "flex", flexWrap: "wrap", gap: 10 };
const preStyle = { whiteSpace: "pre-wrap", overflowWrap: "anywhere", background: "#111c2e", padding: 14, borderRadius: 10, fontSize: 12, maxHeight: "45vh", overflow: "auto" };
