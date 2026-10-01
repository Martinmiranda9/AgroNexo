import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: path.join(__dirname),
  experimental: {
    // phosphor-icons no está en la lista de paquetes que Next optimiza por defecto
    // (a diferencia de lucide-react): sin esto, cualquier import tira de los ~3000
    // módulos del barrel raíz del paquete en cada compile de dev.
    optimizePackageImports: ['@phosphor-icons/react'],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
