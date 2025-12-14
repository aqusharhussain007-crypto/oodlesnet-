import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase-app";
import ProductClient from "./product-client";

/* 🔹 SEO STEP 2 – METADATA */
export async function generateMetadata({ params }) {
  const ref = doc(db, "products", params.id);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    return {
      title: "Product not found | OodlesNet",
      robots: { index: false },
    };
  }

  const product = snap.data();
  const lowestPrice =
    product.store?.length
      ? Math.min(...product.store.map((s) => Number(s.price)))
      : null;

  return {
    title: `${product.name} – Best Price ₹${lowestPrice ?? ""}`,
    description: `Compare prices of ${product.name} across top online stores. Find the lowest price and best deals on OodlesNet.`,
    robots: {
      index: true,
      follow: true,
    },
  };
}

/* PAGE */
export default async function ProductPage({ params }) {
  const ref = doc(db, "products", params.id);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    return <ProductClient id={params.id} />;
  }

  const product = snap.data();

  /* 🔹 SEO STEP 3 – JSON-LD PRODUCT SCHEMA */
  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: [product.imageUrl],
    description: product.description,
    brand: {
      "@type": "Brand",
      name: product.brand || product.name,
    },
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "INR",
      lowPrice: Math.min(
        ...(product.store || []).map((s) => Number(s.price))
      ),
      offerCount: product.store?.length || 0,
      offers: (product.store || []).map((s) => ({
        "@type": "Offer",
        priceCurrency: "INR",
        price: s.price,
        availability: "https://schema.org/InStock",
        url: s.url,
        seller: {
          "@type": "Organization",
          name: s.name,
        },
      })),
    },
  };

  return (
    <>
      {/* 🔥 JSON-LD FOR GOOGLE */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      <ProductClient id={params.id} />
    </>
  );
}
