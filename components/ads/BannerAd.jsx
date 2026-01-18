"use client";

import { useEffect, useRef, useState } from "react";

export default function BannerAd({ ads }) {
  // Only treat ads as real if they have image + link
  const validAds = Array.isArray(ads)
    ? ads.filter((ad) => ad.imageUrl && ad.link)
    : [];

  const hasRealAd = validAds.length > 0;

  const impressionTracked = useRef(false);
  const [showInfo, setShowInfo] = useState(false);

  // Track promise banner impression once
  useEffect(() => {
    if (!hasRealAd && !impressionTracked.current) {
      impressionTracked.current = true;

      fetch("/api/track-click", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "promise_impression" }),
      }).catch(() => {});
    }
  }, [hasRealAd]);

  // 🔹 PROMISE BANNER
  if (!hasRealAd) {
    return (
      <div style={{ width: "100%", position: "relative" }}>
        {/* Banner */}
        <div
          onClick={() => setShowInfo(true)}
          style={{
            width: "100%",
            height: 150,
            borderRadius: 12,
            background: "#ecfeff",
            border: "1px solid #bae6fd",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            fontWeight: 700,
            fontSize: 16,
            color: "#0f4c81",
            padding: "0 16px",
            cursor: "pointer",
          }}
        >
          Decide when buying is worth it — not just where it’s cheaper.
        </div>

        {/* Tooltip */}
        {showInfo && (
          <div
            style={{
              marginTop: 8,
              padding: 16,
              borderRadius: 14,
              background: "#ffffff",
              border: "1px solid #e5e7eb",
              boxShadow: "0 12px 28px rgba(0,0,0,0.18)",
              position: "relative",
            }}
          >
            {/* Close button */}
            <button
              onClick={() => setShowInfo(false)}
              style={{
                position: "absolute",
                top: 10,
                right: 10,
                width: 28,
                height: 28,
                borderRadius: "50%",
                border: "none",
                cursor: "pointer",
                color: "#fff",
                fontWeight: 900,
                background: "linear-gradient(135deg,#0099cc,#009966)",
                boxShadow: "0 6px 14px rgba(0,0,0,0.25)",
              }}
            >
              ✕
            </button>

            <div style={{ fontWeight: 800, marginBottom: 6 }}>
              Why OodlesNet?
            </div>

            <div style={{ fontSize: 14, color: "#374151", lineHeight: 1.5 }}>
              We compare prices across stores and show confidence to help you
              decide when buying is worth it.
              <br />
              Cheaper isn’t always the right time to buy.
            </div>

            <div
              style={{
                marginTop: 8,
                fontSize: 12,
                color: "#6b7280",
              }}
            >
              You always buy directly from the store.
            </div>
          </div>
        )}
      </div>
    );
  }

  // 🔹 REAL AD
  const ad = validAds[0];

  return (
    <a
      href={ad.link}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: "block",
        width: "100%",
        height: 150,
        borderRadius: 12,
        overflow: "hidden",
      }}
    >
      <img
        src={ad.imageUrl}
        alt="Sponsored"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          display: "block",
        }}
      />
    </a>
  );
        }
            
