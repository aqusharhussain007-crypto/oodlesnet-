import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DrawerProvider from "@/components/DrawerProvider";

export const metadata = {
  metadataBase: new URL("https://oodlesnet.vercel.app"),

  title: {
    default: "OodlesNet – Compare Prices & Find Best Deals in India",
    template: "%s | OodlesNet",
  },

  description:
    "Compare prices across Amazon, Meesho, Ajio and more. Find lowest prices, trending products and best online deals on OodlesNet.",

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
    url: "https://oodlesnet.vercel.app",
    title: "OodlesNet – Compare Prices & Find Best Deals in India",
    description:
      "Compare prices across Amazon, Meesho, Ajio and more. Find lowest prices and trending deals on OodlesNet.",
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
      "Compare prices across top Indian stores and find the best deals.",
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
  
