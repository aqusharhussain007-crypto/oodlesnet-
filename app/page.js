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
        {filteredProducts.map((p) => (
          <div
            key={p.id}
            style={{
              border: "1px solid #ddd",
              borderRadius: "10px",
              padding: "15px",
              background: "#fff",
              boxShadow: "0px 3px 8px rgba(0,0,0,0.08)",
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
  
