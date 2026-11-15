"use client";

import { useState } from "react";

const API_KEY = process.env.NEXT_PUBLIC_TEST_FIREBASE_API_KEY || "";
const PRODUCTS = [
  {
    documentId: "36MaFYdnIalGYYwZhZbq",
    name: "Motorola Edge 70 (Bronze Green, 8GB RAM, 256GB Storage)",
    specs: {
      display: "6.67-inch Extreme AMOLED, 2712 × 1220, up to 120Hz",
      processor: "Qualcomm Snapdragon 7 Gen 4",
      ram: "8GB LPDDR5X",
      storage: "256GB",
      rearCamera: "50MP main with OIS + 50MP ultra-wide",
      frontCamera: "50MP",
      battery: "5000mAh silicon-carbon",
      charging: "68W TurboPower wired + 15W wireless",
      operatingSystem: "Android 16",
      network: "5G sub-6GHz; 4G LTE",
    },
  },
  {
    documentId: "wYJ88jdBndp0VqtyE0Tu",
    name: "Nothing Phone (2a) 5G (8GB/128GB)",
    specs: {
      display: "6.7-inch Flexible AMOLED, 1084 × 2412, 30–120Hz",
      processor: "MediaTek Dimensity 7200 Pro",
      ram: "8GB",
      storage: "128GB",
      rearCamera: "50MP main with OIS + 50MP ultra-wide",
      frontCamera: "32MP",
      battery: "5000mAh",
      charging: "45W wired fast charging",
      operatingSystem: "Nothing OS 3.0 (Android 15)",
      network: "5G (NSA/SA) + 4G LTE",
    },
  },
];

