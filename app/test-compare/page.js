"use client";

import { useState } from "react";
import CompareContainer from "@/components/compare/CompareContainer";
import ProductSearchPicker from "@/components/compare/ProductSearchPicker";

const API_KEY = process.env.NEXT_PUBLIC_TEST_FIREBASE_API_KEY || "";
const MOTOROLA_ID = "36MaFYdnIalGYYwZhZbq";

export default function TestComparePage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const [products, setProducts] = useState([]);
  const [selectedProductAId, setSelectedProductAId] = useState(MOTOROLA_ID);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadTestProducts() {
    if (!email.trim() || (!token && !password)) {
      setError("Enter your TEST Firebase email and password.");
      return;
    }
    setBusy(true);
    setError("");
    setMessage("");
    try {
      let idToken = token;
      if (!idToken) {
        if (!API_KEY) throw new Error("Test Firebase API key is not configured.");
        const authResponse = await fetch("https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=" + encodeURIComponent(API_KEY), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email.trim(), password, returnSecureToken: true }),
          cache: "no-store",
        });
        const authData = await authResponse.json().catch(() => ({}));
        if (!authResponse.ok || !authData.idToken) throw new Error(authData.error?.message || "TEST Firebase sign-in failed.");
        idToken = authData.idToken;
        setToken(idToken);
      }
      const response = await fetch("/api/admin/products/compare-catalog", {
        method: "GET",
        headers: { Authorization: "Bearer " + idToken },
        cache: "no-store",
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.ok) throw new Error(data.error || "Could not load TEST catalogue.");
      if (data.project !== "oodlesnet-test" || data.count !== 66 || !Array.isArray(data.products) || data.products.length !== 66) {
        throw new Error("Safety check failed: expected exactly 66 products from oodlesnet-test.");
      }
      if (!data.products.some((product) => product.id === MOTOROLA_ID)) throw new Error("Motorola test product was not found.");
      setProducts(data.products);
      setSelectedProductAId((previous) => data.products.some((product) => product.id === previous) ? previous : MOTOROLA_ID);
      setMessage("Loaded 66 products directly from oodlesnet-test. Read-only mode; no database writes.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load the test catalogue.");
      setToken("");
      setProducts([]);
      setSelectedProductAId("");
    } finally {
      setPassword("");
      setBusy(false);
    }
  }

  const currentProduct = products.find((product) => product.id === selectedProductAId) || null;

  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: 18, color: "#0f172a" }}>
      <h1 style={{ fontSize: 26, fontWeight: 900 }}>OodlesNet TEST Comparison Lab</h1>
      <p style={{ marginTop: 8, lineHeight: 1.6 }}>Read-only comparison testing against the isolated <strong>oodlesnet-test</strong> catalogue. This page does not use the production Firebase client.</p>
      <section style={{ marginTop: 18, padding: 16, border: "1px solid #0e7490", borderRadius: 14, background: "#f0fdfa" }}>
        <h2 style={{ fontSize: 18, fontWeight: 800 }}>TEST Firebase sign-in</h2>
        <label style={{ display: "block", marginTop: 12 }}>Test account email</label>
        <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" autoComplete="username" style={{ width: "100%", padding: 12, border: "1px solid #94a3b8", borderRadius: 8, marginTop: 5 }} />
        <label style={{ display: "block", marginTop: 12 }}>Password</label>
        <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" autoComplete="current-password" style={{ width: "100%", padding: 12, border: "1px solid #94a3b8", borderRadius: 8, marginTop: 5 }} />
        <button type="button" disabled={busy} onClick={loadTestProducts} style={{ marginTop: 14, padding: "12px 18px", border: 0, borderRadius: 10, background: "#064e3b", color: "#fff", fontWeight: 800 }}>
          {busy ? "Loading TEST catalogue…" : "Load 66 TEST products"}
        </button>
        {message && <p role="status" style={{ color: "#166534", marginTop: 12 }}>{message}</p>}
        {error && <p role="alert" style={{ color: "#b91c1c", marginTop: 12 }}>{error}</p>}
      </section>

      {products.length > 0 && (
        <section style={{ marginTop: 20 }}>
          <h2 style={{ fontSize: 20, fontWeight: 900 }}>Build a product comparison</h2>
          <p style={{ color: "#475569", lineHeight: 1.5 }}>Search the entire TEST catalogue. Choose any starting product, then search for a compatible product to compare.</p>
          <p style={{ color: "#475569", lineHeight: 1.5 }}>Choose two products side by side. Product B automatically shows only products compatible with Product A's category and type.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10, alignItems: "start", marginTop: 14 }}>
            <section style={{ minWidth: 0, padding: 10, border: "1px solid #99f6e4", borderRadius: 16, background: "#f0fdfa" }}>
              <ProductSearchPicker
                products={products}
                selectedId={currentProduct?.id || ""}
                onSelect={(product) => setSelectedProductAId(product?.id || "")}
                label="PRODUCT A"
                placeholder="Search product…"
                categoryFilter={true}
                emptyMessage="No products match. Try another search."
              />
            </section>
            <div style={{ minWidth: 0 }}>
              {currentProduct ? (
                <CompareContainer currentProduct={currentProduct} demoProducts={products} />
              ) : (
                <section style={{ padding: 12, border: "1px dashed #94a3b8", borderRadius: 16, background: "#f8fafc", color: "#64748b", fontSize: 14 }}>
                  <strong style={{ display: "block", color: "#0f172a", marginBottom: 8 }}>PRODUCT B</strong>
                  Select Product A first. Compatible products will appear here automatically.
                </section>
              )}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
