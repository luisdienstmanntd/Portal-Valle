import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Keep verification builds separate from the preview currently served to the owner.
  distDir: process.env.PORTAL_NEXT_DIST_DIR || ".next",
};

export default nextConfig;
