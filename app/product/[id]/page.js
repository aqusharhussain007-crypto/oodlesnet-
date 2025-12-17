import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase-app";
import ProductClient from "./product-client";

/* ---------------- SEO: SERVER SIDE ---------------- */
export async function generateMetadata({ params }) {
  const { id } = params;

  try {
    const ref = doc(db, "products", id);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      return {
        title: "Product not found | OodlesNet",
        description: "This product does not exist on OodlesNet.",
      };
    }

    const product = snap.data();
    const prices =
      product.store?.map((s) => Number(s.price)) || [];
    const lowest = Math.min(...prices);

    return {
      title: `${product.name} Price Comparison in India`,
      description: `Compare ${product.name} prices across Amazon, Meesho, Ajio and more. Lowest price ₹${lowest.toLocaleString(
        "en-IN"
      )}.`,
      openGraph: {
        title: `${product.name} – Compare Prices`,
        description: `Find the best price for ${product.name} online.`,
        images: [
          {
            url: product.imageUrl,
            width: 800,
            height: 600,
            alt: product.name,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: `${product.name} – Best Price`,
        description: `Compare prices for ${product.name} across stores.`,
        images: [product.imageUrl],
      },
    };
  } catch {
    return {
      title: "Product | OodlesNet",
    };
  }
}

/* ---------------- PAGE ENTRY ---------------- */
export default function ProductPage({ params }) {
  return <ProductClient params={params} />;
}
