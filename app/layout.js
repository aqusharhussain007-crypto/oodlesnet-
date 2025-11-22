import "./globals.css";
import Navbar from "../components/Navbar";

export const metadata = {
  title: "OodlesNet 🚀",
  description: "Compare prices across multiple stores easily!",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
  
