/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
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
