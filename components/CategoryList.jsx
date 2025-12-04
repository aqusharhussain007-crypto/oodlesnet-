"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase-app";

export default function CategoryList() {
  const [categories, setCategories] = useState([]);

  // Load categories from Firestore
  useEffect(() => {
    async function loadCategories() {
      const snap = await getDocs(collection(db, "categories"));
      const items = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCategories(items);
    }
    loadCategories();
  }, []);

  return (
    <div
      style={{
        display: "flex",
        overflowX: "auto",
        gap: "12px",
        padding: "10px 8px",
        marginTop: "14px",
      }}
    >
      {categories.map((cat) => (
        <div
          key={cat.id}
          style={{
            minWidth: "80px",
            background: "white",
            borderRadius: "12px",
            padding: "12px 10px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            textAlign: "center",
            border: "2px solid #00c3ff",
          }}
        >
          <div style={{ fontSize: "28px" }}>{cat.icon}</div>
          <div style={{ fontSize: "14px", marginTop: "6px", color: "#008ecc" }}>
            {cat.name}
          </div>
        </div>
      ))}
    </div>
  );
}
