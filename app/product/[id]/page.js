import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase-app";
import ProductPageClient from "./ProductPageClient";

async function getProduct(id) {
  if (!id) return null;

  try {
    const snapshot = await getDoc(doc(db, "products", id));
    return snapshot.exists()
      ? { id: snapshot.id, ...snapshot.data() }
      : null;
  } catch (error) {
    console.error("Product metadata lookup failed:", error?.message || "unknown error");
    return null;
  }
}

export async function generateMetadata({ params }) {
  const product = await getProduct(params.id);

  if (!product) {
    return {
      title: "Product Not Found | OodlesNet",
      description: "This product could not be found on OodlesNet.",
      robots: { index: false, follow: true },
    };
  }

  const productName = String(product.name || "Product").trim();
  const title = `${productName} Price Comparison in India`;
  const sourceDescription = String(product.description || "").replace(/\s+/g, " ").trim();
  const description = (
    sourceDescription
      ? `Compare prices for ${productName}. ${sourceDescription}`
      : `Compare ${productName} prices across online stores in India and discover available deals on OodlesNet.`
  ).slice(0, 160);

  const canonical = `/product/${encodeURIComponent(params.id)}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: "website",
      title,
      description,
      url: canonical,
      images: product.imageUrl ? [{ url: product.imageUrl, alt: productName }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: product.imageUrl ? [product.imageUrl] : [],
    },
  };
}

export default function ProductPage({ params }) {
  return <ProductPageClient params={params} />;
}
