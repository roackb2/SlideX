/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: process.env.NEXT_DIST_DIR ?? ".next",
  async headers() {
    const oauthHeaders = [
      { key: "Cache-Control", value: "no-store, private" },
      { key: "Pragma", value: "no-cache" },
      { key: "Referrer-Policy", value: "no-referrer" },
      { key: "X-Content-Type-Options", value: "nosniff" }
    ];

    return [
      ...(process.env.NODE_ENV === "production"
        ? [{
            source: "/:path*",
            headers: [{
              key: "Strict-Transport-Security",
              value: "max-age=31536000; includeSubDomains"
            }]
          }]
        : []),
      {
        source: "/api/mcp/oauth/:path*",
        headers: oauthHeaders
      },
      {
        source: "/mcp/authorize/:path*",
        headers: [
          ...oauthHeaders,
          { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
          { key: "X-Frame-Options", value: "DENY" }
        ]
      },
      {
        source: "/mcp",
        headers: oauthHeaders
      }
    ];
  },
  skipTrailingSlashRedirect: true,
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  reactStrictMode: true
};

export default nextConfig;
