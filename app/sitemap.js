import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase-app";

export default async function sitemap() {
  const baseUrl = "https://oodlesnet.vercel.app";

  const staticRoutes = [
    {
      url: baseUrl,
      lastModified: new Date(),
    },
  ];

  const snap = await getDocs(collection(db, "products"));

  const productRoutes = snap.docs.map((doc) => ({
    url: `${baseUrl}/product/${doc.id}`,
    lastModified: new Date(),
  }));

  return [...staticRoutes, ...productRoutes];
}
