"use client";

import { useEffect, useState } from "react";
import useAuth from "@/lib/useAuth";
import { auth } from "@/lib/firebase-auth";
import { db } from "@/lib/firebase-app";

import { signOut } from "firebase/auth";
import { collection, getDocs, doc, deleteDoc } from "firebase/firestore";

export default function AdminDashboardView() {
  const user = useAuth();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    if (user === null) window.location.href = "/admin/login";
    if (user) loadProducts();
  }, [user]);

  async function loadProducts() {
    const snap = await getDocs(collection(db, "products"));
    const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    setProducts(list);
  }

  async function removeProduct(id) {
    await deleteDoc(doc(db, "products", id));
    loadProducts();
  }

  if (user === undefined) return <p>Loading...</p>;

  return (
    <main className="page-container">
      <h1>Admin Dashboard</h1>

      <button className="btn-glow" onClick={() => signOut(auth)}>
        Logout
      </button>

      <a
        href="/admin/add-product"
        className="btn-glow"
        style={{ marginLeft: "10px" }}
      >
        Add Product
      </a>

      <div style={{ marginTop: "20px" }}>
        {products.map((p) => (
          <div
            key={p.id}
            style={{
              borderBottom: "1px solid #ddd",
              padding: "12px 0",
              marginBottom: "10px",
            }}
          >
            <strong>{p.name}</strong>

            <div style={{ marginTop: "10px" }}>
              <a
                href={`/product/${p.id}`}
                target="_blank"
                style={{ marginRight: "15px" }}
              >
                View
              </a>

              <button className="btn-glow" onClick={() => removeProduct(p.id)}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
