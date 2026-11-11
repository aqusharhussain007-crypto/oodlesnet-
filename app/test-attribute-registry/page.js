"use client";

import { useState } from "react";

const TEST_FIREBASE_API_KEY = process.env.NEXT_PUBLIC_TEST_FIREBASE_API_KEY;

export default function TestAttributeRegistryPage() {
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
      if (!TEST_FIREBASE_API_KEY) {
        throw new Error("TEST Firebase sign-in is not configured on this deployment. Please contact support.");
      }
      const response = await fetch(
        "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=" + encodeURIComponent(TEST_FIREBASE_API_KEY),
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email.trim(), password, returnSecureToken: true }),
        }
      );
      const data = await response.json();
      if (!response.ok || !data.idToken) {
        const code = data.error?.message || "";
        const messages = {
          EMAIL_NOT_FOUND: "This account was not found in TEST Firebase.",
          INVALID_PASSWORD: "Password is incorrect.",
          INVALID_LOGIN_CREDENTIALS: "Email or password is incorrect for TEST Firebase.",
          USER_DISABLED: "This TEST account is disabled.",
          TOO_MANY_ATTEMPTS_TRY_LATER: "Too many attempts. Wait before trying again.",
          OPERATION_NOT_ALLOWED: "Email/password sign-in is not enabled in TEST Firebase Authentication.",
        };
        throw new Error(messages[code] || code || "TEST Firebase sign-in failed.");
      }
      setToken(data.idToken);
      setMessage("Signed in successfully. Now run the read-only registry audit.");
    } catch (error) {
      setMessage(error.message || "Sign-in failed.");
    } finally {
      setPassword("");
      setBusy(false);
    }
  }

  async function seedDefinitions() {
    if (!token || !window.confirm("Create only the 20 missing definitions in oodlesnet-test? Existing records will not be overwritten.")) return;
    setBusy(true); setMessage(""); setResult("");
    try {
      const response = await fetch("/api/admin/attributes", { method: "POST", headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" }, body: JSON.stringify({ confirm: "CREATE_MISSING_ATTRIBUTE_DEFINITIONS" }), cache: "no-store" });
      const data = await response.json().catch(() => ({}));
      setResult(JSON.stringify({ httpStatus: response.status, ...data }, null, 2));
      setMessage(response.ok && data.ok ? "Seed completed and verified." : "Seed did not fully verify. Review the result.");
    } catch (error) { setMessage(error.message || "Could not complete the TEST seed."); }
    finally { setBusy(false); }
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
        : "The audit returned a response. Review the result below.");
    } catch (error) {
      setMessage(error.message || "Could not reach the TEST endpoint.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main style={{ maxWidth: 640, margin: "24px auto", padding: 20, fontFamily: "Arial, sans-serif", lineHeight: 1.5 }}>
      <h1 style={{ fontSize: 25, fontWeight: 700 }}>TEST Attribute Registry Audit</h1>
      <p><strong>TEST project only.</strong> Sign in using your TEST Firebase admin account. Do not use production credentials.</p>
      <p>Your email and password are sent directly from this browser to Firebase Authentication. The API key is configured privately for this TEST deployment and is not requested from you. The ID token stays in this page's memory and is sent only to the read-only TEST audit endpoint.</p>
      <form onSubmit={signIn} style={{ display: "grid", gap: 12 }}>
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
        <p>Run the attribute seed comparison. This is strictly read-only.</p>
        <button disabled={busy} type="button" onClick={runDryRun} style={{ padding: 12, fontWeight: 700 }}>{busy ? "Auditing…" : "Run read-only registry audit"}</button>
        <button disabled={busy} type="button" onClick={seedDefinitions} style={{ marginTop: 10, padding: 12, fontWeight: 700 }}>Create missing 20 definitions in TEST</button>
      </section>}
      {message && <p role="status" style={{ marginTop: 16, overflowWrap: "anywhere" }}>{message}</p>}
      {result && <pre style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere", padding: 12, background: "#eee", color: "#111", borderRadius: 8 }}>{result}</pre>}
    </main>
  );
}
