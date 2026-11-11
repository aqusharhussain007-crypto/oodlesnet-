"use client";

import { useState } from "react";

export default function TestAttributeRegistryPage() {
  const [apiKey, setApiKey] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const [message, setMessage] = useState("");
  const [result, setResult] = useState("");
  const [busy, setBusy] = useState(false);

  async function signIn(event) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    setResult("");
    setToken("");
    try {
      const response = await fetch(
        "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=" + encodeURIComponent(apiKey.trim()),
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email.trim(), password, returnSecureToken: true }),
        }
      );
      const data = await response.json();
      if (!response.ok || !data.idToken) {
        throw new Error(data.error?.message || "Test-project sign-in failed.");
      }
      setToken(data.idToken);
      setMessage("Signed in. Credentials were sent directly to Firebase Authentication, not to this app's server.");
    } catch (error) {
      setMessage(error.message || "Sign-in failed.");
    } finally {
      setPassword("");
      setBusy(false);
    }
  }

  async function runDryRun() {
    if (!token) return;
    setBusy(true);
    setMessage("");
    setResult("");
    try {
      const response = await fetch("/api/admin/attributes", {
        method: "GET",
        headers: { Authorization: "Bearer " + token },
        cache: "no-store",
      });
      const data = await response.json().catch(() => ({}));
      setResult(JSON.stringify({ httpStatus: response.status, ...data }, null, 2));
      setMessage(response.ok && data.mode === "dry-run"
        ? "Read-only audit completed. No Firestore writes were performed."
        : "The endpoint returned a response. Check the result below.");
    } catch (error) {
      setMessage(error.message || "Could not reach the TEST endpoint.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main style={{ maxWidth: 640, margin: "24px auto", padding: 20, fontFamily: "Arial, sans-serif", lineHeight: 1.5 }}>
      <h1 style={{ fontSize: 25, fontWeight: 700 }}>TEST Attribute Registry Audit</h1>
      <p><strong>TEST project only:</strong> use the Firebase Web API key and account belonging to <code>oodlesnet-test</code>. Do not use production credentials.</p>
      <p>Your email and password are sent directly from this browser to Firebase Authentication. The ID token remains in this page's memory and is sent only to the read-only TEST audit endpoint. Nothing is saved or displayed as a token.</p>
      <form onSubmit={signIn} style={{ display: "grid", gap: 12 }}>
        <label>TEST Firebase Web API key
          <input required autoComplete="off" value={apiKey} onChange={e => setApiKey(e.target.value)} style={{ display: "block", width: "100%", boxSizing: "border-box", padding: 11 }} />
        </label>
        <label>TEST admin account email
          <input required type="email" autoComplete="username" value={email} onChange={e => setEmail(e.target.value)} style={{ display: "block", width: "100%", boxSizing: "border-box", padding: 11 }} />
        </label>
        <label>TEST admin account password
          <input required type="password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} style={{ display: "block", width: "100%", boxSizing: "border-box", padding: 11 }} />
        </label>
        <button disabled={busy} type="submit" style={{ padding: 12, fontWeight: 700 }}>{busy ? "Please wait…" : "Sign in to TEST Firebase"}</button>
      </form>
      {token && <section style={{ marginTop: 18, padding: 14, border: "1px solid #888", borderRadius: 8 }}>
        <strong>Authentication succeeded.</strong>
        <p>Now run the attribute seed comparison. This is strictly read-only.</p>
        <button disabled={busy} type="button" onClick={runDryRun} style={{ padding: 12, fontWeight: 700 }}>{busy ? "Auditing…" : "Run read-only registry audit"}</button>
      </section>}
      {message && <p role="status" style={{ marginTop: 16, overflowWrap: "anywhere" }}>{message}</p>}
      {result && <pre style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere", padding: 12, background: "#eee", color: "#111", borderRadius: 8 }}>{result}</pre>}
    </main>
  );
}
