export const metadata = {
  title: "OodlesNet",
  description: "Compare products from Amazon, Flipkart, Meesho & more",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "Arial" }}>
        <header
          style={{
            backgroundColor: "#1e40af",
            color: "#fff",
            padding: "15px 30px",
            fontSize: "24px",
          }}
        >
          OodlesNet
        </header>
        <main>{children}</main>
        <footer
          style={{
            backgroundColor: "#1e40af",
            color: "#fff",
            textAlign: "center",
            padding: "10px",
            marginTop: "30px",
          }}
        >
          &copy; {new Date().getFullYear()} OodlesNet. All rights reserved.
        </footer>
      </body>
    </html>
  );
    }
  
