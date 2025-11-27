import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: 'standalone', // Active le mode standalone pour Docker
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/api/uploads/**',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '3000',
        pathname: '/api/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'heros-faith.matheovieilleville.fr',
        pathname: '/api/uploads/**',
      },
      {
        protocol: 'http',
        hostname: 'heros-faith.matheovieilleville.fr',
        pathname: '/api/uploads/**',
      },
    ],
  },
};

export default nextConfig;
