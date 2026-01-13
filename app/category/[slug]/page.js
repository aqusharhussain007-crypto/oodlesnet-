import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase-app";
import ProductCard from "@/components/ProductCard";
import Link from "next/link";
import CategorySkeleton from "@/components/CategorySkeleton";

/* ---------- SEO METADATA (SERVER) ---------- */
export async function generateMetadata({ params }) {
  const slug = params.slug;

  const titles = {
    mobile: "Best Mobile Price Comparison in India",
    laptop: "Best Laptop Deals & Price Comparison",
    electronics: "Compare Electronics Prices Online",
  };

  const descriptions = {
    mobile:
      "Compare mobile prices across Amazon, Meesho, Ajio and more. Find the lowest mobile prices in India.",
    laptop:
      "Compare laptop prices online. Find best laptop deals and offers in India.",
    electronics:
      "Compare electronics prices and find the best online deals in India.",
  };

  return {
    title: titles[slug] || "Category | OodlesNet",
    description:
      descriptions[slug] ||
      "Compare prices and find the best deals online on OodlesNet.",
    alternates: {
      canonical: `https://oodlesnet.vercel.app/category/${slug}`,
    },
  };
}

/* ---------- PAGE ---------- */
export default async function CategoryPage({ params }) {
  const slug = params.slug;

  const q = query(
    collection(db, "products"),
    where("categorySlug", "==", slug)
  );

  const snap = await getDocs(q);

  const products = snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  }));

  return (
    <main className="page-container" style={{ padding: 12 }}>
      {/* BREADCRUMB */}
      <div style={{ fontSize: 14, marginBottom: 10 }}>
        <Link href="/" style={{ color: "#3b82f6" }}>
          Home
        </Link>{" "}
        / <strong style={{ textTransform: "capitalize" }}>{slug}</strong>
      </div>

      <h1
        className="section-title"
        style={{ marginBottom: 12, textTransform: "capitalize" }}
      >
        {slug}
      </h1>

      {/* ✅ SKELETON FALLBACK */}
      {products.length === 0 ? (
        <CategorySkeleton />
      ) : (
        <div className="products-grid">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </main>
  );
}
