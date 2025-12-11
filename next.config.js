/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",   // allow ALL https image sources
      },
      {
        protocol: "http",
        hostname: "**",   // allow http images if any
      },
    ],
  },
};

module.exports = nextConfig;
