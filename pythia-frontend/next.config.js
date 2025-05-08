/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  // assetPrefix: 'https://openmesh-pythia.vercel.app', // Removed for local development
  output: 'standalone',
}

module.exports = nextConfig
