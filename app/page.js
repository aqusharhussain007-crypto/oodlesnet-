"use client";

import { useEffect, useState } from "react";
import ProductCard from "@/components/ProductCard";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function loadProducts() {
      const productSnap = await getDocs(collection(db, "products"));

      const loaded = [];

      for (let docSnap of productSnap.docs) {
        const product = { id: docSnap.id, ...docSnap.data() };

        // Load prices subcollection
        const priceSnap = await getDocs(
          collection(db, "products", docSnap.id, "prices")
        );

        let prices = priceSnap.docs.map(p => p.data().price);
        let lowestPrice = prices.length > 0 ? Math.min(...prices) : null;

        product.lowestPrice = lowestPrice;

        loaded.push(product);
      }

      setProducts(loaded);
    }

    loadProducts();
  }, []);

  // Search filter
  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="page-container">

      <h1 className="text-2xl font-bold mb-4">Products</h1>

      {/* SEARCH BAR */}
      <input
        className="search-bar"
        placeholder="Search products..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ marginBottom: "20px" }}
      />

      {/* PRODUCT GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {filtered.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

    </main>
  );
            }
    
