/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  // assetPrefix: 'https://openmesh-pythia.vercel.app', // Removed for local development
  output: 'standalone',
}

module.exports = nextConfig
