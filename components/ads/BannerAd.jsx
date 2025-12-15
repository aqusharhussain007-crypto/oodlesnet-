"use client";

export default function BannerAd({ ads }) {
  if (!ads || ads.length === 0) {
    return (
      <div
        style={{
          width: "100%",
          height: 150,
          borderRadius: 12,
          background: "#e5e7eb",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 700,
        }}
      >
        No ads yet
      </div>
    );
  }

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
