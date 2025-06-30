import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: [
    "http://localhost:3000",
    "https://panda-calm-really.ngrok-free.app/",
    "*.ngrok-free.app"
  ],
  images: {
    remotePatterns: [new URL('https://*/**')],
  },
};

export default nextConfig;
