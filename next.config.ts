import type { NextConfig } from "next";
import pkg from './package.json';

// Origem real do backend (ALB), usada apenas no servidor: server-to-server não tem
// restrição de mixed content, então não precisa de HTTPS aqui.
const BACKEND_ORIGIN = process.env.BACKEND_ORIGIN ?? 'http://ticketon-alb-prod-43005408.us-east-1.elb.amazonaws.com';

const nextConfig: NextConfig & { eslint?: { ignoreDuringBuilds?: boolean } } = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  env: {
    NEXT_PUBLIC_APP_VERSION: pkg.version,
  },
  async rewrites() {
    // O navegador chama /api/* (mesma origem, HTTPS) e a Vercel repassa pro
    // ALB por baixo dos panos — evita bloqueio de mixed content e CORS.
    return [
      {
        source: '/api/:path*',
        destination: `${BACKEND_ORIGIN}/:path*`,
      },
    ];
  },
};

export default nextConfig;
