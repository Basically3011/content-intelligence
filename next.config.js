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
}

module.exports = nextConfig
