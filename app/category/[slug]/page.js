import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase-app";
import ProductCard from "@/components/ProductCard";

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
    title: titles[slug] || "Category Deals | OodlesNet",
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

  const snap = await getDocs(collection(db, "products"));

  const products = snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .filter((p) => p.categorySlug === slug);

  return (
    <main className="page-container" style={{ padding: 12 }}>
      <h1
        className="section-title"
        style={{ marginBottom: 12, textTransform: "capitalize" }}
      >
        {slug} Deals
      </h1>

      {products.length === 0 && (
        <p style={{ color: "#666" }}>
          No products found in this category.
        </p>
      )}

      <div className="products-grid">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </main>
  );
      }
      
