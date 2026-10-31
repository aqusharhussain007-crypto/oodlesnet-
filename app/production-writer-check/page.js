"use client";

import { useState } from "react";

const FIREBASE_WEB_API_KEY = "AIzaSyDAGbs7GATXSzzWzPw_1Zf49ZDgG56mVpw";
const TARGET_PROJECT = "oodlesnet-6c19e";
const SAMPLE_BATCH = [
  {
    documentId: "boat-stone-350-pro",
    product: {
      name: "boAt Stone 350 Pro",
      brand: "boAt",
      categorySlug: "bluetooth-speakers",
      description: "Portable Bluetooth speaker with 14W output, up to 12 hours playback, RGB LED lighting, Bluetooth 5.3 and IPX5 water resistance.",
      imageUrl: "https://www.boat-lifestyle.com/cdn/shop/files/STONE350PRO_Blue_07_1500x.jpg?v=1720589782",
      tags: ["bluetooth-speaker", "portable-speaker", "boat", "14w", "ipx5", "bluetooth-5-3"],
      store: [{ name: "boAt", price: 1999, offer: "Official website listed price; price and stock may change", url: "https://www.boat-lifestyle.com/products/stone-350-pro-portable-speaker" }]
    }
  },
  {
    documentId: "boat-energyshroom-pb400",
    product: {
      name: "boAt Energyshroom PB400 20000mAh Power Bank",
      brand: "boAt",
      categorySlug: "power-banks",
      description: "20000mAh power bank with 22.5W fast charging, USB-A and two-way USB-C output, and Smart IC protection.",
      imageUrl: "https://www.boat-lifestyle.com/cdn/shop/files/mainimage_2245f22b-a9b1-4a16-a53f-0a2f6966ef2c_1500x.jpg?v=1754034135",
      tags: ["power-bank", "20000mah", "boat", "22-5w-fast-charging", "smart-ic", "usb-c"],
      store: [{ name: "boAt", price: 1399, offer: "Official website listed price; price and stock may change", url: "https://www.boat-lifestyle.com/products/energyshroom-pb400-powerbank-with-20000mah-battery-capacity-with-smart-ic-protection" }]
    }
  }
];

