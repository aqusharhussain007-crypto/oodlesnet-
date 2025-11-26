"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";

export default function ProductPage({ params }) {
  const [product, setProduct] = useState(null);
  const [prices, setPrices] = useState([]);

  useEffect(() => {
    async function loadProductData() {
      // Load MAIN product info
      const productRef = doc(db, "products", params.id);
      const productSnap = await getDoc(productRef);

      if (productSnap.exists()) {
        setProduct({ id: productSnap.id, ...productSnap.data() });
      }

      // Load SUBCOLLECTION "prices"
      const pricesRef = collection(db, "products", params.id, "prices");
      const priceSnap = await getDocs(pricesRef);

      const priceList = priceSnap.docs.map(doc => ({
        store: doc.id,
        ...doc.data(),
      }));

      // Sort from lowest price → highest
      priceList.sort((a, b) => a.price - b.price);

      setPrices(priceList);
    }

    loadProductData();
  }, [params.id]);


  if (!product) return <h1>Loading...</h1>;


  return (
    <div className="page-container" style={{ maxWidth: "700px" }}>

      <h1 style={{ marginBottom: "20px" }}>{product.name}</h1>

      <img
        src={product.image}
        alt={product.name}
        style={{
          width: "100%",
          borderRadius: "10px",
          marginBottom: "20px",
          boxShadow: "0 0 12px rgba(11,188,255,0.4)"
        }}
      />

      <p style={{ marginBottom: "25px", fontSize: "1.1rem" }}>
        {product.description}
      </p>


      {/* PRICE TABLE */}
      <h2 style={{ marginTop: "30px", marginBottom: "10px" }}>
        Price Comparison
      </h2>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          background: "#fff",
          borderRadius: "12px",
          overflow: "hidden",
          boxShadow: "0 0 12px rgba(11,188,255,0.25)"
        }}
      >
        <thead style={{ background: "#0bbcff", color: "white" }}>
          <tr>
            <th style={{ padding: "12px" }}>Store</th>
            <th style={{ padding: "12px" }}>Price</th>
            <th style={{ padding: "12px" }}>Link</th>
          </tr>
        </thead>

        <tbody>
          {prices.map((p, index) => (
            <tr
              key={index}
              style={{
                textAlign: "center",
                background: index === 0 ? "rgba(11,188,255,0.10)" : "white",
                fontWeight: index === 0 ? "bold" : "normal",
              }}
            >
              <td style={{ padding: "12px", textTransform: "capitalize" }}>
                {p.store}
              </td>

              <td style={{ padding: "12px" }}>
                ₹{p.price}
              </td>

              <td style={{ padding: "12px" }}>
                <a
                  href={p.link}
                  target="_blank"
                  className="btn-glow"
                  style={{
                    padding: "6px 12px",
                    borderRadius: "6px",
                    display: "inline-block",
                    textDecoration: "none"
                  }}
                >
                  Buy
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>


      {/* Cheapest price highlight */}
      {prices.length > 0 && (
        <p style={{ marginTop: "15px", fontWeight: "bold" }}>
          💰 Lowest Price: ₹{prices[0].price} on {prices[0].store}
        </p>
      )}

    </div>
  );
                                      }
    
