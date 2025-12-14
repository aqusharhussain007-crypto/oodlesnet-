export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: "https://oodlesnet.vercel.app/sitemap.xml",
  };
}
