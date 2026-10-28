"use client";

import { useState } from "react";

// Production-only verification page. Credentials are sent directly to Firebase Auth;
// this page never sends or displays the password or ID token and never requests a write.
const SAMPLE_PRODUCT = {
  documentId: "safe-production-dry-run-check",
  product: {
    name: "Production Writer Dry-Run Check",
    brand: "Internal Test",
    categorySlug: "internal-test",
    store: [{ name: "Example Store", price: 100, url: "https://example.com/product" }],
  },
};

const FIREBASE_WEB_API_KEY = "AIzaSyDAGbs7GATXSzzWzPw_1Zf49ZDgG56mVpw";

export default function ProductionWriterCheckPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [uid, setUid] = useState("");
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
    setUid("");
    try {
      const response = await fetch(
        "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=" + encodeURIComponent(FIREBASE_WEB_API_KEY),
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email.trim(), password, returnSecureToken: true }),
          cache: "no-store",
        }
      );
      const data = await response.json();
      if (!response.ok) {
        const code = data.error?.message || "SIGN_IN_FAILED";
        const messages = {
          CONFIGURATION_NOT_FOUND: "Firebase Authentication is not configured for the production project.",
          EMAIL_NOT_FOUND: "This email does not exist in the production Firebase project.",
          INVALID_PASSWORD: "Password is incorrect.",
          INVALID_LOGIN_CREDENTIALS: "Email or password is incorrect for the production Firebase project.",
          USER_DISABLED: "This account is disabled.",
          TOO_MANY_ATTEMPTS_TRY_LATER: "Too many attempts. Wait before trying again.",
          API_KEY_HTTP_REFERRER_BLOCKED: "The production Firebase API key blocks this domain. Do not weaken its restrictions.",
          OPERATION_NOT_ALLOWED: "Enable Email/Password in production Firebase Authentication if this is the intended sign-in method.",
        };
        throw new Error(messages[code] || code);
      }
      if (!data.idToken || !data.localId) throw new Error("Firebase did not return the expected sign-in details.");
      setToken(data.idToken);
      setUid(data.localId);
      setMessage("Signed in to production Firebase. The password has been cleared from this page.");
    } catch (error) {
      setMessage(error.message || "Sign-in failed.");
    } finally {
      setPassword("");
      setBusy(false);
    }
  }

  async function runCheck() {
    if (!token) return;
    setBusy(true);
    setMessage("");
    setResult("");
    try {
      const checks = [];
      for (const test of [
        { name: "missing-token rejection", headers: { "Content-Type": "application/json" }, expected: 401 },
        { name: "invalid-token rejection", headers: { "Content-Type": "application/json", Authorization: "Bearer invalid-production-check-token" }, expected: 401 },
      ]) {
        const response = await fetch("/api/admin/products", {
          method: "POST",
          headers: test.headers,
          body: JSON.stringify(SAMPLE_PRODUCT),
          cache: "no-store",
        });
        const data = await response.json().catch(() => ({}));
        checks.push({ test: test.name, expectedStatus: test.expected, httpStatus: response.status, passed: response.status === test.expected, response: data });
      }

      const response = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
        body: JSON.stringify(SAMPLE_PRODUCT),
        cache: "no-store",
      });
      const data = await response.json().catch(() => ({}));
      checks.push({
        test: "authenticated production dry-run",
        expected: "HTTP 200 and mode dry-run",
        httpStatus: response.status,
        passed: response.status === 200 && data.mode === "dry-run",
        response: data,
      });
      setResult(JSON.stringify({ allPassed: checks.every((check) => check.passed), checks }, null, 2));
      setMessage(checks.every((check) => check.passed)
        ? "All checks passed. No product was written."
        : "One or more checks need review. No confirmWrite flag was sent, so this page cannot create a product.");
    } catch (error) {
      setMessage("Could not complete checks: " + (error.message || "network error"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main style={{ maxWidth: 640, margin: "24px auto", padding: 20, fontFamily: "Arial, sans-serif", lineHeight: 1.5, color: "#111" }}>
      <h1 style={{ fontSize: 26, fontWeight: 700 }}>Production Writer — Safe Check</h1>
      <p><strong>Production project:</strong> oodlesnet-6c19e</p>
      <p>Use only the administrator account whose UID is allowlisted for production. This page signs in directly with Firebase Authentication; your password is not sent to the OodlesNet server and is cleared after sign-in. The ID token stays in page memory, is never displayed, and is used only for the authenticated dry-run check.</p>
      <p><strong>Safety:</strong> this page never sends <code>confirmWrite: true</code>. It cannot create a product.</p>

      <section style={{ margin: "16px 0", padding: 14, border: "1px solid #888", borderRadius: 8 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700 }}>Step 1 — Sign in</h2>
        <form onSubmit={signIn} style={{ display: "grid", gap: 12 }}>
          <label>Production Firebase account email
            <input required type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} style={{ display: "block", width: "100%", padding: 10, boxSizing: "border-box" }} />
          </label>
          <label>Production Firebase account password
            <input required type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ display: "block", width: "100%", padding: 10, boxSizing: "border-box" }} />
          </label>
          <button disabled={busy} type="submit" style={{ padding: 12, fontWeight: 700 }}>{busy ? "Please wait…" : "Sign in to production Firebase"}</button>
        </form>
      </section>

      {uid && <section style={{ margin: "16px 0", padding: 14, border: "1px solid #888", borderRadius: 8 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700 }}>Step 2 — Verify access safely</h2>
        <p>Signed-in UID: <code>{uid}</code></p>
        <p>The UID should match the administrator UID configured in Vercel. Tap below to test authorization and dry-run validation.</p>
        <button disabled={busy || !token} type="button" onClick={runCheck} style={{ padding: 12, fontWeight: 700 }}>{busy ? "Checking…" : "Run safe production checks"}</button>
      </section>}

      {message && <p role="status" style={{ marginTop: 16, overflowWrap: "anywhere" }}>{message}</p>}
      {result && <pre style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere", padding: 12, background: "#eee", color: "#111", borderRadius: 8 }}>{result}</pre>}
    </main>
  );
}
