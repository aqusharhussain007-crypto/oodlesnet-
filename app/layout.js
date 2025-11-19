export const metadata = {
  title: "OodlesNet – Price Comparison",
  description: "Compare prices from Amazon, Flipkart, Meesho instantly.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          fontFamily: "Arial",
          background: "#f2f2f2"
        }}
      >
        {/* Top Navigation */}
        <header
          style={{
            background: "#222",
            color: "#fff",
            padding: "15px 20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}
        >
          <h2 style={{ margin: 0 }}>OodlesNet</h2>

          <nav style={{ display: "flex", gap: "20px" }}>
            <a href="/" style={{ color: "#fff", textDecoration: "none" }}>Home</a>
            <a href="/products" style={{ color: "#fff", textDecoration: "none" }}>Products</a>
            <a href="/admin" style={{ color: "#fff", textDecoration: "none" }}>Admin</a>
          </nav>
        </header>

        <main style={{ padding: "25px" }}>
          {children}
        </main>
      </body>
    </html>
  );
          }
          
