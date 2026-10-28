"use client";

import { useState } from "react";

const FIREBASE_WEB_API_KEY = "AIzaSyDAGbs7GATXSzzWzPw_1Zf49ZDgG56mVpw";
const TARGET_PROJECT = "oodlesnet-6c19e";
const DOCUMENT_ID = "oneplus-nord-ce5-5g-live-20261028";
const IMAGE_URL = "https://img-prd-pim.poorvika.com/product/Oneplus-nord-ce5-5g-black-infinity-128gb-8gb-ram-Front-Back-View.png";

export default function LiveProductImageRepairPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const [uid, setUid] = useState("");
  const [message, setMessage] = useState("");
  const [result, setResult] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [updated, setUpdated] = useState(false);

  async function signIn(event) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    setResult("");
    setToken("");
    setUid("");
    setConfirmed(false);
    setUpdated(false);
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
          INVALID_LOGIN_CREDENTIALS: "Email or password is incorrect for the live Firebase project.",
          EMAIL_NOT_FOUND: "This email is not registered in live Firebase Authentication.",
          INVALID_PASSWORD: "Password is incorrect.",
          TOO_MANY_ATTEMPTS_TRY_LATER: "Too many attempts. Wait before trying again.",
          API_KEY_HTTP_REFERRER_BLOCKED: "The live Firebase API key blocks this domain. Do not weaken its restrictions.",
          OPERATION_NOT_ALLOWED: "Email/password sign-in is not enabled in live Firebase Authentication.",
        };
        throw new Error(messages[code] || code);
      }
      if (!data.idToken || !data.localId) throw new Error("Firebase did not return the expected sign-in details.");
      setToken(data.idToken);
      setUid(data.localId);
      setMessage("Signed in to live Firebase. Password cleared; token stays hidden in page memory.");
    } catch (error) {
      setMessage(error.message || "Sign-in failed.");
    } finally {
      setPassword("");
      setBusy(false);
    }
  }

  async function repairProduct(event) {
    event.preventDefault();
    if (!token || !uid) {
      setMessage("Sign in first.");
      return;
    }
    if (!confirmed) {
      setMessage("Confirm the image and category repair first.");
      return;
    }
    if (updated) {
      setMessage("The server already confirmed the repair. Do not submit again.");
      return;
    }
    setBusy(true);
    setMessage("");
    setResult("");
    try {
      const response = await fetch("/api/admin/products", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({
          documentId: DOCUMENT_ID,
          imageUrl: IMAGE_URL,
          categorySlug: "mobile",
          confirmUpdate: true,
        }),
        cache: "no-store",
      });
      const data = await response.json().catch(() => ({}));
      setResult(JSON.stringify({ httpStatus: response.status, ...data }, null, 2));
      if (response.ok && data.ok === true && data.mode === "updated" && data.targetProject === TARGET_PROJECT && data.documentId === DOCUMENT_ID) {
        setUpdated(true);
        setMessage("Repair confirmed: existing product updated, no duplicate created.");
      } else {
        setMessage("No successful repair confirmation received. Do not retry blindly.");
      }
    } catch {
      setMessage("The result is uncertain. Do not submit again until the product document is checked.");
    } finally {
      setBusy(false);
    }
  }

  const fieldStyle = { display: "block", width: "100%", padding: 12, marginTop: 5, boxSizing: "border-box", fontSize: 16 };

  return (
    <main style={{ maxWidth: 680, margin: "20px auto", padding: 18, fontFamily: "Arial, sans-serif", lineHeight: 1.5, color: "#111" }}>
      <h1 style={{ fontSize: 26, fontWeight: 800 }}>Repair OnePlus Product Image</h1>
      <p><strong>Fixed live project:</strong> {TARGET_PROJECT}</p>
      <p>This page updates only the existing OnePlus Nord CE5 5G document. It sets its category to <code>mobile</code> so it matches the site's mobile category and fills the missing image. It does not create a product or change its price or store links.</p>
      <div style={{ padding: 14, border: "1px solid #999", borderRadius: 10, margin: "16px 0" }}>
        <p><strong>Product image preview</strong></p>
        <img src={IMAGE_URL} alt="OnePlus Nord CE5 5G front and back" style={{ display: "block", width: "100%", maxWidth: 300, height: 300, objectFit: "contain", background: "#fff", borderRadius: 8 }} />
        <p style={{ fontSize: 13, overflowWrap: "anywhere" }}>Image source: Poorvika product image. The image depicts the Black Infinity variant.</p>
      </div>
      {!uid && <section style={{ padding: 16, border: "1px solid #888", borderRadius: 10 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700 }}>Step 1 — Sign in to live Firebase</h2>
        <form onSubmit={signIn} style={{ display: "grid", gap: 12 }}>
          <label>Firebase account email
            <input required type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} style={fieldStyle} />
          </label>
          <label>Firebase account password
            <input required type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} style={fieldStyle} />
          </label>
          <button disabled={busy} type="submit" style={{ padding: 13, fontWeight: 700, fontSize: 16 }}>{busy ? "Please wait…" : "Sign in to live Firebase"}</button>
        </form>
      </section>}
      {uid && <section style={{ padding: 16, border: "1px solid #888", borderRadius: 10, marginTop: 16 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700 }}>Step 2 — Confirm the narrow repair</h2>
        <p>Signed-in UID: <code>{uid}</code></p>
        <p><strong>Document:</strong> <code>{DOCUMENT_ID}</code></p>
        <p><strong>Only fields changed:</strong> <code>imageUrl</code> and <code>categorySlug = mobile</code>.</p>
        <form onSubmit={repairProduct} style={{ display: "grid", gap: 14, marginTop: 14 }}>
          <label style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} style={{ marginTop: 6, width: 20, height: 20 }} />
            <span>I confirm updating this existing product in live Firestore. Do not create a duplicate.</span>
          </label>
          <button disabled={busy || !token || !confirmed || updated} type="submit" style={{ padding: 14, fontWeight: 800, fontSize: 16, background: "#063c5a", color: "white", border: 0, borderRadius: 8 }}>
            {busy ? "Working…" : updated ? "Repair confirmed" : "Update existing live product"}
          </button>
        </form>
      </section>}
      {message && <p role="status" style={{ marginTop: 16, overflowWrap: "anywhere" }}>{message}</p>}
      {result && <pre style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere", padding: 12, background: "#f3f4f6", borderRadius: 8 }}>{result}</pre>}
    </main>
  );
}
