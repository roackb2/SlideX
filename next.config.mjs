/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: process.env.NEXT_DIST_DIR ?? ".next",
  async headers() {
    const oauthBaseHeaders = [
      { key: "Cache-Control", value: "no-store, private" },
      { key: "Pragma", value: "no-cache" },
      { key: "X-Content-Type-Options", value: "nosniff" }
    ];
    const oauthApiHeaders = [
      ...oauthBaseHeaders,
      { key: "Referrer-Policy", value: "no-referrer" }
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
        headers: oauthApiHeaders
      },
      {
        source: "/mcp/authorize/:path*",
        headers: [
          ...oauthBaseHeaders,
          // A no-referrer policy serializes a same-origin HTML form POST's
          // Origin header as `null`. same-origin preserves CSRF validation
          // without leaking a referrer to the loopback OAuth callback.
          { key: "Referrer-Policy", value: "same-origin" },
          { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
          { key: "X-Frame-Options", value: "DENY" }
        ]
      },
      {
        source: "/mcp",
        headers: oauthApiHeaders
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
