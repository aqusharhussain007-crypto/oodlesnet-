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
    <select
      value={selected?.id || ""}
      onChange={(e) => {
        const p = products.find((x) => x.id === e.target.value);
        onSelect(p || null);
      }}
    >
      <option value="">Select a product to compare</option>
      {products.map((p) => (
        <option key={p.id} value={p.id}>
          {p.name}
        </option>
      ))}
    </select>
  );
        }
      
