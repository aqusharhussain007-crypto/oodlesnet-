"use client";

import { useState } from "react";

export default function FirebaseIdTokenTestPage() {
  const [apiKey, setApiKey] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function signIn(event) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    setToken("");
    try {
      const response = await fetch(
        "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=" + encodeURIComponent(apiKey),
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, returnSecureToken: true }),
        }
      );
      const data = await response.json();
      if (!response.ok) {
        const messages = {
          EMAIL_NOT_FOUND: "This email does not exist in the Firebase project for this API key.",
          INVALID_PASSWORD: "Password is incorrect.",
          INVALID_LOGIN_CREDENTIALS: "Email or password is incorrect for this Firebase project.",
          USER_DISABLED: "This account is disabled.",
          TOO_MANY_ATTEMPTS_TRY_LATER: "Too many attempts. Wait before trying again.",
          API_KEY_HTTP_REFERRER_BLOCKED: "This test API key blocks this website. Do not weaken production key restrictions.",
          OPERATION_NOT_ALLOWED: "Email/Password sign-in is not enabled in this Firebase project.",
        };
        throw new Error(messages[data.error?.message] || data.error?.message || "Sign-in failed.");
      }
      setToken(data.idToken || "");
      setMessage(data.idToken ? "Sign-in successful. Copy the token only into the isolated test endpoint. Never share it in chat." : "No ID token was returned.");
    } catch (error) {
      setMessage(error.message || "Request failed.");
    } finally {
      setPassword("");
      setBusy(false);
    }
  }

  async function copyToken() {
    try {
      await navigator.clipboard.writeText(token);
      setMessage("Token copied. Paste it only into the isolated test endpoint's Authorization header.");
    } catch {
      setMessage("Clipboard unavailable. Select and copy the token manually.");
    }
  }

  return (
    <main style={{ maxWidth: 620, margin: "32px auto", padding: 20, fontFamily: "Arial, sans-serif", lineHeight: 1.5 }}>
      <h1 style={{ fontSize: 26, fontWeight: 700 }}>Firebase ID Token — Isolated Test</h1>
      <p><strong>Use only the Web API key from the separate oodlesnet-test Firebase project.</strong> Do not use the production OodlesNet API key or enter your production account password here.</p>
      <p>This page sends sign-in details directly from your browser to Firebase Authentication. It does not send them to this app's server or save them. Use a test-project account only.</p>
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
        <button disabled={busy} type="submit" style={{ padding: 12, fontWeight: 700 }}>{busy ? "Signing in…" : "Sign in and get test ID token"}</button>
      </form>
      {message && <p role="status" style={{ marginTop: 16, overflowWrap: "anywhere" }}>{message}</p>}
      {token && <section style={{ marginTop: 16 }}>
        <label>Test ID token (sensitive; do not share)
          <textarea readOnly value={token} rows={7} style={{ display: "block", width: "100%", padding: 10, boxSizing: "border-box", overflowWrap: "anywhere" }} />
        </label>
        <button type="button" onClick={copyToken} style={{ marginTop: 10, padding: 12 }}>Copy test ID token</button>
        <p>Token is held only in this page's memory and expires. Close the tab when finished.</p>
      </section>}
    </main>
  );
}
