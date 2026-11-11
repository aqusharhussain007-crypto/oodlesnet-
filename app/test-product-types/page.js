"use client";

import { useMemo, useState } from "react";

const API_KEY = process.env.NEXT_PUBLIC_TEST_FIREBASE_API_KEY || "";

export default function TestProductTypesPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const [products, setProducts] = useState([]);
  const [drafts, setDrafts] = useState({});
  const [query, setQuery] = useState("");
  const [showUnassigned, setShowUnassigned] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState("");

  async function signInAndLoad(event) {
    event.preventDefault();
    setBusy(true); setError(""); setMessage(""); setResult("");
    try {
      if (!API_KEY) throw new Error("TEST Firebase API key is not configured.");
      const authResponse = await fetch("https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=" + encodeURIComponent(API_KEY), {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password, returnSecureToken: true }), cache: "no-store",
      });
      const authData = await authResponse.json().catch(() => ({}));
      if (!authResponse.ok || !authData.idToken) throw new Error(authData.error?.message || "TEST Firebase sign-in failed.");
      const idToken = authData.idToken;
      const response = await fetch("/api/admin/products/product-types", { headers: { Authorization: "Bearer " + idToken }, cache: "no-store" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.ok || data.project !== "oodlesnet-test" || !Array.isArray(data.products) || data.count !== data.products.length) {
        throw new Error(data.error || "Safety check failed: expected the TEST product catalogue.");
      }
      setToken(idToken);
      setProducts(data.products);
      setDrafts(Object.fromEntries(data.products.map((p) => [p.id, p.productType || ""])));
      setMessage("Loaded " + data.count + " TEST products. " + data.unassignedCount + " need a product type. No database writes performed.");
    } catch (e) { setError(e.message || "Could not load TEST products."); setToken(""); setProducts([]); }
    finally { setPassword(""); setBusy(false); }
  }

  const visible = useMemo(() => products.filter((p) => {
    const type = String(drafts[p.id] || "").trim();
    if (showUnassigned && type) return false;
    const term = query.trim().toLowerCase();
    return !term || [p.name, p.brand, p.categorySlug, p.id, type].filter(Boolean).join(" ").toLowerCase().includes(term);
  }), [products, drafts, query, showUnassigned]);

  const pending = products.filter((p) => String(drafts[p.id] || "").trim() && String(drafts[p.id] || "").trim().toLowerCase() !== String(p.productType || "").trim().toLowerCase());
  const unassigned = products.filter((p) => !String(drafts[p.id] || "").trim()).length;

  async function saveAssignments() {
    if (!token || !pending.length) return;
    const assignments = pending.map((p) => ({ id: p.id, productType: drafts[p.id] }));
    const preview = assignments.map((a) => {
      const product = products.find((p) => p.id === a.id);
      return (product?.name || a.id) + " → " + a.productType;
    }).join("\\n");
    if (!window.confirm("Update only productType in oodlesnet-test for " + assignments.length + " products?\\n\\n" + preview + "\\n\\nNo other fields will be changed.")) return;
    setBusy(true); setError(""); setResult(""); setMessage("");
    try {
      const response = await fetch("/api/admin/products/product-types", {
        method: "POST",
        headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" },
        body: JSON.stringify({ confirm: "UPDATE_TEST_PRODUCT_TYPES", assignments }), cache: "no-store",
      });
      const data = await response.json().catch(() => ({}));
      setResult(JSON.stringify({ httpStatus: response.status, ...data }, null, 2));
      if (!response.ok || !data.ok || data.project !== "oodlesnet-test") throw new Error(data.error || "Update did not verify.");
      setProducts((current) => current.map((p) => ({ ...p, productType: drafts[p.id] || p.productType })));
      setMessage("Updated " + data.updatedCount + " TEST product types. Other product fields were not changed.");
    } catch (e) { setError(e.message || "Could not save product types."); }
    finally { setBusy(false); }
  }

  return (
    <main style={{ maxWidth: 760, margin: "0 auto", padding: 16, color: "#0f172a", fontFamily: "Arial,sans-serif", lineHeight: 1.5 }}>
      <h1 style={{ fontSize: 25, fontWeight: 900 }}>TEST Product Type Assignment</h1>
      <p><strong>TEST database only.</strong> Assign exact product types such as <code>running-shoes</code>, <code>jeans</code>, <code>face-wash</code>, <code>smartphone</code> or <code>earbuds</code>. Category is not a product type. Do not guess; leave uncertain products blank.</p>
      <form onSubmit={signInAndLoad} style={{ display: "grid", gap: 10, padding: 14, border: "1px solid #0e7490", borderRadius: 12, background: "#f0fdfa" }}>
        <label>TEST admin email<input required type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} style={{ display: "block", width: "100%", boxSizing: "border-box", padding: 11, marginTop: 4 }} /></label>
        <label>TEST admin password<input required type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ display: "block", width: "100%", boxSizing: "border-box", padding: 11, marginTop: 4 }} /></label>
        <button disabled={busy} type="submit" style={{ padding: 12, border: 0, borderRadius: 9, background: "#065f46", color: "white", fontWeight: 800 }}>{busy ? "Loading…" : "Sign in and load TEST products"}</button>
      </form>
      {products.length > 0 && <>
        <section style={{ margin: "16px 0", padding: 12, borderRadius: 10, background: "#f1f5f9" }}>
          <strong>{products.length} products</strong> · <strong>{unassigned} unassigned</strong> · <strong>{pending.length} changes ready</strong>
          <input type="search" placeholder="Search product, brand, category…" value={query} onChange={(e) => setQuery(e.target.value)} style={{ width: "100%", boxSizing: "border-box", padding: 11, marginTop: 10, border: "1px solid #94a3b8", borderRadius: 8 }} />
          <label style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 10 }}><input type="checkbox" checked={showUnassigned} onChange={(e) => setShowUnassigned(e.target.checked)} /> Show unassigned products only</label>
        </section>
        <div style={{ display: "grid", gap: 10 }}>
          {visible.map((p) => <article key={p.id} style={{ display: "grid", gridTemplateColumns: "64px minmax(0,1fr)", gap: 10, padding: 10, border: "1px solid #cbd5e1", borderRadius: 10, background: "white" }}>
            {p.imageUrl ? <img src={p.imageUrl} alt="" style={{ width: 64, height: 64, objectFit: "contain", background: "#f8fafc", borderRadius: 7 }} /> : <div style={{ width: 64, height: 64, background: "#f1f5f9", borderRadius: 7 }} />}
            <div style={{ minWidth: 0 }}>
              <strong>{p.name || "Unnamed product"}</strong>
              <div style={{ color: "#64748b", fontSize: 12 }}>{p.brand || "No brand"} · Category: {p.categorySlug || "Uncategorised"}</div>
              <label style={{ display: "block", marginTop: 7, fontSize: 12, fontWeight: 800 }}>Specific product type
                <input value={drafts[p.id] || ""} onChange={(e) => setDrafts((current) => ({ ...current, [p.id]: e.target.value }))} placeholder="e.g. running-shoes" style={{ width: "100%", boxSizing: "border-box", padding: 9, marginTop: 4, border: "1px solid #0d9488", borderRadius: 7 }} />
              </label>
            </div>
          </article>)}
        </div>
        <button type="button" disabled={busy || pending.length === 0} onClick={saveAssignments} style={{ position: "sticky", bottom: 10, width: "100%", marginTop: 16, padding: 14, border: 0, borderRadius: 10, background: pending.length ? "#0f766e" : "#94a3b8", color: "white", fontWeight: 900 }}>{busy ? "Saving…" : "Save " + pending.length + " verified type assignments to TEST"}</button>
      </>}
      {message && <p role="status" style={{ color: "#166534", overflowWrap: "anywhere" }}>{message}</p>}
      {error && <p role="alert" style={{ color: "#b91c1c", overflowWrap: "anywhere" }}>{error}</p>}
      {result && <pre style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere", background: "#f1f5f9", padding: 10, borderRadius: 8 }}>{result}</pre>}
    </main>
  );
}
