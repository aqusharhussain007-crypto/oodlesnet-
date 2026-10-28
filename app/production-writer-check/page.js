"use client";

import { useState } from "react";

const FIREBASE_WEB_API_KEY = "AIzaSyDAGbs7GATXSzzWzPw_1Zf49ZDgG56mVpw";

export default function ProductionWriterCheckPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [uid, setUid] = useState("");
  const [token, setToken] = useState("");
  const [message, setMessage] = useState("");
  const [result, setResult] = useState("");
  const [busy, setBusy] = useState(false);
  const [name, setName] = useState("Motorola Edge 70 Fusion");
  const [brand, setBrand] = useState("Motorola");
  const [categorySlug, setCategorySlug] = useState("smartphones");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [storeName, setStoreName] = useState("Motorola India");
  const [price, setPrice] = useState("");
  const [storeUrl, setStoreUrl] = useState("");
  const [tags, setTags] = useState("smartphone, 5G, Motorola");

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
          OPERATION_NOT_ALLOWED: "Email/Password sign-in is not enabled in production Firebase Authentication.",
        };
        throw new Error(messages[code] || code);
      }
      if (!data.idToken || !data.localId) throw new Error("Firebase did not return the expected sign-in details.");
      setToken(data.idToken);
      setUid(data.localId);
      setMessage("Signed in. Password cleared. The token remains in page memory only.");
    } catch (error) {
      setMessage(error.message || "Sign-in failed.");
    } finally {
      setPassword("");
      setBusy(false);
    }
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
    try {
      const product = {
        name: name.trim(),
        brand: brand.trim(),
        categorySlug: categorySlug.trim(),
        description: description.trim(),
        imageUrl: imageUrl.trim(),
        tags: tags.split(",").map((tag) => tag.trim()).filter(Boolean),
        store: [{ name: storeName.trim(), price: Number(price), url: storeUrl.trim() }],
      };
      const payload = { documentId: "dry-run-" + name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 70), product };
      // Intentionally omit confirmWrite entirely. This page cannot create a product.
      const response = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
        body: JSON.stringify(payload),
        cache: "no-store",
      });
      const data = await response.json().catch(() => ({}));
      setResult(JSON.stringify({ httpStatus: response.status, ...data }, null, 2));
      setMessage(response.ok && data.mode === "dry-run"
        ? "Dry-run passed. No product was written."
        : "Dry-run did not pass. Review the response below. No product was written by this page.");
    } catch (error) {
      setMessage("Could not complete dry-run: " + (error.message || "network error"));
    } finally {
      setBusy(false);
    }
  }

  const fieldStyle = { display: "block", width: "100%", padding: 10, marginTop: 4, boxSizing: "border-box" };

  return (
    <main style={{ maxWidth: 640, margin: "24px auto", padding: 20, fontFamily: "Arial, sans-serif", lineHeight: 1.5, color: "#111" }}>
      <h1 style={{ fontSize: 26, fontWeight: 700 }}>Production Smartphone — Dry Run</h1>
      <p><strong>Target project:</strong> oodlesnet-6c19e</p>
      <p>This page signs in directly with Firebase Authentication. Your password is cleared after sign-in; the ID token is never displayed or stored. Only the token is sent to the protected writer endpoint.</p>
      <p style={{ padding: 12, border: "1px solid #b45309", borderRadius: 8 }}><strong>SAFE MODE:</strong> this page never sends <code>confirmWrite: true</code>. It cannot create a product. Enter a verified price and exact product-page URL from the retailer before testing.</p>

      <section style={{ margin: "16px 0", padding: 14, border: "1px solid #888", borderRadius: 8 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700 }}>Step 1 — Sign in</h2>
        <form onSubmit={signIn} style={{ display: "grid", gap: 12 }}>
          <label>Production Firebase admin email
            <input required type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} style={fieldStyle} />
          </label>
          <label>Production Firebase admin password
            <input required type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} style={fieldStyle} />
          </label>
          <button disabled={busy} type="submit" style={{ padding: 12, fontWeight: 700 }}>{busy ? "Please wait…" : "Sign in"}</button>
        </form>
        {uid && <p>Signed-in UID: <code>{uid}</code>. Confirm this is your authorized production UID.</p>}
      </section>

      {uid && <section style={{ margin: "16px 0", padding: 14, border: "1px solid #888", borderRadius: 8 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700 }}>Step 2 — Product details</h2>
        <form onSubmit={runDryRun} style={{ display: "grid", gap: 10 }}>
          <label>Product name<input required value={name} onChange={(e) => setName(e.target.value)} style={fieldStyle} /></label>
          <label>Brand<input required value={brand} onChange={(e) => setBrand(e.target.value)} style={fieldStyle} /></label>
          <label>Category slug<input required value={categorySlug} onChange={(e) => setCategorySlug(e.target.value)} style={fieldStyle} /></label>
          <label>Description (optional)<textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} style={fieldStyle} /></label>
          <label>Image URL (optional)<input type="url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} style={fieldStyle} /></label>
          <label>Store name<input required value={storeName} onChange={(e) => setStoreName(e.target.value)} style={fieldStyle} /></label>
          <label>Verified price in ₹<input required type="number" min="1" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} style={fieldStyle} /></label>
          <label>Exact product page URL<input required type="url" value={storeUrl} onChange={(e) => setStoreUrl(e.target.value)} placeholder="https://retailer.in/exact-product-page" style={fieldStyle} /></label>
          <label>Search tags, separated by commas<input value={tags} onChange={(e) => setTags(e.target.value)} style={fieldStyle} /></label>
          <button disabled={busy || !token} type="submit" style={{ padding: 12, fontWeight: 700 }}>{busy ? "Validating…" : "Run product dry-run (no write)"}</button>
        </form>
      </section>}

      {message && <p role="status" style={{ marginTop: 16, overflowWrap: "anywhere" }}>{message}</p>}
      {result && <pre style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere", padding: 12, background: "#eee", color: "#111", borderRadius: 8 }}>{result}</pre>}
    </main>
  );
}
