"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export default function ProductCard({ product, variant }) {
  const isRelated = variant === "related";

  const [open, setOpen] = useState(false);
  const boxRef = useRef(null);
  const btnRef = useRef(null);

  const prices =
    product.store
      ?.map((s) => Number(s.price))
      .filter((p) => Number.isFinite(p)) || [];

  const sorted = [...prices].sort((a, b) => a - b);
  const [lowest, second, third] = sorted;

  function saveRecent() {
    if (typeof window === "undefined") return;
    let recent = JSON.parse(localStorage.getItem("recent") || "[]");
    recent = recent.filter((p) => p.id !== product.id);
    recent.unshift({
      id: product.id,
      name: product.name,
      imageUrl: product.imageUrl,
      store: product.store || [],
    });
    if (recent.length > 10) recent = recent.slice(0, 10);
    localStorage.setItem("recent", JSON.stringify(recent));
  }

  /* OUTSIDE CLICK CLOSE */
  useEffect(() => {
    function handleOutside(e) {
      if (
        open &&
        boxRef.current &&
        !boxRef.current.contains(e.target) &&
        btnRef.current &&
        !btnRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [open]);

  /* ESC CLOSE */
  useEffect(() => {
    function handleEsc(e) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [open]);

  return (
    <div style={{ position: "relative" }}>
      <Link
        href={`/product/${product.id}`}
        onClick={saveRecent}
        style={{ textDecoration: "none" }}
      >
        <div
          style={{
            position: "relative",
            borderRadius: 18,
            padding: 14,
            background: "#ecfffb",
            border: "1px solid #6ee7d8",
            display: "flex",
            flexDirection: isRelated ? "row" : "column",
            gap: 12,
            width: isRelated ? 260 : "auto",
            minHeight: isRelated ? 150 : "auto",
          }}
        >
          {/* DETAILS BUTTON (unchanged, non-related only) */}
          {product.description && !isRelated && (
            <button
              ref={btnRef}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setOpen((v) => !v);
              }}
              style={{
                position: "absolute",
                top: 10,
                right: 10,
                zIndex: 20,
                padding: "6px 12px",
                borderRadius: 999,
                border: "none",
                fontSize: "0.75rem",
                fontWeight: 800,
                color: "#fff",
                background: "linear-gradient(135deg,#0f4c81,#10b981)",
                boxShadow: "0 6px 14px rgba(0,0,0,0.25)",
              }}
            >
              {open ? "Close" : "Details"}
            </button>
          )}

          {/* IMAGE */}
          <div
            style={{
              width: isRelated ? 125 : 140,
              height: isRelated ? 125 : 170,
              borderRadius: 14,
              overflow: "hidden",
              background: "#f3f4f6",
              flexShrink: 0,
              position: "relative",
            }}
          >
            <Image
              src={product.imageUrl || "/placeholder.png"}
              alt={product.name}
              fill
              sizes={isRelated ? "125px" : "140px"}
              loading="lazy"
              style={{ objectFit: "contain", background: "#fff" }}
            />
          </div>

          {/* CONTENT */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* NAME – 3 LINES */}
            <h3
              style={{
                color: "#0077aa",
                fontWeight: 800,
                fontSize: isRelated ? 14 : "1rem",
                lineHeight: 1.25,
                marginBottom: 6,
                display: isRelated ? "-webkit-box" : "block",
                WebkitLineClamp: isRelated ? 3 : "unset",
                WebkitBoxOrient: "vertical",
                overflow: isRelated ? "hidden" : "visible",
                minHeight: isRelated ? 54 : "auto", // reserve space for 3 lines
              }}
            >
              {product.name}
            </h3>

            {/* PUSH PRICES TO BOTTOM */}
            <div style={{ marginTop: "auto" }}>
              <div style={{ display: "flex", gap: 14 }}>
                {Number.isFinite(lowest) && (
                  <div>
                    <div
                      style={{
                        color: "#16a34a",
                        fontWeight: 800,
                        fontSize: isRelated ? 14 : "inherit",
                      }}
                    >
                      ₹{lowest.toLocaleString("en-IN")}
                    </div>
                    <div style={{ fontSize: 11 }}>Lowest</div>
                  </div>
                )}
                {Number.isFinite(second) && (
                  <div>
                    <div
                      style={{
                        color: "#2563eb",
                        fontWeight: 700,
                        fontSize: isRelated ? 13 : "inherit",
                      }}
                    >
                      ₹{second.toLocaleString("en-IN")}
                    </div>
                    <div style={{ fontSize: 11 }}>2nd</div>
                  </div>
                )}
                {Number.isFinite(third) && (
                  <div>
                    <div
                      style={{
                        color: "#2563eb",
                        fontWeight: 700,
                        fontSize: isRelated ? 13 : "inherit",
                      }}
                    >
                      ₹{third.toLocaleString("en-IN")}
                    </div>
                    <div style={{ fontSize: 11 }}>3rd</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Link>

      {/* DETAILS PANEL (unchanged, non-related only) */}
      {!isRelated && (
        <div
          ref={boxRef}
          style={{
            position: "absolute",
            top: 46,
            right: 0,
            width: "85%",
            zIndex: 30,
            background: "#fff",
            borderRadius: 16,
            padding: 14,
            boxShadow: "0 12px 30px rgba(0,0,0,0.25)",
            borderLeft: "4px solid #10b981",
            transform: open ? "translateY(0)" : "translateY(-10px)",
            opacity: open ? 1 : 0,
            pointerEvents: open ? "auto" : "none",
            transition: "all 320ms ease-out",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            style={{
              maxHeight: 180,
              overflowY: "auto",
              fontSize: "0.9rem",
              color: "#374151",
              lineHeight: 1.5,
              paddingRight: 6,
            }}
          >
            {product.description}
          </div>
        </div>
      )}
    </div>
  );
        }
