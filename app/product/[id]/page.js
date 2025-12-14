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
  
