import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "100MB",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.pixabay.com",
      },
      {
        protocol: "https",
        hostname: "img.freepik.com",
      },
      {
        protocol: "https",
        hostname: "cloud.appwrite.io",
      },
      {
        protocol: "https",
        hostname: "hwchamber.co.uk",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/settings",
        destination: "/settings/users", // Redireciona de /settings para /settings/users
        permanent: true, // O redirecionamento é permanente (código de status 308)
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/api/processos",
        destination: "http://179.127.172.186:44001/api/processos", // Proxy para o seu endpoint
      },
    ];
  },
};

export default nextConfig;
