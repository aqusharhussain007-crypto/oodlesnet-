import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata = {
  title: "OodlesNet",
  description: "Smart price comparison website",
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
