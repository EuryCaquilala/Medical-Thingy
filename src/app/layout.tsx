import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MedLab Manager — Medical Tests CRUD",
  description: "Manage Units of Measure, Test Categories, and Medical Tests with full CRUDS functionality.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        {children}
      </body>
    </html>
  );
}

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <a href="/" className="navbar-brand">
          <span className="navbar-brand-icon">🧬</span>
          MedLab Manager
        </a>
        <div className="navbar-links">
          <a href="/uom" className="navbar-link" id="nav-uom">Units of Measure</a>
          <a href="/categories" className="navbar-link" id="nav-categories">Test Categories</a>
          <a href="/medical-tests" className="navbar-link" id="nav-medical-tests">Medical Tests</a>
        </div>
      </div>
    </nav>
  );
}
