import type { NextConfig } from "next";
import pkg from './package.json';

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
};

export default nextConfig;
