"use client";

import { useState } from "react";
import { products } from "../data/products";

export default function Home() {
  const [query, setQuery] = useState("");

  // Filter products by search text
  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div style={{ padding: "40px", fontFamily: "Arial" }}>
      <h1 style={{ textAlign: "center", marginBottom: "20px" }}>
        OodlesNet 🚀
      </h1>

      {/* SEARCH BAR */}
      <div style={{ textAlign: "center", marginBottom: "30px" }}>
        <input
          type="text"
          placeholder="Search for any product..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{
            width: "60%",
            padding: "12px 15px",
            fontSize: "16px",
            borderRadius: "8px",
            border: "1px solid #ccc",
          }}
        />
      </div>

      {/* PRODUCT LIST */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
          gap: "20px",
        }}
      >
import Link from "next/link";
import { products } from "../data/products";

export default function Home() {
  return (
    <div style={{ padding: "30px", fontFamily: "Arial" }}>
      <h1>OodlesNet 🚀</h1>

      <input
        type="text"
        placeholder="Search for products..."
        style={{
          width: "100%",
          padding: "12px",
          margin: "20px 0",
          borderRadius: "8px",
          border: "1px solid #ccc",
        }}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
        gap: "20px",
      }}>
        {filteredProducts.map(product => (
          <Link
            key={product.id}
            href={`/product/${product.id}`}
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <div style={{
              background: "#fff",
              padding: "20px",
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              cursor: "pointer",
              transition: "0.2s",
            }}>
              <img
                src={product.image}
                alt={product.name}
                style={{ width: "100%", borderRadius: "10px" }}
              />

              <h3>{product.name}</h3>

              {product.stores.map((store, index) => (
                <p key={index}>
                  <strong>{store.name}:</strong> ₹{store.price}
                </p>
              ))}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
                                  }
                                  
            }}
          >
            <img
              src={p.image}
              alt={p.name}
              style={{
                width: "100%",
                borderRadius: "10px",
                marginBottom: "10px",
              }}
            />

            <h3>{p.name}</h3>

            {/* STORE PRICE COMPARISON */}
            <div style={{ marginTop: "10px" }}>
              {p.stores.map((s, index) => (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "6px 0",
                    borderBottom: "1px solid #eee",
                  }}
                >
                  <span>{s.name}</span>
                  <strong>₹{s.price}</strong>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
                }
  
