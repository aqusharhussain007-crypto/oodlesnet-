"use client";

import React, { useState, useEffect } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, deleteDoc } from "firebase/firestore";

export default function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (!user) {
        window.location.href = "/admin/login";
        return;
      }
      setAdmin(user);
      loadProducts();
    });
  }, []);

  async function loadProducts() {
    const snap = await getDocs(collection(db, "products"));
    const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    setProducts(items);
    setLoading(false);
  }

  async function deleteProduct(id) {
    await deleteDoc(doc(db, "products", id));
    loadProducts();
  }

  if (!admin) return <p>Loading...</p>;

  return (
    <main style={{ padding: "20px" }}>
      <h1>Admin Dashboard</h1>

      <button
        onClick={() => signOut(auth)}
        className="btn-glow"
        style={{ marginBottom: "20px" }}
      >
        Logout
      </button>

      <a href="/admin/add-product" className="btn-glow">Add Product</a>

      <div style={{ marginTop: "25px" }}>
        {loading ? (
          <p>Loading products...</p>
        ) : (
          products.map((p) => (
            <div
              key={p.id}
              style={{
                borderBottom: "1px solid #ddd",
                padding: "15px 0",
                marginBottom: "5px",
              }}
            >
              <strong>{p.name}</strong>

              <div style={{ marginTop: "10px" }}>
                <a
                  href={`/product/${p.id}`}
                  target="_blank"
                  style={{ marginRight: "10px", color: "#0bbcff" }}
                >
                  View
                </a>

                <button
                  className="btn-glow"
                  onClick={() => deleteProduct(p.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </main>
  );
          }
          
