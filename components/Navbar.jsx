"use client";

import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header
      style={{
        padding: "12px 20px",
        background: "#0a0f1f",
        boxShadow: "0 0 18px rgba(0, 200, 255, 0.25)",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >
      <nav
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {/* BRAND */}
        <Link href="/" className="font-bold text-xl neon-text">
          OodlesNet
        </Link>

        {/* Hamburger (Mobile) */}
        <button
          className="md:hidden text-white text-2xl"
          onClick={() => setMenuOpen(!menuOpen)}
          style={{ background: "transparent", border: "none" }}
        >
          ☰
        </button>

        {/* NAV LINKS */}
        <ul
          className={`${
            menuOpen ? "flex" : "hidden"
          } md:flex flex-col md:flex-row gap-3 md:gap-4 text-white text-sm md:text-base mt-3 md:mt-0`}
          style={{
            alignItems: "center",
          }}
        >
          {[
            { name: "Home", link: "/" },
            { name: "Products", link: "/products" },
            { name: "About", link: "/about" },
            { name: "Contact", link: "/contact" },
          ].map((item) => (
            <li key={item.link}>
              <Link
                href={item.link}
                className="menu-link"
                style={{
                  padding: "6px 12px",
                  borderRadius: "6px",
                  transition: "0.2s",
                }}
              >
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Neon Effect Styles */}
      <style jsx>{`
        .neon-text {
          color: #0bbcff;
          text-shadow: 0 0 8px rgba(11, 188, 255, 0.6);
        }

        .menu-link:hover {
          background: rgba(11, 188, 255, 0.12);
          box-shadow: 0 0 10px rgba(11, 188, 255, 0.4);
          color: #0bbcff;
        }
      `}</style>
    </header>
  );
              }
              
