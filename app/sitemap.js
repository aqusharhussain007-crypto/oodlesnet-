import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase-app";

export default async function sitemap() {
  const baseUrl = "https://www.oodlesnet.com";

  const staticRoutes = [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
    },
  ];

  const [productsSnap, categoriesSnap] = await Promise.all([
    getDocs(collection(db, "products")),
    getDocs(collection(db, "categories")),
  ]);

  const productRoutes = productsSnap.docs.map((doc) => ({
    url: `${baseUrl}/product/${doc.id}`,
    lastModified: new Date(),
  }));

  const categoryRoutes = categoriesSnap.docs
    .map((doc) => {
      const data = doc.data();
      const slug = data.slug || doc.id;

      return slug
        ? {
            url: `${baseUrl}/category/${slug}`,
            lastModified: new Date(),
          }
        : null;
    })
    .filter(Boolean);

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}
