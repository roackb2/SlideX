/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: process.env.NEXT_DIST_DIR ?? ".next",
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  reactStrictMode: true
};

export default nextConfig;
