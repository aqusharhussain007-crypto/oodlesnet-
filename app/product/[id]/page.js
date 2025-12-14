import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase-app";
import ProductClient from "./product-client";

/* 🔥 SEO STEP 2 – Product Metadata (SERVER ONLY) */
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
    description: `Compare prices of ${product.name} across Amazon, Meesho, Ajio and more. Find the lowest price on OodlesNet.`,
    keywords: [
      product.name,
      "price comparison",
      "best price India",
      "compare prices",
      "online shopping",
    ],
    robots: {
      index: true,
      follow: true,
    },
  };
}

/* PAGE */
export default function ProductPage({ params }) {
  return <ProductClient id={params.id} />;
}
  
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase-app";
import ProductClient from "./product-client";

/* 🔥 SEO STEP 2 – Metadata */
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
    robots: { index: true, follow: true },
  };
}

/* 🔥 SEO STEP 3 – PRODUCT SCHEMA */
export async function generateStaticParams() {
  return [];
}

export async function generateViewport() {
  return {};
}

export async function generateSchema({ params }) {
  const ref = doc(db, "products", params.id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;

  const product = snap.data();
  const offers =
    product.store?.map((s) => ({
      "@type": "Offer",
      priceCurrency: "INR",
      price: s.price,
      availability: "https://schema.org/InStock",
      url: s.url,
      seller: {
        "@type": "Organization",
        name: s.name,
      },
    })) || [];

  const lowestPrice = offers.length
    ? Math.min(...offers.map((o) => Number(o.price)))
    : null;

  return {
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
      lowPrice: lowestPrice,
      offerCount: offers.length,
      offers,
    },
  };
}

/* PAGE */
export default function ProductPage({ params }) {
  return <ProductClient id={params.id} />;
    }
      
