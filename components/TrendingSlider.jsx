"use client";

import Image from "next/image";
import Link from "next/link";

export default function TrendingSlider({ products }) {
  if (!products || products.length === 0) return null;

  return (
    <div className="mt-6 pb-2">
      <h2 className="text-2xl font-bold text-blue-500 mb-2 px-1">
        🔥 Trending Today
      </h2>

      <div
        className="flex gap-4 overflow-x-auto no-scrollbar px-1"
        style={{ scrollSnapType: "x mandatory" }}
      >
        {products.map((p) => (
          <Link
            href={`/product/${p.id}`}
            key={p.id}
            style={{
              minWidth: "58%",        // ⭐ 2.5 cards visible
              scrollSnapAlign: "start",
            }}
          >
            <div
              style={{
                background: "linear-gradient(to bottom right, #e0f7ff, #eafff4)",
                borderRadius: "18px",
                padding: "10px",
                border: "1px solid #b5e9ff",
                boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
              }}
            >
              <Image
                src={p.imageUrl}
                width={300}
                height={200}
                alt={p.name}
                style={{
                  width: "100%",
                  height: "160px",
                  objectFit: "cover",
                  borderRadius: "14px",
                }}
              />

              <p
                style={{
                  fontSize: "1rem",
                  fontWeight: 600,
                  color: "#0088cc",
                  marginTop: "8px",
                }}
              >
                {p.name}
              </p>

              <p
                style={{
                  fontSize: "0.9rem",
                  color: "#555",
                }}
              >
                Views: {p.views}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
            }
            
