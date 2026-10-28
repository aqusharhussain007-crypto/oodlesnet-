"use client";

import { useState } from "react";

const FIREBASE_WEB_API_KEY = "AIzaSyDAGbs7GATXSzzWzPw_1Zf49ZDgG56mVpw";
const TARGET_PROJECT = "oodlesnet-6c19e";
const DOCUMENT_ID = "oneplus-nord-ce5-5g-live-20261028";

export default function LiveProductInsertPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [uid, setUid] = useState("");
  const [token, setToken] = useState("");
  const [message, setMessage] = useState("");
  const [result, setResult] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [written, setWritten] = useState(false);
  const [price, setPrice] = useState("24999");
  const [storeUrl, setStoreUrl] = useState("https://www.oneplus.in/nord-ce5");
  const [imageUrl, setImageUrl] = useState("");

  async function signIn(event) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    setResult("");
    setToken("");
    setUid("");
    setConfirmed(false);
    setWritten(false);
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
          CONFIGURATION_NOT_FOUND: "Firebase Authentication is not configured for the live project.",
          EMAIL_NOT_FOUND: "This email is not registered in live Firebase Authentication.",
          INVALID_PASSWORD: "Password is incorrect.",
          INVALID_LOGIN_CREDENTIALS: "Email or password is incorrect for the live Firebase project.",
          USER_DISABLED: "This account is disabled.",
          TOO_MANY_ATTEMPTS_TRY_LATER: "Too many attempts. Wait before trying again.",
          API_KEY_HTTP_REFERRER_BLOCKED: "The live Firebase API key blocks this domain. Do not weaken its restrictions.",
          OPERATION_NOT_ALLOWED: "Email/password sign-in is not enabled in live Firebase Authentication.",
        };
        throw new Error(messages[code] || code);
      }
      if (!data.idToken || !data.localId) throw new Error("Firebase did not return the expected sign-in details.");
      setToken(data.idToken);
      setUid(data.localId);
      setMessage("Signed in to live Firebase. Password cleared; token remains hidden in page memory.");
    } catch (error) {
      setMessage(error.message || "Sign-in failed.");
    } finally {
      setPassword("");
      setBusy(false);
    }
  }

  async function insertProduct(event) {
    event.preventDefault();
    if (!token || !uid) {
      setMessage("Sign in first.");
      return;
    }
    if (!confirmed) {
      setMessage("Tick the confirmation checkbox before creating the live product.");
      return;
    }
    if (written) {
      setMessage("This page has already received a successful write response. Do not submit again.");
      return;
    }
    const numericPrice = Number(price);
    if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
      setMessage("Enter a valid positive price in rupees.");
      return;
    }
    let parsedUrl;
    try {
      parsedUrl = new URL(storeUrl);
      if (!["https:", "http:"].includes(parsedUrl.protocol)) throw new Error();
    } catch {
      setMessage("Enter a valid official product-page URL.");
      return;
    }
    if (imageUrl.trim()) {
      try {
        const parsedImage = new URL(imageUrl.trim());
        if (!["https:", "http:"].includes(parsedImage.protocol)) throw new Error();
      } catch {
        setMessage("Image URL must be a valid HTTP(S) URL, or left blank.");
        return;
      }
    }
    const product = {
      name: "OnePlus Nord CE5 5G",
      brand: "OnePlus",
      categorySlug: "smartphones",
      description: "5G smartphone with a 120Hz AMOLED display, MediaTek Dimensity 8350 processor, 7100mAh battery and 80W charging. Price shown is a starting price; verify the selected variant and final checkout price.",
      imageUrl: imageUrl.trim(),
      tags: ["OnePlus", "5G", "smartphone", "Nord CE5"],
      store: [{
        name: "OnePlus India",
        price: numericPrice,
        offer: "Starting price; verify variant and final checkout price on the retailer page.",
        url: parsedUrl.href,
      }],
    };
    setBusy(true);
    setMessage("");
    setResult("");
    try {
      const response = await fetch("/api/admin/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({ documentId: DOCUMENT_ID, product, confirmWrite: true }),
        cache: "no-store",
      });
      const data = await response.json().catch(() => ({}));
      setResult(JSON.stringify({ httpStatus: response.status, ...data }, null, 2));
      if (response.ok && data.ok === true && data.mode === "written" && data.targetProject === TARGET_PROJECT) {
        setWritten(true);
        setMessage("Live product creation confirmed by the server. Keep the result below as the record.");
      } else {
        setMessage("No successful live-write confirmation received. Read the result carefully; do not retry blindly.");
      }
    } catch (error) {
      setMessage("Network result is uncertain. Do not submit again until the product document is checked in Firestore.");
    } finally {
      setBusy(false);
    }
  }

  const fieldStyle = { display: "block", width: "100%", padding: 12, marginTop: 5, boxSizing: "border-box", fontSize: 16 };
  const sectionStyle = { margin: "18px 0", padding: 16, border: "1px solid #888", borderRadius: 10 };

  return (
    <main style={{ maxWidth: 680, margin: "20px auto", padding: 18, fontFamily: "Arial, sans-serif", lineHeight: 1.5, color: "#111" }}>
      <h1 style={{ fontSize: 28, fontWeight: 800 }}>Live Product Insertion</h1>
      <p><strong>Fixed Firebase project:</strong> {TARGET_PROJECT}</p>
      <p>This dedicated page signs in directly with Firebase Authentication. Your password is cleared after sign-in. The ID token is never displayed or stored; it stays in page memory and is sent only to the protected product-writer endpoint.</p>
      <p style={{ padding: 12, border: "2px solid #b45309", borderRadius: 8 }}><strong>LIVE WRITE PAGE:</strong> submitting the final form creates one product in the live <code>products</code> collection. The server requires your UID to be allowlisted and uses create-only behavior, so it will not overwrite an existing document.</p>

      <section style={sectionStyle}>
        <h2 style={{ fontSize: 21, fontWeight: 700 }}>Step 1 — Sign in to live Firebase</h2>
        <form onSubmit={signIn} style={{ display: "grid", gap: 12 }}>
          <label>Firebase account email
            <input required type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} style={fieldStyle} />
          </label>
          <label>Firebase account password
            <input required type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} style={fieldStyle} />
          </label>
          <button disabled={busy} type="submit" style={{ padding: 13, fontWeight: 700, fontSize: 16 }}>{busy ? "Please wait…" : "Sign in to live Firebase"}</button>
        </form>
        {uid && <p>Signed-in UID: <code>{uid}</code>. Continue only if this is your authorized production administrator account.</p>}
      </section>

      {uid && <section style={sectionStyle}>
        <h2 style={{ fontSize: 21, fontWeight: 700 }}>Step 2 — Review the product</h2>
        <p><strong>Product:</strong> OnePlus Nord CE5 5G</p>
        <p><strong>Brand:</strong> OnePlus</p>
        <p><strong>Category:</strong> smartphones</p>
        <p><strong>Document ID:</strong> <code>{DOCUMENT_ID}</code> (fixed to prevent accidental duplicate records)</p>
        <label>Starting price in ₹
          <input required type="number" min="1" step="1" value={price} onChange={(e) => setPrice(e.target.value)} style={fieldStyle} />
        </label>
        <label>Official product page URL
          <input required type="url" value={storeUrl} onChange={(e) => setStoreUrl(e.target.value)} style={fieldStyle} />
        </label>
        <label>Product image URL (optional; leave blank if not verified)
          <input type="url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} style={fieldStyle} />
        </label>
        <p style={{ fontSize: 14 }}>The ₹24,999 default is a starting-price reference, not a guarantee for every variant. Confirm it on the official page before submitting.</p>
        <form onSubmit={insertProduct} style={{ display: "grid", gap: 14, marginTop: 16 }}>
          <label style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} style={{ marginTop: 6, width: 20, height: 20 }} />
            <span>I confirm I want to create this product in the LIVE Firestore project <strong>oodlesnet-6c19e</strong>, not the test project.</span>
          </label>
          <button disabled={busy || !token || !confirmed || written} type="submit" style={{ padding: 14, fontWeight: 800, fontSize: 16, background: "#063c5a", color: "white", border: 0, borderRadius: 8 }}>
            {busy ? "Working…" : written ? "Product write confirmed" : "Create product in LIVE Firestore"}
          </button>
        </form>
      </section>}

      {message && <p role="status" style={{ marginTop: 16, overflowWrap: "anywhere" }}>{message}</p>}
      {result && <pre style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere", padding: 12, background: "#eee", color: "#111", borderRadius: 8 }}>{result}</pre>}
    </main>
  );
}
