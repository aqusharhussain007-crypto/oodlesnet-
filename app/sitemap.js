import { adminDb } from "@/lib/firebase-admin";

export default async function sitemap() {
  const baseUrl = "https://oodlesnet.in"; // use your real domain

  if (!adminDb) {
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
      },
    ];
  }

  const staticRoutes = [
    {
      url: baseUrl,
      lastModified: new Date(),
    },
  ];

  const snap = await adminDb.collection("products").get();

  const productRoutes = snap.docs.map((doc) => ({
    url: `${baseUrl}/product/${doc.id}`,
    lastModified: new Date(),
  }));

  return [...staticRoutes, ...productRoutes];
}