export default function ProductionWriterCheckPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [uid, setUid] = useState("");
  const [token, setToken] = useState("");
  const [message, setMessage] = useState("");
  const [result, setResult] = useState("");
  const [busy, setBusy] = useState(false);
  const [batchText, setBatchText] = useState(JSON.stringify(SAMPLE_BATCH, null, 2));
  const [validatedBatch, setValidatedBatch] = useState("");
  const [dryRunPassed, setDryRunPassed] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [writeComplete, setWriteComplete] = useState(false);

  async function signIn(event) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    setResult("");
    setToken("");
    setUid("");
    setValidatedBatch("");
    setDryRunPassed(false);
    setConfirmed(false);
    setWriteComplete(false);
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
          OPERATION_NOT_ALLOWED: "Email/Password sign-in is not enabled in production Firebase Authentication.",
        };
        throw new Error(messages[code] || code);
      }
      if (!data.idToken || !data.localId) throw new Error("Firebase did not return the expected sign-in details.");
      setToken(data.idToken);
      setUid(data.localId);
      setMessage("Signed in to live Firebase. Password cleared; the ID token stays in page memory only.");
    } catch (error) {
      setMessage(error.message || "Sign-in failed.");
    } finally {
      setPassword("");
      setBusy(false);
    }
  }

  function parseBatch() {
    let entries;
    try {
      entries = JSON.parse(batchText);
    } catch {
      throw new Error("The batch must be valid JSON.");
    }
    if (!Array.isArray(entries) || entries.length < 1 || entries.length > 100) {
      throw new Error("Enter a JSON array containing between 1 and 100 products.");
    }
    for (let i = 0; i < entries.length; i += 1) {
      const entry = entries[i];
      if (!entry || typeof entry !== "object" || Array.isArray(entry) || !entry.product || typeof entry.product !== "object") {
        throw new Error("Entry " + (i + 1) + " must contain documentId and product.");
      }
      if (entry.documentId !== undefined && (typeof entry.documentId !== "string" || !/^[A-Za-z0-9_-]{1,100}$/.test(entry.documentId))) {
        throw new Error("Entry " + (i + 1) + " has an invalid documentId.");
      }
      if (!entry.product.name || !entry.product.brand || !entry.product.categorySlug || !Array.isArray(entry.product.store)) {
        throw new Error("Entry " + (i + 1) + " is missing required product fields.");
      }
    }
    return entries;
  }

  async function runDryRun(event) {
    event.preventDefault();
    if (!token) {
      setMessage("Sign in first.");
      return;
    }
    setBusy(true);
    setMessage("");
    setResult("");
    setDryRunPassed(false);
    setValidatedBatch("");
    setConfirmed(false);
    setWriteComplete(false);
    try {
      const entries = parseBatch();
      const frozenBatch = JSON.stringify(entries);
      const response = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
        body: JSON.stringify({ products: entries }),
        cache: "no-store",
      });
      const data = await response.json().catch(() => ({}));
      setResult(JSON.stringify({ httpStatus: response.status, ...data }, null, 2));
      if (response.ok && data.ok === true && data.mode === "dry-run" && data.validated === true && data.count === entries.length && data.targetProject === TARGET_PROJECT) {
        setValidatedBatch(frozenBatch);
        setDryRunPassed(true);
        setMessage("Batch dry-run passed for " + entries.length + " products. Nothing has been written. Review the result, then explicitly confirm if you want to create this exact batch.");
      } else {
        setMessage("Batch dry-run failed or returned an unexpected response. No product was written.");
      }
    } catch (error) {
      setMessage(error.message || "Dry-run failed. No product was written.");
    } finally {
      setBusy(false);
    }
  }

  async function writeBatch() {
    if (!token || !dryRunPassed || !validatedBatch || !confirmed || writeComplete) return;
    setBusy(true);
    setMessage("");
    try {
      const entries = JSON.parse(validatedBatch);
      const response = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
        body: JSON.stringify({ products: entries, confirmWrite: true }),
        cache: "no-store",
      });
      const data = await response.json().catch(() => ({}));
      setResult(JSON.stringify({ httpStatus: response.status, ...data }, null, 2));
      if (response.ok && data.ok === true && data.mode === "written" && data.targetProject === TARGET_PROJECT && data.created === entries.length && data.failed === 0) {
        setWriteComplete(true);
        setMessage("Production confirms that all " + data.created + " products were created. Do not submit this batch again.");
      } else {
        setMessage("No complete success confirmation received. Do not retry blindly; check Firestore first.");
      }
    } catch {
      setMessage("The network result may be uncertain. Do not retry; check the product documents in Firestore first.");
    } finally {
      setBusy(false);
    }
  }

  const fieldStyle = { display: "block", width: "100%", padding: 12, marginTop: 6, boxSizing: "border-box", fontSize: 14, fontFamily: "monospace" };

  return (
    <main style={{ maxWidth: 760, margin: "20px auto", padding: 18, fontFamily: "Arial, sans-serif", lineHeight: 1.5, color: "#111" }}>
      <h1 style={{ fontSize: 27, fontWeight: 800 }}>Production Product Batch Importer</h1>
      <p><strong>Fixed target:</strong> {TARGET_PROJECT}</p>
      <p><strong>Batch capacity:</strong> 1–100 products per request; maximum request size 1 MB.</p>
      <p>Your password is cleared after sign-in. The Firebase ID token is never displayed or stored; it remains in page memory and is sent only to the protected production API.</p>
      <p style={{ padding: 12, border: "2px solid #b45309", borderRadius: 8 }}><strong>Production writer:</strong> Dry-run is always the first step. No product is created until you tick the explicit confirmation and press the separate live-write button. Writes are atomic and existing document IDs are never overwritten.</p>

      <section style={{ margin: "16px 0", padding: 16, border: "1px solid #888", borderRadius: 9 }}>
        <h2 style={{ fontSize: 21, fontWeight: 700 }}>Step 1 — Sign in to production Firebase</h2>
        <form onSubmit={signIn} style={{ display: "grid", gap: 12 }}>
          <label>Firebase administrator email
            <input required type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} style={{ ...fieldStyle, fontFamily: "Arial" }} />
          </label>
          <label>Firebase administrator password
            <input required type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ ...fieldStyle, fontFamily: "Arial" }} />
          </label>
          <button disabled={busy} type="submit" style={{ padding: 13, fontWeight: 700 }}>{busy ? "Please wait…" : "Sign in to production Firebase"}</button>
        </form>
        {uid && <p>Signed-in UID: <code>{uid}</code>. Continue only if this is your authorized production administrator account.</p>}
      </section>

      {uid && <section style={{ margin: "16px 0", padding: 16, border: "1px solid #888", borderRadius: 9 }}>
        <h2 style={{ fontSize: 21, fontWeight: 700 }}>Step 2 — Review your batch JSON</h2>
        <p>Paste a JSON array of 1–100 entries. Each entry has a <code>documentId</code> and a <code>product</code> object. The two previously test-written boAt products are preloaded as an editable example.</p>
        <textarea aria-label="Product batch JSON" value={batchText} onChange={(e) => { setBatchText(e.target.value); setDryRunPassed(false); setValidatedBatch(""); setConfirmed(false); setWriteComplete(false); }} rows={24} spellCheck={false} style={fieldStyle} />
        <form onSubmit={runDryRun} style={{ marginTop: 14 }}>
          <button disabled={busy || !token || writeComplete} type="submit" style={{ width: "100%", padding: 14, fontWeight: 800 }}>{busy ? "Validating…" : "Run batch dry-run (no write)"}</button>
        </form>
      </section>}

      {dryRunPassed && !writeComplete && <section style={{ margin: "16px 0", padding: 16, border: "2px solid #15803d", borderRadius: 9 }}>
        <h2 style={{ fontSize: 21, fontWeight: 700 }}>Step 3 — Explicit production confirmation</h2>
        <p>The exact batch that passed dry-run is held in page memory. Editing the JSON cancels this approval and requires another dry-run.</p>
        <label style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
          <input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} style={{ marginTop: 5, width: 20, height: 20 }} />
          <span>I authorize creating this exact batch in the LIVE Firestore project <strong>{TARGET_PROJECT}</strong>.</span>
        </label>
        <button disabled={busy || !confirmed || !dryRunPassed} onClick={writeBatch} type="button" style={{ width: "100%", marginTop: 14, padding: 14, fontWeight: 800, background: "#075985", color: "white", border: 0, borderRadius: 8 }}>
          {busy ? "Writing batch…" : "Create confirmed batch in LIVE Firestore"}
        </button>
      </section>}

      {message && <p role="status" style={{ marginTop: 16, overflowWrap: "anywhere" }}>{message}</p>}
      {result && <pre style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere", padding: 12, background: "#eee", color: "#111", borderRadius: 8 }}>{result}</pre>}
    </main>
  );
}