export default function TestSpecUpdaterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [results, setResults] = useState([]);
  const [catalogFile, setCatalogFile] = useState(null);
  const [catalogConfirmed, setCatalogConfirmed] = useState(false);


  async function signIn() {
    if (!API_KEY) {
      setMessage("Test Firebase sign-in is not configured. The test API key is missing.");
      return "";
    }
    const response = await fetch(
      "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=" + encodeURIComponent(API_KEY),
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password, returnSecureToken: true }),
        cache: "no-store",
      }
    );
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.idToken) {
      throw new Error(data.error?.message || "Firebase test sign-in failed.");
    }
    return data.idToken;
  }

  async function inspectTestCatalog() {
    if (!email.trim() || (!token && !password)) {
      setMessage("Enter your test Firebase email and password first.");
      return;
    }
    setBusy(true);
    setMessage("");
    setResults([]);
    try {
      const idToken = token || await signIn();
      setToken(idToken);
      const response = await fetch("/api/admin/products/catalog-inspection", {
        method: "GET",
        headers: { Authorization: "Bearer " + idToken },
        cache: "no-store",
      });
      const data = await response.json().catch(() => ({ error: "Response was not valid JSON." }));
      setResults([{ operation: "read-only test catalogue inspection", httpStatus: response.status, ...data }]);
      setMessage(response.ok ? "Read-only inventory complete. No records were changed." : "Could not inspect the test catalogue.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Inspection failed.");
      setToken("");
    } finally {
      setPassword("");
      setBusy(false);
    }
  }

  async function replaceTestCatalog() {
    if (!email.trim() || (!token && !password)) {
      setMessage("Enter your test Firebase email and password first.");
      return;
    }
    if (!catalogFile) {
      setMessage("Choose the prepared 66-product JSON file first.");
      return;
    }
    if (!catalogConfirmed) {
      setMessage("Confirm the test-only catalogue replacement first.");
      return;
    }
    setBusy(true);
    setMessage("");
    setResults([]);
    try {
      const parsed = JSON.parse(await catalogFile.text());
      if (!Array.isArray(parsed) || parsed.length !== 66) {
        throw new Error("Selected file must contain exactly 66 product records.");
      }
      const idSet = new Set(parsed.map((item) => item?.id));
      if (idSet.size !== 66 || parsed.some((item) => !item?.id || !item?.data)) {
        throw new Error("The file has missing or duplicate IDs or invalid product data.");
      }
      const idToken = token || await signIn();
      setToken(idToken);
      const response = await fetch("/api/admin/products/catalog-replacement", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + idToken },
        body: JSON.stringify({ products: parsed, confirmReplace: true }),
        cache: "no-store",
      });
      const data = await response.json().catch(() => ({ error: "Response was not valid JSON." }));
      setResults([{ operation: "66-product test catalogue replacement", httpStatus: response.status, ...data }]);
      setMessage(response.ok && data.ok
        ? "Catalogue replacement completed. Review the backup ID and counts below."
        : "Replacement did not report success. Do not retry until we inspect the result.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Catalogue replacement failed.");
      setToken("");
    } finally {
      setPassword("");
      setBusy(false);
    }
  }

  async function run(mode) {
    if (!email.trim() || (!token && !password)) {
      setMessage("Enter your test Firebase email and password.");
      return;
    }
    if (mode === "write" && !confirmed) {
      setMessage("Tick the confirmation before applying changes.");
      return;
    }
    setBusy(true);
    setMessage("");
    setResults([]);
    try {
      const idToken = token || await signIn();
      setToken(idToken);
      const output = [];
      for (const product of PRODUCTS) {
        const response = await fetch("/api/admin/products/specs", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + idToken,
          },
          body: JSON.stringify({
            documentId: product.documentId,
            specs: product.specs,
            confirmWrite: mode === "write",
          }),
          cache: "no-store",
        });
        const data = await response.json().catch(() => ({ error: "Response was not valid JSON." }));
        output.push({ product: product.name, httpStatus: response.status, ...data });
        setResults([...output]);
        if (!response.ok) break;
      }
      const allOk = output.length === PRODUCTS.length && output.every((item) => item.ok);
      setMessage(
        mode === "write"
          ? allOk
            ? "Both restricted test updates completed. Review the backup IDs and results below."
            : "The process stopped at the first error. Review results before retrying; an earlier product may already have been updated."
          : allOk
            ? "Both products passed dry-run validation. No database changes were made."
            : "Dry-run stopped at the first error. No write was requested."
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Request failed. No automatic retry was made.");
      setToken("");
    } finally {
      setPassword("");
      setBusy(false);
    }
  }

  const field = {
    display: "block",
    width: "100%",
    boxSizing: "border-box",
    padding: 12,
    marginTop: 6,
    border: "1px solid #888",
    borderRadius: 8,
    fontSize: 16,
  };

  return (
    <main style={{ maxWidth: 760, margin: "24px auto", padding: 18, fontFamily: "Arial, sans-serif", lineHeight: 1.5, color: "#111" }}>
      <h1 style={{ fontSize: 26, fontWeight: 800 }}>OodlesNet TEST Catalogue Replacement + Specification Updater</h1>
      <p><strong>Database:</strong> oodlesnet-test only. Production is not connected to this updater.</p>
      <div style={{ border: "2px solid #b45309", borderRadius: 8, padding: 12, margin: "16px 0" }}>
        <strong>Strict limits</strong>
        <ul>
          <li>Only Motorola Edge 70 and Nothing Phone (2a) document IDs are accepted.</li>
          <li>The 66-product catalogue replacement is a separate, TEST-only operation with full backup.</li>
          <li>Each update creates a transactional backup of the previous specs.</li>
          <li>Dry-run is available before the explicit write confirmation.</li>
        </ul>
      </div>

      <section style={{ border: "2px solid #0b7285", borderRadius: 10, padding: 14, marginTop: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800 }}>Replace TEST catalogue with 66 products</h2>
        <p>First download the prepared JSON file, then select it here. This operation backs up every current test product, imports the 66 supplied IDs, and removes old test documents not in the new list. It is locked to oodlesnet-test.</p>
        <input type="file" accept=".json,application/json" onChange={(event) => { setCatalogFile(event.target.files?.[0] || null); setCatalogConfirmed(false); }} style={{ display: "block", width: "100%", marginTop: 10 }} />
        <p style={{ fontSize: 13 }}>{catalogFile ? "Selected: " + catalogFile.name + " (" + catalogFile.size + " bytes)" : "No JSON file selected."}</p>
        <label style={{ display: "flex", gap: 10, alignItems: "flex-start", marginTop: 12 }}>
          <input type="checkbox" checked={catalogConfirmed} onChange={(event) => setCatalogConfirmed(event.target.checked)} style={{ marginTop: 5, width: 20, height: 20 }} />
          <span>I authorize replacing the entire <strong>oodlesnet-test/products</strong> catalogue with these 66 records. Back up all existing records first, then remove records outside the 66 IDs. Production must not be touched.</span>
        </label>
        <button type="button" disabled={busy || !email.trim() || (!token && !password) || !catalogFile || !catalogConfirmed} onClick={replaceTestCatalog} style={{ padding: 12, borderRadius: 8, marginTop: 14, background: "#063c5a", color: "#fff" }}>
          {busy ? "Working…" : "Back up and replace TEST catalogue"}
        </button>
      </section>

      <h2 style={{ fontSize: 20, fontWeight: 700 }}>Review the two prepared specification sets</h2>
      {PRODUCTS.map((product) => (
        <section key={product.documentId} style={{ border: "1px solid #aaa", borderRadius: 8, padding: 12, marginTop: 12 }}>
          <strong>{product.name}</strong>
          <p style={{ fontSize: 12, overflowWrap: "anywhere" }}>Document ID: {product.documentId}</p>
          <pre style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere", background: "#f3f4f6", padding: 10, borderRadius: 6, fontSize: 13 }}>
            {JSON.stringify(product.specs, null, 2)}
          </pre>
        </section>
      ))}

      <h2 style={{ fontSize: 20, fontWeight: 700, marginTop: 24 }}>Test Firebase sign-in</h2>
      <label style={{ display: "block", marginTop: 12 }}>
        Test account email
        <input type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} style={field} placeholder="Firebase test account email" />
      </label>
      <label style={{ display: "block", marginTop: 12 }}>
        Password
        <input type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} style={field} placeholder="Your test Firebase password" />
      </label>
      <p style={{ fontSize: 13 }}>Credentials are sent directly to Firebase Authentication. The password is cleared after each attempt; the ID token stays only in this page's memory.</p>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 16 }}>
        <button type="button" disabled={busy || !email.trim() || (!token && !password)} onClick={inspectTestCatalog} style={{ padding: 12, borderRadius: 8, background: "#e5f3f8" }}>
          {busy ? "Working…" : "Inspect existing TEST products"}
        </button>

        <button type="button" disabled={busy || !email.trim() || (!token && !password)} onClick={() => run("dry-run")} style={{ padding: 12, borderRadius: 8 }}>
          {busy ? "Working…" : "Run both dry-runs"}
        </button>
        <button type="button" disabled={busy || !email.trim() || (!token && !password) || !confirmed} onClick={() => run("write")} style={{ padding: 12, borderRadius: 8, background: "#063c5a", color: "#fff" }}>
          {busy ? "Working…" : "Apply to TEST Firestore"}
        </button>
      </div>
      <label style={{ display: "flex", gap: 10, alignItems: "flex-start", marginTop: 16 }}>
        <input type="checkbox" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} style={{ marginTop: 5, width: 20, height: 20 }} />
        <span>I explicitly authorize updating these two records in <strong>oodlesnet-test</strong> only. I understand each update creates a backup first.</span>
      </label>

      {message && <p role="status" style={{ marginTop: 18, overflowWrap: "anywhere" }}>{message}</p>}
      {results.length > 0 && (
        <pre style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere", background: "#f3f4f6", padding: 12, borderRadius: 8, marginTop: 16, fontSize: 13 }}>
          {JSON.stringify(results, null, 2)}
        </pre>
      )}
    </main>
  );
}
