/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lojwlghvqojdygaxhxuy.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  experimental: {
    serverActions: {
      allowedOrigins: [
        "localhost:3000",
        "chautari.health",
        "*.chautari.health",
        "*.vercel.app",
      ],
    },
  },
  async headers() {
    return process.env.NODE_ENV === "production"
      ? [
          {
            source: "/(.*)",
            headers: [
              {
                key: "Strict-Transport-Security",
                value: "max-age=63072000; includeSubDomains; preload",
              },
            ],
          },
        ]
      : [];
  },
};

export default nextConfig;
