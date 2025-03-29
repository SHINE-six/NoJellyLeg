import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
      allowedOrigins: ['s7hbtvbh-3000.asse.devtunnels.ms','localhost:3000'],
    },
  },
};

export default nextConfig;