"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { compareProducts } from "@/components/compare/compareRules";
import CompareResult from "@/components/compare/CompareResult";
import CompareSelector from "@/components/compare/CompareSelector";

// Synthetic data only. This route is a temporary, read-only comparison test.
const DEMO_PRODUCTS = [
  {
    id: "demo-phone-a",
    name: "Demo Smartphone A",
    brand: "Demo",
    categorySlug: "smartphones",
    productType: "smartphone",
    description: "Synthetic sample product for testing the comparison interface.",
    store: [{ name: "Demo Store", price: 14999, offer: "Sample offer", url: "#" }],
    specs: {
      display: "6.5-inch AMOLED (demo)",
      processor: "Demo chipset A",
      ram: "8 GB",
      storage: "128 GB",
      rearCamera: "50 MP (demo)",
      battery: "5000 mAh",
      charging: "33 W (demo)",
      operatingSystem: "Demo OS",
      network: "5G",
    },
    variantDetails: { ram: "8 GB", storage: "128 GB", colour: "Black" },
  },
  {
    id: "demo-phone-b",
    name: "Demo Smartphone B",
    brand: "Demo",
    categorySlug: "smartphones",
    productType: "smartphone",
    description: "Synthetic sample product for testing the comparison interface.",
    store: [{ name: "Demo Store", price: 16999, offers: ["Sample offer"] }],
    specs: {
      display: "6.7-inch AMOLED (demo)",
      processor: "Demo chipset B",
      ram: "8 GB",
      storage: "256 GB",
      rearCamera: "64 MP (demo)",
      battery: "5000 mAh",
      charging: "45 W (demo)",
      operatingSystem: "Demo OS",
      network: "5G",
    },
    variantDetails: { ram: "8 GB", storage: "256 GB", color: "Blue" },
  },
  {
    id: "demo-phone-c",
    name: "Demo Smartphone C",
    brand: "Demo",
    categorySlug: "smartphones",
    productType: "smartphone",
    description: "Synthetic sample product with intentionally incomplete specifications.",
    store: [{ name: "Demo Store", price: null }],
    specs: { display: "6.4-inch LCD (demo)", ram: "6 GB", storage: "128 GB" },
  },
  {
    id: "demo-tablet-d",
    name: "Demo Tablet D",
    brand: "Demo",
    categorySlug: "tablets",
    productType: "tablet",
    description: "Synthetic incompatible-category sample for testing comparison safeguards.",
    store: [{ name: "Demo Store", price: 9999, offer: "", url: "#" }],
    specs: { display: "10-inch LCD (demo)", storage: "64 GB" },
  },
];

const POWER_BANK_DEMOS = [
  {
    id: "demo-powerbank-a",
    name: "Demo Power Bank A",
    brand: "Demo",
    categorySlug: "power-banks",
    productType: "power_bank",
    description: "Synthetic power bank for category-template testing.",
    store: [{ name: "Demo Store", price: 1299, offer: "Sample offer", url: "#" }],
    specs: {
      capacity: "20000 mAh",
      outputPower: "22.5 W",
      ports: "USB-A × 2, USB-C × 1",
      input: "USB-C 18 W",
      fastCharging: "Supported",
      weight: "420 g",
    },
  },
  {
    id: "demo-powerbank-b",
    name: "Demo Power Bank B",
    brand: "Demo",
    categorySlug: "power-banks",
    productType: "power_bank",
    description: "Synthetic power bank with intentionally incomplete specifications.",
    store: [{ name: "Demo Store", price: 1599, offer: "", url: "#" }],
    specs: {
      capacity: "10000 mAh",
      outputPower: "20 W",
      ports: "USB-A × 1, USB-C × 1",
      input: "USB-C",
      fastCharging: "Not specified",
    },
  },
];

