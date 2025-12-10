"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import InfiniteSlider from "@/components/InfiniteSlider";
import ProductCard from "@/components/ProductCard";
import { db } from "@/lib/firebase-app";
import {
  doc,
  getDoc,
  getDocs,
  collection,
  updateDoc,
  increment,
  query,
  where,
  orderBy,
  limit,
} from "firebase/firestore";

/**
 * Product details page (client component)
 * - Fetches product doc by id (Firestore)
 * - Increments impressions (safe guarded)
 * - Stores recent view in localStorage
 * - Shows image gallery, price compare, affiliate buttons
 * - Shows similar products slider (same category, fallback trending)
 */

export default function ProductPage() {
  const { id } = useParams();
  const router = useRouter();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [similar, setSimilar] = useState([]);
  const [images, setImages] = useState([]);
  const [savingImpression, setSavingImpression] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    async function loadProduct() {
      setLoading(true);
      try {
        const ref = doc(db, "products", id);
        const snap = await getDoc(ref);
        if (!snap.exists()) {
          setProduct(null);
          setLoading(false);
          return;
        }
        const data = { id: snap.id, ...snap.data() };

        if (cancelled) return;
        setProduct(data);

        // images array fallback
        const imgs = [];
        if (data.imageUrl) imgs.push(data.imageUrl);
        if (Array.isArray(data.images)) imgs.push(...data.images);
        setImages(imgs.length ? imgs : ["/placeholder-500x300.png"]);

        // add to recent (localStorage)
        try {
          if (typeof window !== "undefined") {
            const raw = JSON.parse(localStorage.getItem("recent") || "[]");
            const arr = Array.isArray(raw) ? raw : [];
            // remove existing duplicate
            const filtered = arr.filter((r) => r.id !== data.id);
            filtered.unshift({ id: data.id, name: data.name, imageUrl: data.imageUrl, price: data.price, categorySlug: data.categorySlug });
            // keep max 12
            localStorage.setItem("recent", JSON.stringify(filtered.slice(0, 12)));
          }
        } catch (e) {}

        // fetch similar (by category) fallback trending
        const sim = [];
        if (data.categorySlug) {
          try {
            const q = query(
              collection(db, "products"),
              where("categorySlug", "==", data.categorySlug),
              orderBy("impressions", "desc"),
              limit(10)
            );
            const snap2 = await getDocs(q);
            snap2.forEach((d) => {
              if (d.id !== data.id) sim.push({ id: d.id, ...d.data() });
            });
          } catch (e) {
            // ignore
          }
        }

        // fallback: top impressions
        if (sim.length === 0) {
          const q2 = query(collection(db, "products"), orderBy("impressions", "desc"), limit(10));
          const snap3 = await getDocs(q2);
          snap3.forEach((d) => {
            if (d.id !== data.id) sim.push({ id: d.id, ...d.data() });
          });
        }
        if (!cancelled) setSimilar(sim);

        // increment impressions once
        try {
          setSavingImpression(true);
          await updateDoc(ref, { impressions: increment(1) });
        } catch (e) {
          // ignore write errors silently
        } finally {
          setSavingImpression(false);
        }
      } catch (err) {
        console.error("load product err", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadProduct();

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <main className="page-container" style={{ padding: 12 }}>
        <div className="skeleton shimmer" style={{ height: 280, borderRadius: 18 }} />
      </main>
    );
  }

  if (!product) {
    return (
      <main className="page-container" style={{ padding: 12 }}>
        <div style={{ padding: 24, background: "#fff", borderRadius: 14 }}>
          <h2 style={{ color: "#0077aa" }}>Product not found</h2>
          <p>We couldn't find that product. It may have been removed.</p>
          <button className="btn-ghost" onClick={() => router.push("/")}>Go home</button>
        </div>
      </main>
    );
  }

  // helper to open affiliate link (in new tab)
  function openAffiliate(url) {
    if (!url) return alert("No affiliate link available for this product.");
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <main className="page-container" style={{ padding: 12 }}>
      {/* Top: gallery + title + price */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12 }}>
        <div style={{ borderRadius: 18, overflow: "hidden", boxShadow: "0 10px 30px rgba(0,0,0,0.08)", padding: 6, background: "linear-gradient(90deg, rgba(0,198,255,0.08), rgba(0,255,150,0.06))" }}>
          {/* simple horizontal image gallery */}
          <div style={{ display: "flex", gap: 8, overflowX: "auto", padding: 6 }} className="no-scrollbar">
            {images.map((src, i) => (
              <div key={i} style={{ minWidth: 320, width: "100%", maxWidth: 640, flex: "0 0 auto", borderRadius: 12, overflow: "hidden" }}>
                <Image src={src} alt={product.name} width={900} height={540} style={{ width: "100%", height: "auto", objectFit: "cover" }} />
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", gap: 12, alignItems: "flex-start", flexDirection: "column" }}>
          <h1 style={{ fontSize: "1.6rem", color: "#00b7ff", margin: 0 }}>{product.name}</h1>

          <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "#0077b6" }}>₹ {product.price?.toLocaleString?.() ?? product.price}</div>
            <div style={{ padding: "6px 10px", borderRadius: 999, background: "linear-gradient(90deg,#00c6ff,#00ff99)", color: "#001", fontWeight: 800, boxShadow: "0 10px 20px rgba(0,198,255,0.12)" }}>
              Compare
            </div>

            {/* affiliate buttons area */}
            <div style={{ display: "flex", gap: 8, marginLeft: "auto" }}>
              <button onClick={() => openAffiliate(product.amazonUrl)} className="btn-primary">Buy on Amazon</button>
              <button onClick={() => openAffiliate(product.meeshoUrl)} className="btn-primary" style={{ background: "linear-gradient(90deg,#00ff99,#00c6ff)" }}>Meesho</button>
              <button onClick={() => openAffiliate(product.ajioUrl)} className="btn-ghost">Other</button>
            </div>
          </div>

          {/* short description */}
          {product.description && (
            <p style={{ color: "#333", marginTop: 6 }}>{product.description}</p>
          )}

          {/* price comparison block (simple presentation of collected marketplaces) */}
          <div style={{ marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            {product.amazonPrice != null && (
              <div style={{ background: "#fff", borderRadius: 12, padding: "10px 12px", boxShadow: "0 6px 18px rgba(0,0,0,0.06)" }}>
                <div style={{ fontSize: 12, color: "#777" }}>Amazon</div>
                <div style={{ fontWeight: 800, color: "#0077b6" }}>₹ {product.amazonPrice}</div>
              </div>
            )}
            {product.meeshoPrice != null && (
              <div style={{ background: "#fff", borderRadius: 12, padding: "10px 12px", boxShadow: "0 6px 18px rgba(0,0,0,0.06)" }}>
                <div style={{ fontSize: 12, color: "#777" }}>Meesho</div>
                <div style={{ fontWeight: 800, color: "#0077b6" }}>₹ {product.meeshoPrice}</div>
              </div>
            )}
            {product.ajioPrice != null && (
              <div style={{ background: "#fff", borderRadius: 12, padding: "10px 12px", boxShadow: "0 6px 18px rgba(0,0,0,0.06)" }}>
                <div style={{ fontSize: 12, color: "#777" }}>Ajio</div>
                <div style={{ fontWeight: 800, color: "#0077b6" }}>₹ {product.ajioPrice}</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Details & specs */}
      <section style={{ marginTop: 18 }}>
        <h3 style={{ color: "#00b7ff", marginBottom: 8 }}>Product details</h3>
        {product.details ? (
          <div style={{ background: "#f8feff", padding: 12, borderRadius: 12 }}>
            <div dangerouslySetInnerHTML={{ __html: product.details }} />
          </div>
        ) : (
          <div style={{ color: "#333" }}>
            <p>{product.description ?? "No additional details available."}</p>
          </div>
        )}
      </section>

      {/* Similar / You may like (infinite slider) */}
      {similar.length > 0 && (
        <section style={{ marginTop: 18 }}>
          <h3 style={{ color: "#00b7ff" }}>Similar products</h3>
          {/* InfiniteSlider expects items prop with id, name, imageUrl */}
          <InfiniteSlider items={similar} />
        </section>
      )}
    </main>
  );
}
