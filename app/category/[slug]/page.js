import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase-app";
import ProductCard from "@/components/ProductCard";
import Link from "next/link";

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

  /* FETCH CATEGORY (FOR PROPER NAME) */
  const catSnap = await getDocs(
    query(collection(db, "categories"), where("slug", "==", slug))
  );
  const category = catSnap.docs[0]?.data();

  const categoryName =
    category?.name ||
    slug.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

  /* FETCH PRODUCTS */
  const q = query(
    collection(db, "products"),
    where("categorySlug", "==", slug)
  );

  const snap = await getDocs(q);

  let products = snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  }));

  /* SORTING (SERVER SAFE) */
  const sort = params?.searchParams?.sort || "default";

  if (sort === "price-asc") {
    products = products.sort(
      (a, b) =>
        Number(a.store?.[0]?.price || 0) -
        Number(b.store?.[0]?.price || 0)
    );
  }

  if (sort === "price-desc") {
    products = products.sort(
      (a, b) =>
        Number(b.store?.[0]?.price || 0) -
        Number(a.store?.[0]?.price || 0)
    );
  }

  return (
    <main className="page-container" style={{ padding: 12 }}>
      {/* BREADCRUMB */}
      <div style={{ fontSize: 14, marginBottom: 10 }}>
        <Link href="/" style={{ color: "#3b82f6" }}>
          Home
        </Link>{" "}
        / <strong>{categoryName}</strong>
      </div>

      {/* CATEGORY TITLE */}
      <h1
        className="section-title"
        style={{ marginBottom: 12 }}
      >
        {categoryName}
      </h1>

      {/* SORTING */}
      <div style={{ marginBottom: 16 }}>
        <select
          defaultValue="default"
          onChange={(e) => {
            const v = e.target.value;
            window.location.search =
              v === "default" ? "" : `?sort=${v}`;
          }}
          style={{
            padding: 10,
            borderRadius: 10,
            border: "1px solid #ddd",
            fontWeight: 600,
          }}
        >
          <option value="default">Sort by</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
        </select>
      </div>

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
    
