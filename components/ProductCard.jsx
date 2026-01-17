"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

/* =====================================
   STABLE BENEFIT BULLETS (HOME DETAILS)
   ===================================== */
function renderBenefitBullets(text) {
  if (!text) return null;

  // Normalize text
  const cleaned = text
    .replace(/\s+/g, " ")
    .replace(/\n+/g, "\n")
    .trim();

  // Split ONLY on strong separators (NO hyphens)
  let parts = cleaned
    .split(/[\n•]/)
    .map((p) => p.trim())
    .filter(Boolean);

  // Merge short fragments into previous line
  const bullets = [];
  for (const part of parts) {
    if (part.length < 25 && bullets.length) {
      bullets[bullets.length - 1] += " " + part;
    } else {
      bullets.push(part);
    }
  }

  // Remove junk lines
  const filtered = bullets.filter(
    (b) =>
      b.length > 25 &&
      !/^description$/i.test(b)
  );

  if (!filtered.length) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {filtered.map((point, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            gap: 8,
            fontSize: "0.9rem",
            lineHeight: 1.45,
            color: "#374151",
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              marginTop: 7,
              borderRadius: "50%",
              background: "#10b981",
              flexShrink: 0,
            }}
          />
          <span>{point}</span>
        </div>
      ))}
    </div>
  );
}

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
            flexDirection: "column",
            gap: 12,
            width: isRelated ? 260 : "auto",
          }}
        >
          {/* DETAILS BUTTON */}
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

          {/* IMAGE + NAME */}
          <div style={{ display: "flex", gap: 12 }}>
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

            <div style={{ flex: 1, paddingTop: 28 }}>
              <h3
                style={{
                  color: "#0077aa",
                  fontWeight: 800,
                  fontSize: isRelated ? 14 : "1rem",
                  marginBottom: 6,
                  lineHeight: 1.25,
                  display: isRelated ? "-webkit-box" : "block",
                  WebkitLineClamp: isRelated ? 2 : "unset",
                  WebkitBoxOrient: "vertical",
                  overflow: isRelated ? "hidden" : "visible",
                }}
              >
                {product.name}
              </h3>
            </div>
          </div>

          {/* PRICES */}
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
      </Link>

      {/* DETAILS PANEL */}
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
              paddingRight: 6,
            }}
          >
            {renderBenefitBullets(product.description)}
          </div>
        </div>
      )}
    </div>
  );
                   }
           