const BLUETOOTH_SPEAKER_DEMOS = [
  {
    id: "demo-speaker-a",
    name: "Demo Bluetooth Speaker A",
    brand: "Demo",
    categorySlug: "bluetooth-speakers",
    productType: "bluetooth_speaker",
    description: "Synthetic Bluetooth speaker for category-template testing.",
    store: [{ name: "Demo Store", price: 2499, offer: "Sample offer", url: "#" }],
    specs: {
      outputPower: "20 W",
      channels: "2.0 stereo",
      batteryLife: "12 hours",
      connectivity: "Bluetooth 5.3, AUX, USB-C",
      waterResistance: "IPX7",
      dimensions: "180 × 75 × 75 mm",
      weight: "650 g",
    },
  },
  {
    id: "demo-speaker-b",
    name: "Demo Bluetooth Speaker B",
    brand: "Demo",
    categorySlug: "bluetooth-speakers",
    productType: "bluetooth_speaker",
    description: "Synthetic speaker with intentionally incomplete specifications.",
    store: [{ name: "Demo Store", price: 1999, offer: "", url: "#" }],
    specs: {
      outputPower: "12 W",
      channels: "Mono",
      batteryLife: "8 hours",
      connectivity: "Bluetooth 5.0",
      waterResistance: "Not specified",
    },
  },
];


