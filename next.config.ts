import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: [
    "http://localhost:3000",
    "https://panda-calm-really.ngrok-free.app/",
    "*.ngrok-free.app",
  ],
  images: {
    remotePatterns: [new URL("https://*/**")],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY", // or 'SAMEORIGIN' if you want to allow same-origin iframes
          },
        ],
      },
    ];
  },
};

export default nextConfig;
