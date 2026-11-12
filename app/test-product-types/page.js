"use client";

import { useMemo, useState } from "react";

const API_KEY = process.env.NEXT_PUBLIC_TEST_FIREBASE_API_KEY || "";

function suggestProductType(product) {
  const name = String(product?.name || "").toLowerCase();
  const category = String(product?.categorySlug || "").toLowerCase();

  const rules = [
    [/\b(airpods|airdopes|earbuds|ear buds|buds t\d+|wireless earbuds)\b/, "wireless-earbuds"],
    [/\b(headphones?|headsets?)\b/, "headphones"],
    [/\b(type.?c.*(converter|adapter)|audio adapter|3\.5mm converter)\b/, "audio-adapter"],
    [/\b(ceiling fan|pedestal fan|table fan|exhaust fan)\b/, "ceiling-fan"],
    [/\b(running shoes|run shoes)\b/, "running-shoes"],
    [/\b(sneakers?|court shoes|casual shoes)\b/, "sneakers"],
    [/\b(jeans?|denim)\b/, "jeans"],
    [/\b(t.?shirts?|tees)\b/, "t-shirts"],
    [/\b(shirts?)\b/, "shirts"],
    [/\b(shoes?|footwear)\b/, "shoes"],
    [/\b(smart ?phones?|redmi note|iphone|galaxy s\d|motorola edge)\b/, "smartphone"],
    [/\b(smart ?watches?)\b/, "smartwatch"],
    [/\b(smart bands?|fitness bands?|mi smart band)\b/, "fitness-band"],
    [/\b(face wash|facial cleanser)\b/, "face-wash"],
    [/\b(serum)\b/, "face-serum"],
    [/\b(moisturi[sz]er|face cream)\b/, "moisturizer"],
    [/\b(sunscreen|sun screen)\b/, "sunscreen"],
    [/\b(shampoo)\b/, "shampoo"],
    [/\b(power banks?)\b/, "power-bank"],
    [/\b(chargers?|charging adapter)\b/, "charger"],
    [/\b(cables?)\b/, "charging-cable"],
    [/\b(bluetooth speakers?|speakers?)\b/, "speaker"],
    [/\b(laptops?|notebooks?)\b/, "laptop"],
    [/\b(tablets?|ipad)\b/, "tablet"],
    [/\b(televisions?|\btv\b)\b/, "television"],
    [/\b(washing machines?)\b/, "washing-machine"],
    [/\b(refrigerators?|fridges?)\b/, "refrigerator"],
    [/\b(mixers?|mixer grinders?)\b/, "mixer-grinder"],
    [/\b(vacuum cleaners?)\b/, "vacuum-cleaner"],
  ];
  for (const [pattern, type] of rules) if (pattern.test(name)) return type;
  if (category === "smartphones") return "smartphone";
  return "";
}

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
  const [reviewOpen, setReviewOpen] = useState(false);

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

  function applySuggestions() {
    setDrafts((current) => {
      const next = { ...current };
      products.forEach((product) => {
        if (!String(next[product.id] || "").trim()) {
          const suggestion = suggestProductType(product);
          if (suggestion) next[product.id] = suggestion;
        }
      });
      return next;
    });
    setShowUnassigned(false);
    setMessage("Suggested types filled where product names provide a clear match. Review every suggestion; uncertain products remain blank. Nothing has been saved.");
  }

  async function repairMalformedTypes() {
    if (!token || !window.confirm("Repair only known malformed productType slugs in oodlesnet-test? Production will not be touched.")) return;
    setBusy(true); setError(""); setResult(""); setMessage("");
    try {
      const response = await fetch("/api/admin/products/product-types", {
        method: "POST",
        headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "repair-known-malformed-slugs", confirm: "REPAIR_KNOWN_MALFORMED_TEST_PRODUCT_TYPES" }),
        cache: "no-store",
      });
      const data = await response.json().catch(() => ({}));
      setResult(JSON.stringify({ httpStatus: response.status, ...data }, null, 2));
      if (!response.ok || !data.ok || data.project !== "oodlesnet-test") throw new Error(data.error || "TEST repair did not verify.");
      const repaired = new Map((data.assignments || []).map((item) => [item.id, item.productType]));
      setProducts((current) => current.map((p) => repaired.has(p.id) ? { ...p, productType: repaired.get(p.id) } : p));
      setDrafts((current) => Object.fromEntries(Object.entries(current).map(([id, value]) => [id, repaired.get(id) || value])));
      setMessage("Repaired " + data.updatedCount + " known malformed TEST product types. Other fields were unchanged.");
    } catch (e) { setError(e.message || "Could not repair TEST product types."); }
    finally { setBusy(false); }
  }

  async function saveAssignments() {
    if (!token || !pending.length) return;
    const assignments = pending.map((p) => ({ id: p.id, productType: drafts[p.id] }));
    setReviewOpen(true);
  }

  async function confirmAssignments() {
    if (!token || !pending.length) return;
    const assignments = pending.map((p) => ({ id: p.id, productType: drafts[p.id] }));
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
      setReviewOpen(false);
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
      {reviewOpen && <div role="dialog" aria-modal="true" aria-labelledby="review-title" style={{ position: "fixed", inset: 0, zIndex: 10000, background: "rgba(15,23,42,.82)", overflowY: "auto", padding: 12 }}>
        <section style={{ maxWidth: 760, margin: "16px auto", background: "white", color: "#0f172a", borderRadius: 14, padding: 16 }}>
          <h2 id="review-title" style={{ fontSize: 22, margin: "0 0 8px" }}>Review product type assignments</h2>
          <p><strong>{pending.length} proposed updates</strong> · TEST database only. Review the complete list. Nothing is saved until you press Confirm.</p>
          <div style={{ display: "grid", gap: 8, maxHeight: "58vh", overflowY: "auto" }}>
            {pending.map((p) => <article key={p.id} style={{ padding: 10, border: "1px solid #cbd5e1", borderRadius: 8 }}>
              <strong>{p.name || p.id}</strong>
              <div style={{ color: "#64748b", fontSize: 12 }}>Category: {p.categorySlug || "unknown"} · Brand: {p.brand || "unknown"}</div>
              <div style={{ color: "#0f766e", fontWeight: 800, marginTop: 4 }}>→ {drafts[p.id]}</div>
            </article>)}
          </div>
          <p style={{ fontSize: 12, color: "#475569" }}>Only the productType field will be updated. All other product fields remain unchanged.</p>
          <div style={{ display: "flex", gap: 10, position: "sticky", bottom: 0, background: "white", paddingTop: 10 }}>
            <button type="button" disabled={busy} onClick={() => setReviewOpen(false)} style={{ flex: 1, padding: 13, border: "1px solid #64748b", borderRadius: 9, background: "white", fontWeight: 800 }}>Cancel</button>
            <button type="button" disabled={busy} onClick={confirmAssignments} style={{ flex: 1, padding: 13, border: 0, borderRadius: 9, background: "#0f766e", color: "white", fontWeight: 800 }}>{busy ? "Saving…" : "Confirm TEST updates"}</button>
          </div>
        </section>
      </div>}
      {products.length > 0 && <>
        <section style={{ margin: "16px 0", padding: 12, borderRadius: 10, background: "#f1f5f9" }}>
          <strong>{products.length} products</strong> · <strong>{unassigned} unassigned</strong> · <strong>{pending.length} changes ready</strong>
          <button type="button" disabled={busy || !token} onClick={repairMalformedTypes} style={{ width: "100%", marginTop: 10, padding: 12, border: "1px solid #b45309", borderRadius: 8, background: "#fffbeb", color: "#92400e", fontWeight: 800 }}>Repair known malformed TEST product types</button>
          <button type="button" disabled={busy} onClick={applySuggestions} style={{ width: "100%", marginTop: 10, padding: 12, border: 0, borderRadius: 8, background: "#0e7490", color: "white", fontWeight: 800 }}>Suggest types automatically for clear product names</button>
          <p style={{ fontSize: 12, color: "#475569", margin: "6px 0" }}>Suggestions are not saved. Review them before using the TEST save button. Unclear products remain unassigned.</p>
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
