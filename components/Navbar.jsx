"use client";

import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [dark, setDark] = useState(false);

  return (
    <nav className={dark ? "navbar dark" : "navbar"}>
      <div className="logo">
        <Link href="/">OodlesNet</Link>
      </div>

      <ul className="nav-links">
        <li><Link href="/">Home</Link></li>
        <li><Link href="/products">Products</Link></li>
      </ul>

      <button className="mode-toggle" onClick={() => setDark(!dark)}>
        {dark ? "Light Mode" : "Dark Mode"}
      </button>
    </nav>
  );
      }
      
