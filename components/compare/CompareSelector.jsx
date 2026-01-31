"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase-app";

/* ---------------------------------
   TEMPORARY TYPE INFERENCE (NO DB)
   Uses name + searchKey
---------------------------------- */
const TYPE_MAP = {
  earbuds: ["earbuds", "tws", "in-ear", "in ear"],
  neckband: ["neckband"],
  bluetooth_speaker: ["speaker", "bluetooth speaker"],
  smartwatch: ["smartwatch", "watch"],
  headphones: ["headphone", "over-ear", "on-ear"],
};

function inferType(product) {
  const text = `${product.name || ""} ${product.searchKey || ""}`.toLowerCase();

  for (const [type, keywords] of Object.entries(TYPE_MAP)) {
    if (keywords.some((k) => text.includes(k))) {
      return type;
    }
  }

  return "unknown";
}

export default function CompareSelector({
  selected,
  onSelect,
  excludeId,
  category,
}) {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    async function load() {
      if (!db) return;

      const snap = await getDocs(collection(db, "products"));
      const all = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

      const currentProduct = all.find((p) => p.id === excludeId);
      if (!currentProduct) return;

      const currentType = inferType(currentProduct);

      const filtered = all.filter(
        (p) =>
          p.id !== excludeId &&
          p.categorySlug === category &&
          inferType(p) === currentType
      );

      setProducts(filtered);
    }

    load();
  }, [excludeId, category]);

  return (
    <div style={{ position: "relative" }}>
      <select
        value={selected?.id || ""}
        onChange={(e) => {
          const p = products.find((x) => x.id === e.target.value);
          onSelect(p || null);
        }}
        style={{
          width: "100%",
          padding: "14px 44px 14px 14px",
          borderRadius: 14,
          border: "2px solid #10b981",
          background: "#ffffff",
          fontSize: 15,
          fontWeight: 700,
          color: selected ? "#111827" : "#6b7280",
          outline: "none",
          boxShadow: "0 6px 14px rgba(16,185,129,0.2)",
          appearance: "none",
          WebkitAppearance: "none",
          cursor: "pointer",
        }}
        onFocus={(e) => {
          e.target.style.boxShadow =
            "0 0 0 4px rgba(16,185,129,0.35)";
        }}
        onBlur={(e) => {
          e.target.style.boxShadow =
            "0 6px 14px rgba(16,185,129,0.2)";
        }}
      >
        <option value="">Select a product to compare</option>

        {products.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}

        {products.length === 0 && (
          <option disabled>
            No similar products found
          </option>
        )}
      </select>

      {/* Dropdown Arrow */}
      <div
        style={{
          position: "absolute",
          right: 14,
          top: "50%",
          transform: "translateY(-50%)",
          pointerEvents: "none",
          fontSize: 18,
          color: "#10b981",
        }}
      >
        ▾
      </div>
    </div>
  );
        }
        
