import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable ESLint completely during builds
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Disable TypeScript type checking during builds
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
