"use client";

import { useState, useEffect } from "react";
import useAuth from "@/lib/useAuth";
import { db } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";

export default function AddProductView() {
  const user = useAuth();

  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [desc, setDesc] = useState("");
  const [price, setPrice] = useState("");

  useEffect(() => {
    if (user === null) window.location.href = "/admin/login";
  }, [user]);

  async function addProduct(e) {
    e.preventDefault();

    await addDoc(collection(db, "products"), {
      name,
      image,
      description: desc,
      price: Number(price),
    });

    alert("Product added!");
    window.location.href = "/admin/dashboard";
  }

  if (user === undefined) return <p>Loading...</p>;

  return (
    <main className="page-container" style={{ maxWidth: "500px" }}>
      <h1>Add Product</h1>

      <form onSubmit={addProduct} style={{ marginTop: "20px" }}>
        <input
          className="search-bar"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ width: "100%", marginBottom: "10px" }}
        />

        <input
          className="search-bar"
          placeholder="Image URL"
          value={image}
          onChange={(e) => setImage(e.target.value)}
          style={{ width: "100%", marginBottom: "10px" }}
        />

        <textarea
          className="search-bar"
          placeholder="Description"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          style={{ width: "100%", height: "100px", marginBottom: "10px" }}
        />

        <input
          className="search-bar"
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          style={{ width: "100%", marginBottom: "20px" }}
        />

        <button className="btn-glow" style={{ width: "100%" }}>
          Add Product
        </button>
      </form>
    </main>
  );
          }
