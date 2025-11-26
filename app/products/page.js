"use client";

import { useEffect, useState } from "react";
import ProductCard from "@/components/ProductCard";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);

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

  return (
    <main className="page-container">
      <h1 className="text-2xl font-bold mb-4">All Products</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {products.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </main>
  );
}
