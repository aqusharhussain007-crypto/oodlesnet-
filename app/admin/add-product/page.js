"use client";

import { useState } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, doc, setDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { app } from "@/lib/firebase";

export default function AddProduct() {
  const auth = getAuth(app);

  // Protect page
  onAuthStateChanged(auth, (user) => {
    if (!user) window.location.href = "/admin/login";
  });

  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [img, setImg] = useState("");

  const [amazonPrice, setAmazonPrice] = useState("");
  const [amazonLink, setAmazonLink] = useState("");

  const [flipkartPrice, setFlipkartPrice] = useState("");
  const [flipkartLink, setFlipkartLink] = useState("");

  const [meeshoPrice, setMeeshoPrice] = useState("");
  const [meeshoLink, setMeeshoLink] = useState("");

  const [message, setMessage] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    if (!name || !desc || !img) {
      setMessage("Please fill all required fields.");
      return;
    }

    try {
      // 1) Add product main info
      const docRef = await addDoc(collection(db, "products"), {
        name,
        description: desc,
        image: img,
        createdAt: new Date(),
      });

      const productId = docRef.id;

      // 2) Add store price documents
      if (amazonPrice && amazonLink) {
        await setDoc(doc(db, "products", productId, "prices", "amazon"), {
          price: Number(amazonPrice),
          link: amazonLink,
        });
      }

      if (flipkartPrice && flipkartLink) {
        await setDoc(doc(db, "products", productId, "prices", "flipkart"), {
          price: Number(flipkartPrice),
          link: flipkartLink,
        });
      }

      if (meeshoPrice && meeshoLink) {
        await setDoc(doc(db, "products", productId, "prices", "meesho"), {
          price: Number(meeshoPrice),
          link: meeshoLink,
        });
      }

      setMessage("Product added successfully!");
      setName("");
      setDesc("");
      setImg("");
      setAmazonPrice("");
      setAmazonLink("");
      setFlipkartPrice("");
      setFlipkartLink("");
      setMeeshoPrice("");
      setMeeshoLink("");

    } catch (err) {
      console.error(err);
      setMessage("Error adding product.");
    }
  }

  return (
    <main className="page-container" style={{ maxWidth: "600px" }}>
      <h1>Add New Product</h1>

      {message && (
        <p style={{ marginTop: "10px", color: "#0bbcff", fontWeight: "bold" }}>
          {message}
        </p>
      )}

      <form onSubmit={handleSubmit} style={{ marginTop: "20px" }}>

        {/* Product Name */}
        <label>Product Name*</label>
        <input
          className="search-bar"
          style={{ width: "100%", marginBottom: "15px" }}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        {/* Description */}
        <label>Description*</label>
        <textarea
          className="search-bar"
          style={{ width: "100%", height: "100px", marginBottom: "15px" }}
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
        />

        {/* Image URL */}
        <label>Image URL*</label>
        <input
          className="search-bar"
          style={{ width: "100%", marginBottom: "20px" }}
          value={img}
          onChange={(e) => setImg(e.target.value)}
        />

        <h2 style={{ marginTop: "20px" }}>Store Prices</h2>

        {/* AMAZON */}
        <label>Amazon Price</label>
        <input
          className="search-bar"
          type="number"
          style={{ width: "100%" }}
          value={amazonPrice}
          onChange={(e) => setAmazonPrice(e.target.value)}
        />

        <label>Amazon Link</label>
        <input
          className="search-bar"
          style={{ width: "100%", marginBottom: "15px" }}
          value={amazonLink}
          onChange={(e) => setAmazonLink(e.target.value)}
        />

        {/* FLIPKART */}
        <label>Flipkart Price</label>
        <input
          className="search-bar"
          type="number"
          style={{ width: "100%" }}
          value={flipkartPrice}
          onChange={(e) => setFlipkartPrice(e.target.value)}
        />

        <label>Flipkart Link</label>
        <input
          className="search-bar"
          style={{ width: "100%", marginBottom: "15px" }}
          value={flipkartLink}
          onChange={(e) => setFlipkartLink(e.target.value)}
        />

        {/* MEESHO */}
        <label>Meesho Price</label>
        <input
          className="search-bar"
          type="number"
          style={{ width: "100%" }}
          value={meeshoPrice}
          onChange={(e) => setMeeshoPrice(e.target.value)}
        />

        <label>Meesho Link</label>
        <input
          className="search-bar"
          style={{ width: "100%", marginBottom: "15px" }}
          value={meeshoLink}
          onChange={(e) => setMeeshoLink(e.target.value)}
        />

        <button
          type="submit"
          className="btn-glow"
          style={{ width: "100%", padding: "0.9rem", marginTop: "10px" }}
        >
          Add Product
        </button>
      </form>
    </main>
  );
    }
        
