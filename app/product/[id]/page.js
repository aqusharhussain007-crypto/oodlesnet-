import { doc, getDoc, increment, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase-app";
import Image from "next/image";
import Link from "next/link";

/* ---------------- SEO METADATA (SERVER) ---------------- */
export async function generateMetadata({ params }) {
  const ref = doc(db, "products", params.id);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    return {
      title: "Product not found | OodlesNet",
    };
  }

  const product = snap.data();
  const prices =
    product.store?.map((s) => Number(s.price)).filter(Boolean) || [];

  const low = prices.length ? Math.min(...prices) : null;
  const high = prices.length ? Math.max(...prices) : null;

  return {
    title: `${product.name} – Best Price Comparison`,
    description: `Compare prices of ${product.name}. Lowest price ₹${low}. Updated offers from multiple stores.`,
    openGraph: {
      title: product.name,
      description: `Compare prices of ${product.name} across stores`,
      images: [product.imageUrl],
    },
  };
}

/* ---------------- PAGE (SERVER) ---------------- */
export default async function ProductPage({ params }) {
  const ref = doc(db, "products", params.id);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    return <div className="p-4">Product not found</div>;
  }

  const product = { id: snap.id, ...snap.data() };
  const stores = product.store || [];

  const prices = stores.map((s) => Number(s.price)).filter(Boolean);
  const low = Math.min(...prices);
  const high = Math.max(...prices);

  // Increment views (fire & forget)
  updateDoc(ref, { views: increment(1) }).catch(() => {});

  /* -------- PRODUCT SCHEMA (JSON-LD) -------- */
  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: [product.imageUrl],
    description: product.description,
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "INR",
      lowPrice: low,
      highPrice: high,
      offerCount: stores.length,
      availability: "https://schema.org/InStock",
    },
  };

  return (
    <div className="p-4 pb-24 max-w-[700px] mx-auto">
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      {/* Breadcrumb */}
      <div className="text-sm mb-3">
        <Link href="/" className="text-blue-500">
          Home
        </Link>{" "}
        / <span className="font-bold">{product.name}</span>
      </div>

      {/* Image */}
      <div className="rounded-2xl overflow-hidden mb-4 bg-white">
        <Image
          src={product.imageUrl}
          alt={product.name}
          width={800}
          height={600}
          className="w-full object-cover"
        />
      </div>

      {/* Title */}
      <h1 className="text-2xl font-bold text-blue-700">{product.name}</h1>

      {/* Description */}
      <p className="mt-2 text-gray-700">{product.description}</p>

      {/* Prices */}
      <h3 className="mt-6 text-xl font-bold text-blue-600">
        Compare Prices
      </h3>

      <div className="flex gap-4 overflow-x-auto py-3 no-scrollbar">
        {stores.map((store, i) => (
          <a
            key={i}
            href={store.url}
            target="_blank"
            className="min-w-[240px] bg-white p-4 rounded-2xl shadow border"
          >
            <div className="font-bold text-lg">
              {store.name} – ₹{store.price}
            </div>
            <div className="text-sm text-gray-600">{store.offer}</div>
          </a>
        ))}
      </div>
    </div>
  );
}