const SMARTWATCH_DEMOS = [
  {
    id: "demo-watch-a",
    name: "Demo Smartwatch A",
    brand: "Demo",
    categorySlug: "smartwatches",
    productType: "smartwatch",
    description: "Synthetic smartwatch for category-template testing.",
    store: [{ name: "Demo Store", price: 2999, offer: "Sample offer", url: "#" }],
    specs: {
      display: "1.8-inch AMOLED (demo)",
      healthSensors: "Heart rate, SpO2 (demo)",
      gps: "Built-in GPS",
      batteryLife: "7 days (demo)",
      waterResistance: "5 ATM (demo)",
      compatibility: "Android and iOS (demo)",
    },
  },
  {
    id: "demo-watch-b",
    name: "Demo Smartwatch B",
    brand: "Demo",
    categorySlug: "smartwatches",
    productType: "smartwatch",
    description: "Synthetic smartwatch with intentionally incomplete specifications.",
    store: [{ name: "Demo Store", price: 2499, offer: "", url: "#" }],
    specs: {
      display: "1.5-inch LCD (demo)",
      healthSensors: "Heart rate (demo)",
      batteryLife: "10 days (demo)",
      compatibility: "Android only (demo)",
    },
  },
];
export default function CompareTestPage() {
  const [productAId, setProductAId] = useState(DEMO_PRODUCTS[0].id);
  const [productBId, setProductBId] = useState(DEMO_PRODUCTS[1].id);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [powerBankB, setPowerBankB] = useState(null);
  const [powerBankResult, setPowerBankResult] = useState(null);
  const [powerBankError, setPowerBankError] = useState("");
  const [speakerB, setSpeakerB] = useState(null);
  const [speakerResult, setSpeakerResult] = useState(null);
  const [speakerError, setSpeakerError] = useState("");
  const [watchB, setWatchB] = useState(null);
  const [watchResult, setWatchResult] = useState(null);
  const [watchError, setWatchError] = useState("");

  const smartphoneResultRef = useRef(null);
  const powerBankResultRef = useRef(null);
  const speakerResultRef = useRef(null);
  const watchResultRef = useRef(null);

  useEffect(() => {
    const target = result
      ? smartphoneResultRef.current
      : powerBankResult
      ? powerBankResultRef.current
      : speakerResult
      ? speakerResultRef.current
      : watchResult
      ? watchResultRef.current
      : null;

    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [result, powerBankResult, speakerResult, watchResult]);

  const productA = useMemo(
    () => DEMO_PRODUCTS.find((product) => product.id === productAId),
    [productAId]
  );
  const productB = useMemo(
    () => DEMO_PRODUCTS.find((product) => product.id === productBId),
    [productBId]
  );

  function clearOtherResults(active) {
    if (active !== "smartphone") setResult(null);
    if (active !== "powerbank") setPowerBankResult(null);
    if (active !== "speaker") setSpeakerResult(null);
    if (active !== "watch") setWatchResult(null);
  }

  function runComparison() {
    clearOtherResults("smartphone");
    if (!productA || !productB || productA.id === productB.id) {
      setResult(null);
      setError("Choose two different products.");
      return;
    }
    const comparison = compareProducts(productA, productB);
    if (comparison.error) {
      setResult(null);
      const messages = {
        CATEGORY_MISMATCH: "These products belong to different categories. Choose two products from the same category.",
        UNSUPPORTED_TYPE: "This product category is not supported for comparison yet.",
        INVALID_PRODUCT: "One of the selected products is incomplete or invalid.",
      };
      setError(messages[comparison.error] || "We couldn't compare these products. Please check your selections.");
      return;
    }
    setError("");
    setResult(comparison);
  }

  function changeProductA(value) {
    setProductAId(value);
    setResult(null);
    setError("");
  }

  function changeProductB(value) {
    setProductBId(value);
    setResult(null);
    setError("");
  }

  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: "24px 16px 48px", color: "#123047" }}>
      <div style={{ padding: 18, borderRadius: 18, background: "#ecfdf8", border: "1px solid #7ddfd0" }}>
        <p style={{ margin: "0 0 6px", color: "#0f766e", fontWeight: 800, letterSpacing: 1 }}>OODLESNET · INTERNAL PREVIEW TEST</p>
        <h1 style={{ margin: "0 0 8px", fontSize: 26, fontWeight: 900 }}>Product comparison test</h1>
        <p style={{ margin: 0, lineHeight: 1.5 }}>
          This page uses synthetic demo products only. It does not read or write Firestore and does not change the live website.
        </p>
      </div>

      <section style={{ marginTop: 20, padding: 18, border: "1px solid #cbd5e1", borderRadius: 18, background: "#fff" }}>
        <label htmlFor="demo-product-a" style={{ display: "block", fontWeight: 800, marginBottom: 7 }}>Product A</label>
        <select id="demo-product-a" value={productAId} onChange={(event) => changeProductA(event.target.value)} style={{ width: "100%", padding: 12, borderRadius: 10, border: "1px solid #94a3b8", marginBottom: 16, background: "#fff" }}>
          {DEMO_PRODUCTS.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}
        </select>

        <div style={{ marginTop: 16 }}>
          <CompareSelector
            currentProduct={productA}
            selectedId={productBId}
            onSelect={(product) => changeProductB(product?.id || "")}
            demoProducts={DEMO_PRODUCTS}
          />
        </div>

        <button type="button" onClick={runComparison} style={{ width: "100%", marginTop: 16, padding: 14, border: 0, borderRadius: 12, color: "#fff", fontWeight: 900, fontSize: 16, background: "linear-gradient(135deg,#0f4c81,#10b981)" }}>
          Compare products
        </button>
        {error && <p role="alert" style={{ color: "#b91c1c", fontWeight: 700 }}>{error}</p>}
      </section>

      {result && <div ref={smartphoneResultRef} style={{ scrollMarginTop: 96 }}><CompareResult result={result} productA={productA} productB={productB} onReset={() => setResult(null)} /></div>}

      <section style={{ marginTop: 24, padding: 18, border: "1px solid #99f6e4", borderRadius: 18, background: "#f8fffd" }}>
        <h2 style={{ margin: "0 0 8px", fontSize: 22, fontWeight: 900 }}>Power bank category test</h2>
        <p style={{ margin: "0 0 14px", color: "#64748b", fontSize: 13, lineHeight: 1.5 }}>
          Synthetic power bank data tests the category-specific specification template. No Firestore access or writes.
        </p>
        <CompareSelector
          currentProduct={POWER_BANK_DEMOS[0]}
          selectedId={powerBankB?.id || ""}
          onSelect={(product) => {
            setPowerBankB(product);
            setPowerBankResult(null);
            setPowerBankError("");
          }}
          demoProducts={POWER_BANK_DEMOS}
        />
        <button
          type="button"
          disabled={!powerBankB}
          onClick={() => {
            clearOtherResults("powerbank");
            const comparison = compareProducts(POWER_BANK_DEMOS[0], powerBankB);
            if (comparison.error) {
              setPowerBankResult(null);
              setPowerBankError(comparison.error);
            } else {
              setPowerBankError("");
              setPowerBankResult(comparison);
            }
          }}
          style={{ width: "100%", marginTop: 14, padding: 14, border: 0, borderRadius: 12, color: "#fff", fontWeight: 900, fontSize: 16, background: "linear-gradient(135deg,#0f4c81,#10b981)", opacity: powerBankB ? 1 : 0.55 }}
        >
          Compare power banks
        </button>
        {powerBankError && <p role="alert" style={{ color: "#b91c1c", fontWeight: 700 }}>{powerBankError}</p>}
      </section>

      {powerBankResult && <div ref={powerBankResultRef} style={{ scrollMarginTop: 96 }}><CompareResult result={powerBankResult} productA={POWER_BANK_DEMOS[0]} productB={powerBankB} onReset={() => setPowerBankResult(null)} /></div>}

      <section style={{ marginTop: 24, padding: 18, border: "1px solid #99f6e4", borderRadius: 18, background: "#f8fffd" }}>
        <h2 style={{ margin: "0 0 8px", fontSize: 22, fontWeight: 900 }}>Bluetooth speaker category test</h2>
        <p style={{ margin: "0 0 14px", color: "#64748b", fontSize: 13, lineHeight: 1.5 }}>
          Synthetic speaker data tests the category-specific specification template. No Firestore access or writes.
        </p>
        <CompareSelector
          currentProduct={BLUETOOTH_SPEAKER_DEMOS[0]}
          selectedId={speakerB?.id || ""}
          onSelect={(product) => {
            setSpeakerB(product);
            setSpeakerResult(null);
            setSpeakerError("");
          }}
          demoProducts={BLUETOOTH_SPEAKER_DEMOS}
        />
        <button
          type="button"
          disabled={!speakerB}
          onClick={() => {
            clearOtherResults("speaker");
            const comparison = compareProducts(BLUETOOTH_SPEAKER_DEMOS[0], speakerB);
            if (comparison.error) {
              setSpeakerResult(null);
              setSpeakerError(comparison.error);
            } else {
              setSpeakerError("");
              setSpeakerResult(comparison);
            }
          }}
          style={{ width: "100%", marginTop: 14, padding: 14, border: 0, borderRadius: 12, color: "#fff", fontWeight: 900, fontSize: 16, background: "linear-gradient(135deg,#0f4c81,#10b981)", opacity: speakerB ? 1 : 0.55 }}
        >
          Compare speakers
        </button>
        {speakerError && <p role="alert" style={{ color: "#b91c1c", fontWeight: 700 }}>{speakerError}</p>}
      </section>

      {speakerResult && <div ref={speakerResultRef} style={{ scrollMarginTop: 96 }}><CompareResult result={speakerResult} productA={BLUETOOTH_SPEAKER_DEMOS[0]} productB={speakerB} onReset={() => setSpeakerResult(null)} /></div>}

      <section style={{ marginTop: 24, padding: 18, border: "1px solid #99f6e4", borderRadius: 18, background: "#f8fffd" }}>
        <h2 style={{ margin: "0 0 8px", fontSize: 22, fontWeight: 900 }}>Smartwatch category test</h2>
        <p style={{ margin: "0 0 14px", color: "#64748b", fontSize: 13, lineHeight: 1.5 }}>
          Synthetic smartwatch data tests display, health sensors, GPS, battery, water resistance and compatibility fields. No Firestore access or writes.
        </p>
        <CompareSelector
          currentProduct={SMARTWATCH_DEMOS[0]}
          selectedId={watchB?.id || ""}
          onSelect={(product) => {
            setWatchB(product);
            setWatchResult(null);
            setWatchError("");
          }}
          demoProducts={SMARTWATCH_DEMOS}
        />
        <button
          type="button"
          disabled={!watchB}
          onClick={() => {
            clearOtherResults("watch");
            const comparison = compareProducts(SMARTWATCH_DEMOS[0], watchB);
            if (comparison.error) {
              setWatchResult(null);
              setWatchError(comparison.error);
            } else {
              setWatchError("");
              setWatchResult(comparison);
            }
          }}
          style={{ width: "100%", marginTop: 14, padding: 14, border: 0, borderRadius: 12, color: "#fff", fontWeight: 900, fontSize: 16, background: "linear-gradient(135deg,#0f4c81,#10b981)", opacity: watchB ? 1 : 0.55 }}
        >
          Compare smartwatches
        </button>
        {watchError && <p role="alert" style={{ color: "#b91c1c", fontWeight: 700 }}>{watchError}</p>}
      </section>

      {watchResult && <div ref={watchResultRef} style={{ scrollMarginTop: 96 }}><CompareResult result={watchResult} productA={SMARTWATCH_DEMOS[0]} productB={watchB} onReset={() => setWatchResult(null)} /></div>}

      <p style={{ marginTop: 20, fontSize: 13, color: "#64748b", lineHeight: 1.5 }}>
        Demo prices and specifications are invented test values, not real product information. Any score shown is only a test of the current comparison rules.
      </p>
    </main>
  );
}
