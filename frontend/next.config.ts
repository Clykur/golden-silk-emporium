import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  async rewrites() {
    const backendUrl = process.env.BACKEND_API_URL || "http://localhost:5001";
    return [
      {
        source: "/api/appointments",
        destination: `${backendUrl}/api/appointments`,
      },
      {
        source: "/api/payments/create",
        destination: `${backendUrl}/api/payments/create`,
      },
      {
        source: "/api/payments/verify",
        destination: `${backendUrl}/api/payments/verify`,
      },
    ];
  },
  experimental: {
    staleTimes: {
      dynamic: 60,
      static: 180,
    },
  },
};

export default nextConfig;
