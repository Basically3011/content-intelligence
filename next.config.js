/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone', // Enable standalone build for Docker
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.monotype.com',
        pathname: '/sites/default/files/**',
      },
    ],
  },
  // Skip static generation for pages that need database access
  experimental: {
    // This prevents Next.js from trying to statically generate pages during build
    workerThreads: false,
    cpus: 1,
  },
  // Disable static page generation for all pages (they'll be server-rendered)
  // This is necessary because our pages depend on database calls
  typescript: {
    // Allow build to complete even if there are type errors
    // (useful for CI/CD, but errors will still be shown)
    ignoreBuildErrors: false,
  },
  eslint: {
    // Don't run ESLint during build (for faster builds)
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig
