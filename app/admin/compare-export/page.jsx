"use client";

import { useState } from "react";

const FIREBASE_API_KEY = "AIzaSyDAGbs7GATXSzzWzPw_1Zf49ZDgG56mVpw";

export default function CompareExportPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [idToken, setIdToken] = useState("");
  const [status, setStatus] = useState("Sign in with your existing authorized Firebase admin account.");
  const [busy, setBusy] = useState(false);
  const [count, setCount] = useState(0);

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
      setStatus("Signed in. Ready to export product records.");
    } catch (error) {
      setStatus(error?.message || "Sign-in failed.");
    } finally {
      setBusy(false);
    }
  }

  async function exportProducts() {
    if (!idToken || busy) return;
    setBusy(true);
    setStatus("Reading product records from Firestore (read-only)…");
    try {
      let cursor = "";
      let all = [];
      let page = 0;
      do {
        const params = new URLSearchParams({ collection: "products", limit: "50" });
        if (cursor) params.set("cursor", cursor);
        const response = await fetch("/api/admin/firestore-audit?" + params.toString(), {
          headers: { Authorization: "Bearer " + idToken },
          cache: "no-store",
        });
        const result = await response.json();
        if (!response.ok || !result.ok) throw new Error(result.error || "Product read failed.");
        all = all.concat(result.documents || []);
        cursor = result.hasMore ? result.nextCursor : "";
        page += 1;
        setCount(all.length);
        setStatus("Read " + all.length + " products…");
        if (page > 100) throw new Error("Unexpected pagination limit; export stopped safely.");
      } while (cursor);

      if (!all.length) throw new Error("No product records were returned.");
      const payload = {
        exportedAt: new Date().toISOString(),
        project: "oodlesnet-6c19e",
        collection: "products",
        count: all.length,
        readOnly: true,
        documents: all,
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "oodlesnet-products-export.json";
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
      setStatus("Export complete: " + all.length + " product records downloaded. No Firestore data was changed.");
      setCount(all.length);
    } catch (error) {
      setStatus(error?.message || "Export failed.");
    } finally {
      setBusy(false);
    }
  }

  function logout() {
    setIdToken("");
    setPassword("");
    setCount(0);
    setStatus("Signed out.");
  }

  const field = { width: "100%", padding: 13, borderRadius: 9, border: "1px solid #64748b", background: "#fff", color: "#0f172a", fontSize: 16, boxSizing: "border-box" };
  const button = { padding: "14px 18px", border: 0, borderRadius: 10, background: "linear-gradient(100deg,#126080,#10b981)", color: "white", fontSize: 17, fontWeight: 700, width: "100%" };

  return (
    <main style={{ maxWidth: 680, margin: "0 auto", padding: 20, minHeight: "100vh", background: "#eef2f7", color: "#173247" }}>
      <section style={{ background: "#fff", border: "1px solid #cbd5e1", borderRadius: 18, padding: 22 }}>
        <h1 style={{ fontSize: 27, fontWeight: 800, margin: "0 0 12px" }}>OodlesNet product export</h1>
        <p style={{ lineHeight: 1.6, color: "#64748b" }}>Secure, read-only export for automated comparison testing. It reads the products collection in pages of 50 and downloads one JSON file. It does not create, update or delete Firestore records.</p>
        {!idToken ? (
          <form onSubmit={login} style={{ display: "grid", gap: 14 }}>
            <label style={{ display: "grid", gap: 6 }}>Admin email<input required type="email" autoComplete="username" value={email} onChange={e => setEmail(e.target.value)} style={field} /></label>
            <label style={{ display: "grid", gap: 6 }}>Password<input required type="password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} style={field} /></label>
            <button disabled={busy} style={button}>{busy ? "Please wait…" : "Sign in"}</button>
          </form>
        ) : (
          <div style={{ display: "grid", gap: 14 }}>
            <p>Authenticated admin session. Export is read-only.</p>
            <button disabled={busy} onClick={exportProducts} style={button}>{busy ? "Reading products…" : "Export all products (JSON)"}</button>
            <button disabled={busy} onClick={logout} style={{ ...button, background: "#475569" }}>Sign out</button>
          </div>
        )}
        <p role="status" aria-live="polite" style={{ marginTop: 18, padding: 13, background: "#f1f5f9", borderRadius: 9, lineHeight: 1.5 }}>{status}</p>
        {count > 0 && <p style={{ fontWeight: 700 }}>Records read: {count}</p>}
      </section>
    </main>
  );
}
