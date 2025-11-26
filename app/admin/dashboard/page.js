"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { collection, getDocs, doc, deleteDoc } from "firebase/firestore";

export default function AdminDashboard() {

  const [admin, setAdmin] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Protect this page
  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (!user) {
        window.location.href = "/admin/login";
      } else {
        setAdmin(user);
        loadProducts();
      }
    });
  }, []);

  async function loadProducts() {
    const snap = await getDocs(collection(db, "products"));
    const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setProducts(list);
    setLoading(false);
  }

  async function removeProduct(id) {
    if (!confirm("Delete this product?")) return;

    await deleteDoc(doc(db, "products", id));
    loadProducts();
  }

  return (
    <main className="page-container">
      <h1>Admin Dashboard</h1>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <div style={{ margin: "20px 0" }}>
            <button className="btn-glow" onClick={() => signOut(auth)}>
              Logout
            </button>
          </div>

          <h2 style={{ marginTop: "20px" }}>Products</h2>

          <a
            href="/admin/add-product"
            className="btn-glow"
            style={{
              display: "inline-block",
              margin: "10px 0",
              padding: "10px 20px"
            }}
          >
            ➕ Add New Product
          </a>

          <div style={{ marginTop: "20px" }}>
            {products.length === 0 ? (
              <p>No products found.</p>
            ) : (
              products.map((p) => (
                <div
                  key={p.id}
                  style={{
                    padding: "15px",
                    borderBottom: "1px solid #ccc",
                    marginBottom: "10px"
                  }}
                >
                  <strong>{p.name}</strong>

                  <div style={{ marginTop: "5px" }}>
                    <a
                      href={`/product/${p.id}`}
                      target="_blank"
                      style={{
                        marginRight: "10px",
                        textDecoration: "none",
                        color: "#0bbcff"
                      }}
                    >
                      View
                    </a>

                    <button
                      className="btn-glow"
                      style={{ padding: "4px 10px", marginLeft: "10px" }}
                      onClick={() => removeProduct(p.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </main>
  );
      }
                      
