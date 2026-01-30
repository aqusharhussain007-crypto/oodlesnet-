"use client";

import { useEffect, useState } from "react";
import { doc, getDoc, updateDoc, increment } from "firebase/firestore";
import { db } from "@/lib/firebase-app";

/**
 * Hook: load single product + increment views
 * NO UI here
 */
export function useProduct(id) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    let isMounted = true;

    async function loadProduct() {
      try {
        const ref = doc(db, "products", id);
        const snap = await getDoc(ref);

        if (snap.exists() && isMounted) {
          setProduct({ id: snap.id, ...snap.data() });
          await updateDoc(ref, { views: increment(1) });
        }
      } catch (e) {
        console.error("Product load error:", e);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadProduct();

    return () => {
      isMounted = false;
    };
  }, [id]);

  return { product, loading };
                      }
            
