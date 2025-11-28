"use client";

import { useEffect, useState } from "react";
import useAuth from "@/lib/useAuth";

import {
  loadAllProducts,
  deleteProduct,
  logoutAdmin,
} from "@/lib/dashboard-actions";

export default function AdminDashboardView() {
  const user = useAuth();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    if (user === null) window.location.href = "/admin/login";
    if (user) fetchProducts();
  }, [user]);

  async function fetchProducts() {
    const list = await loadAllProducts();
    setProducts(list);
  }

  async function handleDelete(id) {
    await deleteProduct(id);
    fetchProducts();
  }

  if (user === undefined) return <p>Loading...</p>;

  return (
    <main className="page-container">
      <h1>Admin Dashboard</h1>

      <button className="btn-glow" onClick={logoutAdmin}>
        Logout
      </button>

      <a href="/admin/add-product" className="btn-glow" style={{ marginLeft: "10px" }}>
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

              <button className="btn-glow" onClick={() => handleDelete(p.id)}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
