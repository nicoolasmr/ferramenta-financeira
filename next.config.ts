import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Disable ESLint during production builds
    // We already have lint warnings configured as non-blocking locally
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Keep TypeScript checks enabled
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
