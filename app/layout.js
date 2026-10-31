import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DrawerProvider from "@/components/DrawerProvider";

export const metadata = {
  metadataBase: new URL("https://www.oodlesnet.com"),
  alternates: {
    canonical: "/",
  },
  title: {
    default: "OodlesNet – Compare Prices & Buy Smarter",
    template: "%s | OodlesNet",
  },
  description:
    "Compare product prices across Amazon, Flipkart, Meesho, Ajio and other Indian stores. Discover deals and find the right price on OodlesNet.",
  keywords: [
    "price comparison india",
    "compare prices online",
    "best deals india",
    "cheap products online",
    "oodlesnet",
  ],

  verification: {
    google: "rSQNNpBiW-oZrVrExVKSDt9QIQslHEufnnppAMTHAeI",
  },

  openGraph: {
    type: "website",
    siteName: "OodlesNet",
    url: "https://www.oodlesnet.com/",
    title: "OodlesNet – Compare Prices & Find Best Deals in India",
    description:
      "Compare prices across Amazon, Flipkart, Meesho, Ajio and more. Find competitive prices and trending deals on OodlesNet.",
    images: [
      {
        url: "/logo.png",
        width: 512,
        height: 512,
        alt: "OodlesNet Logo",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "OodlesNet – Compare Prices & Find Best Deals in India",
    description:
      "Compare prices across top Indian stores and find competitive deals.",
    images: ["/logo.png"],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          background: "#e4e9f1",
        }}
      >
        {/* ✅ Global UI State */}
        <DrawerProvider>
          <Navbar />
          <main style={{ flex: 1 }}>{children}</main>
          <Footer />
        </DrawerProvider>
      </body>
    </html>
  );
}
