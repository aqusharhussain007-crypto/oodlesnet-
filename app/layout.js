// app/layout.js
import './globals.css'; // Import the CSS we just created

export const metadata = {
  title: 'OodlesNet 🚀',
  description: 'Compare prices across multiple stores easily!',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head />
      <body>
        {children} {/* This renders all your page content */}
      </body>
    </html>
  );
}
