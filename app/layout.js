import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata = {
  title: {
    default: "OodlesNet – Compare Prices & Find Best Deals",
    template: "%s | OodlesNet",
  },
  description:
    "OodlesNet helps you compare prices across Amazon, Flipkart, Meesho and more. Find lowest prices, trending products and best deals in India.",
  keywords: [
    "price comparison",
    "compare prices India",
    "best deals online",
    "cheap products India",
    "Amazon Flipkart price compare",
    "OodlesNet",
  ],
  authors: [{ name: "OodlesNet" }],
  creator: "OodlesNet",
  publisher: "OodlesNet",
  robots: {
    index: true,
    follow: true,
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
        <Navbar />
        <main style={{ flex: 1 }}>{children}</main>
        <Footer />
      </body>
    </html>
  );
      }
