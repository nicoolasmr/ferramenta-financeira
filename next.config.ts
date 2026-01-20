import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable ESLint and TypeScript checks during builds
  typescript: {
    ignoreBuildErrors: true,
  },
  // Force Webpack by NOT including turbopack config
  // and using experimental flag to disable Turbopack
  experimental: {
    // @ts-ignore - this disables Turbopack
    turbo: false,
  },
};

export default nextConfig;
