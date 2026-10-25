"use client";

import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase-app";

const VIEW_GUARD_MS = 30 * 60 * 1000;

function shouldReportView(id) {
  try {
    const key = `viewed_${id}`;
    const last = Number(sessionStorage.getItem(key) || 0);
    if (Date.now() - last < VIEW_GUARD_MS) return false;
    sessionStorage.setItem(key, String(Date.now()));
  } catch {}
  return true;
}

export function useProduct(id) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) { setLoading(false); return; }
    let isMounted = true;

    async function loadProduct() {
      try {
        const snap = await getDoc(doc(db, "products", id));
        if (snap.exists() && isMounted) {
          setProduct({ id: snap.id, ...snap.data() });
          if (shouldReportView(id)) {
            fetch("/api/track-view", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ productId: id }),
              keepalive: true,
            }).catch(() => {});
          }
        }
      } catch (error) {
        console.error("Product load error:", error?.message || "unknown error");
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadProduct();
    return () => { isMounted = false; };
  }, [id]);

  return { product, loading };
}
