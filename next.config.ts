import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '100MB',
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.pixabay.com',
      },
      {
        protocol: 'https',
        hostname: 'img.freepik.com',
      },
      {
        protocol: 'https',
        hostname: 'cloud.appwrite.io',
      },
      {
        protocol: 'https',
        hostname: 'hwchamber.co.uk',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/settings',
        destination: '/settings/users', // Redireciona de /settings para /settings/users
        permanent: true, // O redirecionamento é permanente (código de status 308)
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/api/processos',
        destination: 'http://172.30.20.246:4001/api/processos', // Proxy para o seu endpoint
      },
      {
        source: '/api/top-produtos',
        destination: 'http://172.30.20.246:3003/top-produtos', // Proxy para o seu endpoint de top-produtos
      },
      {
        source: '/api/li-deferidas',
        destination: 'http://172.30.20.246:4002/api/deferidas',
      },
      {
        source: '/api/buscar',
        destination: 'http://172.30.20.246:3005/buscar', // Proxy para o seu endpoint de buscar
      },
    ];
  },
};

export default nextConfig;
