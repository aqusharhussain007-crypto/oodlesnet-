"use client";

import { useState, useEffect } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, deleteDoc } from "firebase/firestore";

export default function AdminDashboard() {
  const [admin, setAdmin] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Protect page
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) {
        window.location.href = "/admin/login";
      } else {
        setAdmin(user);
        loadProducts();
      }
    });

    return () => unsub();
  }, []);

  async function loadProducts() {
    const snap = await getDocs(collection(db, "products"));
    const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    setProducts(list);
    setLoading(false);
  }

  async function removeProduct(id) {
    if (!confirm("Delete this product?")) return;

    await deleteDoc(doc(db, "products", id));
    loadProducts();
  }

  if (!admin) return <p style={{ padding: "20px" }}>Loading...</p>;

  return (
    <main className="page-container">
      <h1>Admin Dashboard</h1>

      <button
        className="btn-glow"
        onClick={() => signOut(auth)}
        style={{ margin: "15px 0" }}
      >
        Logout
      </button>

      <a
        href="/admin/add-product"
        className="btn-glow"
        style={{ display: "inline-block", marginBottom: "20px" }}
      >
        ➕ Add Product
      </a>

      {loading ? <p>Loading...</p> : (
        <div>
          {products.map((p) => (
            <div
              key={p.id}
              style={{
                borderBottom: "1px solid #ddd",
                padding: "15px 0",
                marginBottom: "10px"
              }}
            >
              <strong>{p.name}</strong>

              <div style={{ marginTop: "8px" }}>
                <a
                  href={`/product/${p.id}`}
                  target="_blank"
                  style={{ marginRight: "10px", color: "#0bbcff" }}
                >
                  View
                </a>

                <button
                  className="btn-glow"
                  onClick={() => removeProduct(p.id)}
                  style={{ padding: "5px 10px" }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
                                          }
      
