import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable static exports for CDN deployment
  output: 'export',
  
  // Disable image optimization for static export
  images: {
    unoptimized: true,
  },
  
  // Ensure trailing slash is consistent
  trailingSlash: true,
  
  // Experimental features
  experimental: {
    // No extra experimental config needed for Next.js 15
  },
  
  // Configure asset paths for CDN deployment
  assetPrefix: process.env.NODE_ENV === 'production' ? process.env.ASSET_PREFIX || '' : '',
};

export default nextConfig;
