// app/layout.js
import './globals.css'; // Import the CSS we just created

export const metadata = {
  title: 'OodlesNet 🚀',
  description: 'Compare prices across multiple stores easily!',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {/* Header */}
        <header style={{ padding: '1rem', backgroundColor: '#fff', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
          <h1 className="neon-glow" style={{ fontSize: '2rem', margin: 0 }}>
            OodlesNet 🚀
          </h1>
          {/* Search bar */}
          <div style={{ marginTop: '1rem' }}>
            <input
              type="text"
              placeholder="Search for products..."
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                border: '1px solid #ccc',
                fontSize: '1rem',
              }}
            />
          </div>
        </header>

        {/* Main content */}
        <main style={{ padding: '2rem 1rem', minHeight: '80vh' }}>
          {children}
        </main>

        {/* Footer */}
        <footer style={{ textAlign: 'center', padding: '1rem', backgroundColor: '#f0f0f0', color: '#666' }}>
          © 2025 OodlesNet. All rights reserved.
        </footer>
      </body>
    </html>
  );
}
