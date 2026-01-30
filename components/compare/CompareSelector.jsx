"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase-app";

export default function CompareSelector({
  selected,
  onSelect,
  excludeId,
  category,
}) {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    async function load() {
      const snap = await getDocs(collection(db, "products"));
      const list = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter(
          (p) =>
            p.id !== excludeId &&
            p.categorySlug === category
        );
      setProducts(list);
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
    
