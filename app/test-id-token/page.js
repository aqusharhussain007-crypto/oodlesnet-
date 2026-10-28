"use client";

import { useState } from "react";

const SAMPLE_PRODUCT = {
  documentId: "safe-test-product-001",
  product: {
    name: "Test Product",
    brand: "Test Brand",
    categorySlug: "test",
    store: [{ name: "Test Store", price: 100, url: "https://example.com" }],
  },
};

export default function FirebaseIdTokenTestPage() {
  const [apiKey, setApiKey] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const [uid, setUid] = useState("");
  const [message, setMessage] = useState("");
  const [result, setResult] = useState("");
  const [busy, setBusy] = useState(false);

  async function signIn(event) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    setResult("");
    setToken("");
    setUid("");
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
      if (!response.ok) {
        const code = data.error?.message || "";
        const messages = {
          CONFIGURATION_NOT_FOUND: "Firebase Authentication is not configured for this project. Open Authentication and enable Email/Password.",
          EMAIL_NOT_FOUND: "This email does not exist in the Firebase project for this API key.",
          INVALID_PASSWORD: "Password is incorrect.",
          INVALID_LOGIN_CREDENTIALS: "Email or password is incorrect for this Firebase project.",
          USER_DISABLED: "This account is disabled.",
          TOO_MANY_ATTEMPTS_TRY_LATER: "Too many attempts. Wait before trying again.",
          API_KEY_HTTP_REFERRER_BLOCKED: "This test API key blocks this website. Do not weaken production key restrictions.",
          API_KEY_INVALID: "Copy the Web API key from oodlesnet-test, not production.",
          OPERATION_NOT_ALLOWED: "Enable Email/Password in the test project's Authentication → Sign-in method.",
          PROJECT_NOT_FOUND: "Verify that the API key belongs to oodlesnet-test.",
        };
        throw new Error(messages[code] || code || "Sign-in failed. Check test-project Authentication setup.");
      }
      if (!data.idToken) throw new Error("Firebase did not return an ID token.");
      setToken(data.idToken);
      setUid(data.localId || "UID unavailable");
      setMessage("Signed in. You can now run the dry-run test. The sample will not be written to Firestore.");
    } catch (error) {
      setMessage(error.message || "Request failed.");
    } finally {
      setPassword("");
      setBusy(false);
    }
  }

  async function runAuthorizationProbe(kind) {
    setBusy(true);
    setMessage("");
    setResult("");
    try {
      const headers = { "Content-Type": "application/json" };
      if (kind === "invalid-token") headers.Authorization = "Bearer definitely-not-a-valid-firebase-id-token";
      const response = await fetch("/api/admin/products", {
        method: "POST",
        headers,
        body: JSON.stringify(SAMPLE_PRODUCT),
        cache: "no-store",
      });
      const data = await response.json().catch(() => ({}));
      const expected = response.status === 401;
      setResult(JSON.stringify({ test: kind, expectedStatus: 401, httpStatus: response.status, passed: expected, ...data }, null, 2));
      setMessage(expected ? "Authorization rejection passed. No write was performed." : "Unexpected response; inspect the result. No confirmWrite flag was sent.");
    } catch (error) {
      setMessage("Could not reach the test writer: " + (error.message || "network error"));
    } finally {
      setBusy(false);
    }
  }

  async function runDryRun() {
    if (!token) return;
    setBusy(true);
    setMessage("");
    setResult("");
    try {
      const response = await fetch("/api/admin/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + token,
        },
        body: JSON.stringify(SAMPLE_PRODUCT),
        cache: "no-store",
      });
      const data = await response.json().catch(() => ({}));
      setResult(JSON.stringify({ httpStatus: response.status, ...data }, null, 2));
      setMessage(response.ok && data.mode === "dry-run"
        ? "Dry-run passed. No Firestore write was performed."
        : "Test returned a response. Review the result below; no confirmWrite flag was sent.");
    } catch (error) {
      setMessage("Could not reach the test writer: " + (error.message || "network error"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main style={{ maxWidth: 620, margin: "24px auto", padding: 20, fontFamily: "Arial, sans-serif", lineHeight: 1.5 }}>
      <h1 style={{ fontSize: 26, fontWeight: 700 }}>Firebase ID Token — Isolated Test</h1>
      <p><strong>Use only the Web API key and test account from oodlesnet-test.</strong> Never enter your production password or use the production API key.</p>
      <p>Credentials go directly from your browser to Firebase Authentication. The token stays in this page's memory and is sent only to this deployment's test writer when you tap the dry-run button.</p>
      <section style={{ margin: "16px 0", padding: 14, border: "1px solid #888", borderRadius: 8 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700 }}>Safe authorization checks</h2>
        <p>These send no token or a deliberately invalid token. Both must return HTTP 401 and cannot write data.</p>
        <button disabled={busy} type="button" onClick={() => runAuthorizationProbe("missing-token")} style={{ padding: 12, fontWeight: 700, marginRight: 8, marginBottom: 8 }}>Test missing token (401)</button>
        <button disabled={busy} type="button" onClick={() => runAuthorizationProbe("invalid-token")} style={{ padding: 12, fontWeight: 700, marginBottom: 8 }}>Test invalid token (401)</button>
      </section>
      <form onSubmit={signIn} style={{ display: "grid", gap: 12 }}>
        <label>Test-project Firebase Web API key
          <input required autoComplete="off" value={apiKey} onChange={e => setApiKey(e.target.value)} style={{ display: "block", width: "100%", padding: 10, boxSizing: "border-box" }} />
        </label>
        <label>Test-project account email
          <input required type="email" autoComplete="username" value={email} onChange={e => setEmail(e.target.value)} style={{ display: "block", width: "100%", padding: 10, boxSizing: "border-box" }} />
        </label>
        <label>Test-project account password
          <input required type="password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} style={{ display: "block", width: "100%", padding: 10, boxSizing: "border-box" }} />
        </label>
        <button disabled={busy} type="submit" style={{ padding: 12, fontWeight: 700 }}>{busy ? "Please wait…" : "Sign in and get test ID token"}</button>
      </form>
      {message && <p role="status" style={{ marginTop: 16, overflowWrap: "anywhere" }}>{message}</p>}
      {token && <section style={{ marginTop: 18, padding: 14, border: "1px solid #888", borderRadius: 8 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700 }}>Authentication succeeded</h2>
        <p>Test account UID: <code>{uid}</code></p>
        <p>Token is held in memory and is not displayed. Tap below to verify authentication and product validation in dry-run mode.</p>
        <button disabled={busy} type="button" onClick={runDryRun} style={{ padding: 12, fontWeight: 700 }}>{busy ? "Testing…" : "Run safe dry-run test"}</button>
        <p style={{ fontSize: 13 }}>This sends a sample product without confirmWrite=true. It cannot create a Firestore document.</p>
      </section>}
      {result && <pre style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere", padding: 12, background: "#eee", color: "#111", borderRadius: 8 }}>{result}</pre>}
    </main>
  );
}
