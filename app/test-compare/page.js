"use client";

import { useState } from "react";
import CompareContainer from "@/components/compare/CompareContainer";
import ProductSearchPicker from "@/components/compare/ProductSearchPicker";

const API_KEY = process.env.NEXT_PUBLIC_TEST_FIREBASE_API_KEY || "";

export default function TestComparePage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const [products, setProducts] = useState([]);
  const [attributeDefinitions, setAttributeDefinitions] = useState([]);
  const [selectedProductAId, setSelectedProductAId] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
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
      if (data.project !== "oodlesnet-test" || !Array.isArray(data.products) || data.count !== data.products.length) {
        throw new Error("Safety check failed: expected a valid product catalogue from oodlesnet-test.");
      }
      if (!data.products.length) throw new Error("The TEST catalogue contains no products.");
      const registryResponse = await fetch("/api/admin/attributes?mode=registry", {
        method: "GET",
        headers: { Authorization: "Bearer " + idToken },
        cache: "no-store",
      });
      const registryData = await registryResponse.json().catch(() => ({}));
      if (!registryResponse.ok || !registryData.ok ||
          registryData.project !== "oodlesnet-test" ||
          !Array.isArray(registryData.definitions) ||
          registryData.count !== registryData.definitions.length ||
          registryData.definitions.length < 1) {
        throw new Error(registryData.error || "Could not load the verified TEST attribute registry.");
      }
      setAttributeDefinitions(registryData.definitions);
      setProducts(data.products);
      const initialProduct = data.products.find((product) => product.id === selectedProductAId) || data.products[0];
      setSelectedProductAId(initialProduct?.id || "");
      setSelectedCategory(initialProduct?.categorySlug || "all");
       setMessage(`Loaded ${data.products.length} products dynamically from oodlesnet-test. Read-only mode; no database writes.`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load the test catalogue.");
      setToken("");
      setProducts([]);
      setAttributeDefinitions([]);
      setSelectedProductAId("");
    } finally {
      setPassword("");
      setBusy(false);
    }
  }

  const currentProduct = products.find((product) => product.id === selectedProductAId) || null;
  const categories = [...new Set(products.map((product) => String(product?.categorySlug || "").trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b));
  const categoryName = (value) => String(value || "All").replace(/[-_]+/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
  const productAOptions = selectedCategory === "all" ? products : products.filter((product) => product.categorySlug === selectedCategory);

  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: 18, color: "#0f172a" }}>
      <h1 style={{ fontSize: 26, fontWeight: 900 }}>OodlesNet TEST Comparison Lab</h1>
      <p style={{ marginTop: 8, lineHeight: 1.6 }}>Read-only comparison testing against the isolated <strong>oodlesnet-test</strong> catalogue and Firestore attribute registry. This page does not use the production Firebase client.</p>
      <section style={{ marginTop: 18, padding: 16, border: "1px solid #0e7490", borderRadius: 14, background: "#f0fdfa" }}>
        <h2 style={{ fontSize: 18, fontWeight: 800 }}>TEST Firebase sign-in</h2>
        <label style={{ display: "block", marginTop: 12 }}>Test account email</label>
        <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" autoComplete="username" style={{ width: "100%", padding: 12, border: "1px solid #94a3b8", borderRadius: 8, marginTop: 5 }} />
        <label style={{ display: "block", marginTop: 12 }}>Password</label>
        <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" autoComplete="current-password" style={{ width: "100%", padding: 12, border: "1px solid #94a3b8", borderRadius: 8, marginTop: 5 }} />
        <button type="button" disabled={busy} onClick={loadTestProducts} style={{ marginTop: 14, padding: "12px 18px", border: 0, borderRadius: 10, background: "#064e3b", color: "#fff", fontWeight: 800 }}>
          {busy ? "Loading TEST catalogue…" : "Load all TEST products"}
        </button>
        {message && <p role="status" style={{ color: "#166534", marginTop: 12 }}>{message}</p>}
        {error && <p role="alert" style={{ color: "#b91c1c", marginTop: 12 }}>{error}</p>}
      </section>

      {products.length > 0 && (
        <section style={{ marginTop: 20 }}>
          <div style={{ marginTop: 8, marginBottom: 18 }}>
            <div style={{ fontSize: 14, fontWeight: 900, color: "#475569", marginBottom: 9 }}>CATEGORY</div>
            <div role="group" aria-label="Choose product category" style={{ display: "flex", gap: 9, overflowX: "auto", paddingBottom: 8, WebkitOverflowScrolling: "touch" }}>
              <button type="button" aria-pressed={selectedCategory === "all"} onClick={() => setSelectedCategory("all")} style={{ flex: "0 0 auto", border: "1px solid #0d9488", borderRadius: 999, padding: "10px 17px", background: selectedCategory === "all" ? "#0f766e" : "#fff", color: selectedCategory === "all" ? "#fff" : "#134e4a", fontWeight: 800, whiteSpace: "nowrap" }}>All</button>
              {categories.map((category) => (
                <button key={category} type="button" aria-pressed={selectedCategory === category} onClick={() => { setSelectedCategory(category); if (currentProduct?.categorySlug !== category) setSelectedProductAId(""); }} style={{ flex: "0 0 auto", border: "1px solid #0d9488", borderRadius: 999, padding: "10px 17px", background: selectedCategory === category ? "#0f766e" : "#fff", color: selectedCategory === category ? "#fff" : "#134e4a", fontWeight: 800, whiteSpace: "nowrap" }}>{categoryName(category)}</button>
              ))}
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 14, alignItems: "start", marginTop: 8 }}>
            <section style={{ minWidth: 0 }}>
              <h3 style={{ fontSize: 16, fontWeight: 900, color: "#0f766e", margin: "0 0 10px" }}>PRODUCT A</h3>
              <ProductSearchPicker products={productAOptions} selectedId={currentProduct?.id || ""} onSelect={(product) => setSelectedProductAId(product?.id || "")} label="" placeholder="Search Product A…" categoryFilter={false} emptyMessage="No products match. Try another search." />
            </section>
            {currentProduct ? <CompareContainer currentProduct={currentProduct} demoProducts={products} attributeDefinitions={attributeDefinitions} /> : (
              <section style={{ minWidth: 0 }}>
                <h3 style={{ fontSize: 16, fontWeight: 900, color: "#0f766e", margin: "0 0 10px" }}>PRODUCT B</h3>
                <div style={{ height: 176, borderRadius: 12, background: "rgba(15,118,110,0.045)", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(15,118,110,0.22)", fontWeight: 900 }}>OodlesNet</div>
              </section>
            )}
          </div>
        </section>
      )}
    </main>
  );
}
