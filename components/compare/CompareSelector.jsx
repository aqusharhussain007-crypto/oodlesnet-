"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase-app";
import { canCompare } from "@/components/compare/compareRules";

/**
 * CompareSelector
 * - Shows ONLY products that can be compared with currentProduct
 * - Uses compareRules as single source of truth
 */
export default function CompareSelector({
  currentProduct,
  onSelect,
  selectedId,
}) {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentProduct) return;

    async function loadOptions() {
      setLoading(true);

      try {
        const snap = await getDocs(collection(db, "products"));

        const filtered = snap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .filter((p) => {
            // never compare with itself
            if (p.id === currentProduct.id) return false;

            // must pass compare rules
            const res = canCompare(currentProduct, p);
            return res.allowed;
          });

        setOptions(filtered);
      } catch (e) {
        console.error("CompareSelector load error:", e);
        setOptions([]);
      } finally {
        setLoading(false);
      }
    }

    loadOptions();
  }, [currentProduct]);

  return (
    <select
      value={selectedId || ""}
      disabled={loading || options.length === 0}
      onChange={(e) => onSelect(e.target.value)}
      style={{
        width: "100%",
        padding: "12px 14px",
        borderRadius: 14,
        border: "2px solid #10b981",
        fontSize: 16,
        fontWeight: 700,
        background: "#ffffff",
        color: "#111827",
        outline: "none",
        cursor: loading ? "not-allowed" : "pointer",
      }}
    >
      <option value="">
        {loading
          ? "Loading comparable products..."
          : options.length === 0
          ? "No comparable products available"
          : "Select a product to compare"}
      </option>

      {options.map((p) => (
        <option key={p.id} value={p.id}>
          {p.name}
        </option>
      ))}
    </select>
  );
}
