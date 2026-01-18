"use client";

export default function BannerAd({ ads }) {
  const hasAd = Array.isArray(ads) && ads.length > 0;

  // 🔹 PROMISE BANNER (fallback when no ads)
  if (!hasAd) {
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

  // 🔹 REAL AD
  const ad = ads[0];

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
        alt="Ad"
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
  
