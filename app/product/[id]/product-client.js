"use client";

import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase-app";

/**
 * Hook: load a product and request view tracking through a server route.
 * Product reads remain public; all counter writes use Firebase Admin on the server.
 */
export function useProduct(id) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    async function loadProduct() {
      try {
        const ref = doc(db, "products", id);
        const snap = await getDoc(ref);

        if (snap.exists() && isMounted) {
          setProduct({ id: snap.id, ...snap.data() });

          // Tracking is best-effort and must not block product rendering.
          fetch("/api/track-view", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productId: id }),
            keepalive: true,
          }).catch(() => {});
        }
      } catch (error) {
        console.error("Product load error:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadProduct();

    return () => {
      isMounted = false;
    };
  }, [id]);

  return { product, loading };
}
