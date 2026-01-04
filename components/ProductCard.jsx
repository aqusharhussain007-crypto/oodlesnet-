"use client";

import Link from "next/link";

export default function ProductCard({ product }) {
  const prices =
    product.store
      ?.map((s) => Number(s.price))
      .filter((p) => Number.isFinite(p)) || [];

  const sorted = [...prices].sort((a, b) => a - b);

  const lowest = sorted[0];
  const second = sorted[1];
  const third = sorted[2];

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

  return (
    <Link
      href={`/product/${product.id}`}
      onClick={saveRecent}
      style={{ textDecoration: "none" }}
    >
      <div
        style={{
          borderRadius: 18,
          padding: 14,
          background: "#ecfffb",
          border: "1px solid #6ee7d8",
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
          <div
            style={{
              width: 140,
              height: 170,
              position: "relative",
              borderRadius: 14,
              overflow: "hidden",
              background: "#f3f4f6",
              flexShrink: 0,
            }}
          >
            <img
              src={product.imageUrl || "/placeholder.png"}
              alt={product.name}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                background: "#fff",
              }}
            />
          </div>

          <div style={{ flex: 1 }}>
            {/* TITLE – CLAMPED */}
            <h3
              style={{
                color: "#0077aa",
                fontWeight: 800,
                fontSize: "1rem",
                marginBottom: 6,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {product.name}
            </h3>

            {/* DESCRIPTION – CLAMPED */}
            {product.description && (
              <div
                style={{
                  fontSize: "0.85rem",
                  color: "#555",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {product.description}
              </div>
            )}
          </div>
        </div>

        <div style={{ display: "flex", gap: 18, paddingLeft: 4 }}>
          {Number.isFinite(lowest) && (
            <div>
              <div style={{ color: "#16a34a", fontWeight: 800 }}>
                ₹{lowest.toLocaleString("en-IN")}
              </div>
              <div style={{ fontSize: 12 }}>Lowest</div>
            </div>
          )}

          {Number.isFinite(second) && (
            <div>
              <div style={{ color: "#2563eb", fontWeight: 700 }}>
                ₹{second.toLocaleString("en-IN")}
              </div>
              <div style={{ fontSize: 12 }}>2nd</div>
            </div>
          )}

          {Number.isFinite(third) && (
            <div>
              <div style={{ color: "#2563eb", fontWeight: 700 }}>
                ₹{third.toLocaleString("en-IN")}
              </div>
              <div style={{ fontSize: 12 }}>3rd</div>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
                }
                
