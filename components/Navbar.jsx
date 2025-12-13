"use client";

import { useContext } from "react";
import Link from "next/link";
import { DrawerContext } from "@/app/layout";

export default function Navbar() {
  const {
    setOpenFilter,
    setOpenCategory,
  } = useContext(DrawerContext);

  return (
    <nav
      style={{
        backgroundColor: "#000D1A",
        padding: "4px 12px",
        height: "50px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        zIndex: 1000,
      }}
    >
      {/* Logo */}
      <Link href="/">
        <img
          src="/logo.png"
          alt="OodlesNet"
          style={{ height: "34px", cursor: "pointer" }}
        />
      </Link>

      {/* Hamburger Menu */}
      <div style={{ position: "relative" }}>
        <button
          onClick={(e) => {
            const menu = e.currentTarget.nextElementSibling;
            menu.style.display =
              menu.style.display === "flex" ? "none" : "flex";
          }}
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "10px",
            background: "#00c3ff",
            border: "none",
            boxShadow: "0 0 12px #00c3ff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            fontSize: "22px",
            color: "white",
          }}
        >
          ☰
        </button>

        {/* Dropdown */}
        <div
          style={{
            position: "absolute",
            top: "48px",
            right: 0,
            display: "none",
            flexDirection: "column",
            background: "#00172A",
            padding: "12px",
            borderRadius: "10px",
            boxShadow: "0 0 12px rgba(0,255,255,0.3)",
            minWidth: "150px",
            gap: "10px",
            zIndex: 2000,
          }}
        >
          <button
            className="nav-link"
            style={{
              color: "white",
              textAlign: "left",
            }}
            onClick={() => setOpenCategory(true)}
          >
            Categories
          </button>

          <button
            className="nav-link"
            style={{
              color: "white",
              textAlign: "left",
            }}
            onClick={() => setOpenFilter(true)}
          >
            Filters
          </button>

          <Link href="/contact" className="nav-link" style={{ color: "white" }}>
            Contact
          </Link>
        </div>
      </div>
    </nav>
  );
              }
