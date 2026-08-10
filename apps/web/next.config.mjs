/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@atlas/shared'],
  // Phase 1: `/api/*` on the web app proxies to the NestJS API on :4100.
  // In later phases this moves to a proper gateway/ingress.
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://127.0.0.1:4100/api/:path*',
      },
    ];
  },
};

export default nextConfig;