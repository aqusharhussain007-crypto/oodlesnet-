import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { createContext, useState } from "react";

export const DrawerContext = createContext();

export const metadata = {
  title: "OodlesNet",
  description: "Smart price comparison website",
};

export default function RootLayout({ children }) {
  const [openFilter, setOpenFilter] = useState(false);
  const [openCategory, setOpenCategory] = useState(false);

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
        {/* Provide drawer state globally */}
        <DrawerContext.Provider
          value={{
            openFilter,
            setOpenFilter,
            openCategory,
            setOpenCategory,
          }}
        >
          <Navbar />

          <main style={{ flex: 1 }}>{children}</main>

          <Footer />
        </DrawerContext.Provider>
      </body>
    </html>
  );
          }
            
