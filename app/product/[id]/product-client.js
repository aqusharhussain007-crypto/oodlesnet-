"use client";

import { useEffect, useState } from "react";
import { doc, getDoc, updateDoc, increment } from "firebase/firestore";
import { db } from "@/lib/firebase-app";
import Image from "next/image";
import Link from "next/link";

export default function ProductClient({ params }) {
  const { id } = params;

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProduct() {
      try {
        const ref = doc(db, "products", id);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          setProduct({ id: snap.id, ...snap.data() });
          await updateDoc(ref, { views: increment(1) });
        }
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    }
    loadProduct();
  }, [id]);

  if (loading) return <div>Loading…</div>;
  if (!product) return <div>Product not found</div>;

  function handleBuy(store) {
    window.location.href = store.url;
  }

  return (
    <div className="p-4">
      <Link href="/">Home</Link>

      <Image
        src={product.imageUrl}
        alt={product.name}
        width={900}
        height={600}
      />

      <h1>{product.name}</h1>

      {product.store?.map((store, i) => (
        <div key={i}>
          <h3>{store.name}</h3>

          {Number.isFinite(Number(store.price)) && (
            <div>
              ₹ {Number(store.price).toLocaleString("en-IN")}
            </div>
          )}

          <button onClick={() => handleBuy(store)}>
            Buy on {store.name}
          </button>
        </div>
      ))}
    </div>
  );
}
