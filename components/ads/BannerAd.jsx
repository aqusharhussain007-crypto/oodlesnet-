"use client";

import { useEffect, useRef } from "react";

export default function BannerAd({ ads }) {
  /**
   * ✅ Only treat ads as REAL if they have creative + destination
   */
  const validAds = Array.isArray(ads)
    ? ads.filter((ad) => ad.imageUrl && ad.link)
    : [];

  const hasRealAd = validAds.length > 0;

  /**
   * 🔹 Prevent duplicate impression firing
   */
  const impressionTracked = useRef(false);

  /**
   * 🔹 Track PROMISE BANNER impression
   * Fires once per mount, only if no real ad exists
   */
  useEffect(() => {
    if (!hasRealAd && !impressionTracked.current) {
      impressionTracked.current = true;

      fetch("/api/track-click", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "promise_impression",
        }),
      }).catch(() => {});
    }
  }, [hasRealAd]);

  /**
   * 🔹 PROMISE BANNER (fallback)
   */
  if (!hasRealAd) {
    return (
      <div
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
        }}
      >
        Decide when buying is worth it — not just where it’s cheaper.
      </div>
    );
  }

  /**
   * 🔹 REAL AD (first valid one)
   */
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
