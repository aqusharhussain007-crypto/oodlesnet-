import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase-app";
import ProductCard from "@/components/ProductCard";
import Link from "next/link";
import SkeletonLoader from "@/components/SkeletonLoader";

/* ---------- SEO METADATA (SERVER) ---------- */
export async function generateMetadata({ params }) {
  const slug = params.slug;

  const categorySeo = {
    mobile: {
      title: "Mobile Phone Price Comparison in India",
      description:
        "Compare mobile phone prices from online stores in India. Discover competitive prices and deals on OodlesNet.",
    },
    smartphone: {
      title: "Smartphone Price Comparison in India",
      description:
        "Compare smartphone prices across online stores in India and discover current deals on OodlesNet.",
    },
    smartphones: {
      title: "Smartphone Price Comparison in India",
      description:
        "Compare smartphone prices across online stores in India and discover current deals on OodlesNet.",
    },
    laptop: {
      title: "Laptop Price Comparison & Deals in India",
      description:
        "Compare laptop prices from online stores in India. Explore available laptop deals on OodlesNet.",
    },
    electronics: {
      title: "Electronics Price Comparison in India",
      description:
        "Compare electronics prices, including power banks and Bluetooth speakers, across online stores in India.",
    },
    "power-banks": {
      title: "Power Bank Price Comparison in India",
      description:
        "Compare power bank prices and offers across online stores in India. Find options that match your needs on OodlesNet.",
    },
    "bluetooth-speakers": {
      title: "Bluetooth Speaker Price Comparison in India",
      description:
        "Compare Bluetooth speaker prices across online stores in India and discover available deals on OodlesNet.",
    },
  };

  const fallbackName = slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

  const seo = categorySeo[slug] || {
    title: `${fallbackName} Price Comparison in India`,
    description: `Compare ${fallbackName.toLowerCase()} prices across online stores in India. Discover products and deals on OodlesNet.`,
  };

  return {
    title: seo.title,
    description: seo.description,
    alternates: {
      canonical: `/category/${slug}`,
    },
  };
}

/* ---------- PAGE ---------- */
export default async function CategoryPage({ params }) {
  const slug = params.slug;

  // Electronics is the parent category; keep product records in their
  // original Power Banks and Bluetooth Speakers subcategories.
  const categorySlugs = slug === "electronics"
    ? ["electronics", "power-banks", "bluetooth-speakers"]
    : slug === "smartphones" || slug === "smartphone"
      ? ["smartphones", "smartphone"]
      : [slug];
  const snapshots = await Promise.all(categorySlugs.map((categorySlug) =>
    getDocs(query(collection(db, "products"), where("categorySlug", "==", categorySlug)))
  ));
  const byId = new Map();
  snapshots.forEach((snap) => snap.docs.forEach((d) => byId.set(d.id, { id: d.id, ...d.data() })));
  const products = [...byId.values()];
  const title = slug === "smartphones" || slug === "smartphone"
    ? "Smartphones"
    : slug === "electronics"
      ? "Electronics"
      : slug.split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");

  return (
    <main className="page-container" style={{ padding: 12 }}>
      {/* BREADCRUMB */}
      <div style={{ fontSize: 14, marginBottom: 10 }}>
        <Link href="/" style={{ color: "#3b82f6" }}>
          Home
        </Link>{" "}
        / <strong>{title}</strong>
      </div>

      <h1
        className="section-title"
        style={{ marginBottom: 12 }}
      >
        {title}
      </h1>

      {/* PRODUCTS */}
      {products.length === 0 ? (
        <SkeletonLoader rows={4} height={260} />
      ) : (
        <div className="products-grid">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
            />
          ))}
        </div>
      )}
    </main>
  );
}
