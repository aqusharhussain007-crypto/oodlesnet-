"use client";

import { useEffect, useState } from "react";
import { doc, getDoc, updateDoc, increment, collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase-app";
import Image from "next/image";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { excludeProductById, filterByPriceRange } from "@/lib/productUtils";

export default function ProductPage({ params }) {
  const { id } = params;

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const ref = doc(db, "products", id);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        setProduct({ id: snap.id, ...snap.data() });
        await updateDoc(ref, { views: increment(1) });
      }
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) return <div>Loading…</div>;
  if (!product) return <div>Not found</div>;

  const prices =
    product.store
      ?.map((s) => Number(s.price))
      .filter((p) => Number.isFinite(p)) || [];

  const cheapest = prices.length ? Math.min(...prices) : 0;

  return (
    <div>
      <Link href="/">Home</Link>

      <Image
        src={product.imageUrl}
        alt={product.name}
        width={900}
        height={500}
      />

      <h1>{product.name}</h1>

      {product.store?.map((store, i) => (
        <div key={i}>
          <h3>{store.name}</h3>

          {Number.isFinite(Number(store.price)) && (
            <div
              style={{
                color:
                  Number(store.price) === cheapest
                    ? "#16a34a"
                    : "#2563eb",
              }}
            >
              ₹ {Number(store.price).toLocaleString("en-IN")}
            </div>
          )}

          <button onClick={() => (window.location.href = store.url)}>
            Buy on {store.name}
          </button>
        </div>
      ))}
    </div>
  );
        }
          
