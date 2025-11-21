// app/layout.js
import './globals.css';

export const metadata = {
  title: 'OodlesNet 🚀',
  description: 'Compare prices across multiple stores easily!',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="app-body">
        {children}
      </body>
    </html>
  );
}
