import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { DrawerProvider } from "@/components/DrawerProvider";

export const metadata = {
  metadataBase: new URL("https://oodlesnet.vercel.app"),
  title: {
    default: "OodlesNet – Compare Prices & Find Best Deals in India",
    template: "%s | OodlesNet",
  },
  description:
    "Compare prices across Amazon, Meesho, Ajio and more. Find lowest prices, trending products and best online deals on OodlesNet.",
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
        <DrawerProvider>
          <Navbar />
          <main style={{ flex: 1 }}>{children}</main>
          <Footer />
        </DrawerProvider>
      </body>
    </html>
  );
        }
        
