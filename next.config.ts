import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Empty turbopack config to allow Turbopack to run
  // CSS issues will be handled by disabling problematic features
  turbopack: {},
};

export default nextConfig;
