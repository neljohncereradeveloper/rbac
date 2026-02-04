import type { NextConfig } from "next";

const apiBackend =
  process.env.API_BACKEND_URL ?? "http://localhost:3220";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${apiBackend}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
