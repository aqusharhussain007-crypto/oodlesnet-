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

  function logout() {
    setIdToken("");
    setPassword("");
    setDocuments([]);
    setCursor(null);
    setHasMore(false);
    setStatus("Signed out. Close this page if you used a shared device.");
  }

  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: 20, color: "#e5e7eb", background: "#0b1220", minHeight: "100vh" }}>
      <h1 style={{ fontSize: 24, fontWeight: 700 }}>OodlesNet Firestore Admin</h1>
      <p style={{ color: "#aab4c5", margin: "8px 0 20px" }}>Production read access is restricted to authorized Firebase admin accounts.</p>
      {!idToken ? (
        <form onSubmit={login} style={{ display: "grid", gap: 12, maxWidth: 420 }}>
          <label>Email<input required type="email" autoComplete="username" value={email} onChange={e => setEmail(e.target.value)} style={fieldStyle} /></label>
          <label>Password<input required type="password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} style={fieldStyle} /></label>
          <button disabled={busy} style={buttonStyle}>{busy ? "Please wait…" : "Sign in"}</button>
        </form>
      ) : (
        <section style={{ display: "grid", gap: 12 }}>
          <p>Authenticated Firebase session</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            <select value={collection} onChange={e => { setCollection(e.target.value); setDocuments([]); setCursor(null); setHasMore(false); requestRecords(e.target.value); }} style={fieldStyle}>
              <option value="products">Products</option>
              <option value="categories">Categories</option>
            </select>
            <button disabled={busy} onClick={() => requestRecords(collection)} style={buttonStyle}>Load / refresh</button>
            <button disabled={busy} onClick={logout} style={buttonStyle}>Sign out</button>
          </div>
          <p style={{ color: "#aab4c5" }}>Read-only view. This page does not create, edit, or delete records.</p>
          <p>{documents.length} records displayed</p>
          <pre style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere", background: "#111c2e", padding: 14, borderRadius: 10, fontSize: 12, maxHeight: "60vh", overflow: "auto" }}>{JSON.stringify(documents, null, 2)}</pre>
          {hasMore && <button disabled={busy} onClick={() => requestRecords(collection, cursor)} style={buttonStyle}>Load next 50</button>}
        </section>
      )}
      <p role="status" style={{ marginTop: 20, color: "#aab4c5", overflowWrap: "anywhere" }}>{status}</p>
    </main>
  );
}

const fieldStyle = { display: "block", width: "100%", padding: 12, marginTop: 6, borderRadius: 8, color: "#111827", background: "#fff", border: "1px solid #64748b" };
const buttonStyle = { padding: "11px 16px", borderRadius: 8, background: "#2563eb", color: "#fff", border: 0, fontWeight: 600 };
