"use client";

import useAuth from "@/lib/useAuth";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, deleteDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useEffect, useState } from "react";

export default function AdminDashboard() {
  const user = useAuth();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    if (user === null) {
      window.location.href = "/admin/login";
    }
    if (user) loadProducts();
  }, [user]);

  async function loadProducts() {
    const snap = await getDocs(collection(db, "products"));
    const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    setProducts(items);
  }

  async function removeProduct(id) {
    await deleteDoc(doc(db, "products", id));
    loadProducts();
  }

  if (user === undefined) return <p>Loading...</p>;

  return (
    <main className="page-container">
      <h1>Admin Dashboard</h1>

      <button className="btn-glow" onClick={() => signOut(auth)}>Logout</button>

      <a href="/admin/add-product" className="btn-glow" style={{ marginLeft: "10px" }}>
        Add Product
      </a>

      <div style={{ marginTop: "20px" }}>
        {products.map((p) => (
          <div key={p.id} style={{ padding: "10px 0", borderBottom: "1px solid #ddd" }}>
            <strong>{p.name}</strong>

            <div style={{ marginTop: "8px" }}>
              <a href={`/product/${p.id}`} target="_blank" style={{ marginRight: "10px" }}>
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
    
