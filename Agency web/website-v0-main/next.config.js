/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [],
    remotePatterns: [],
  },
  // Vercel automatically handles Next.js output
  // No need for 'standalone' output mode
}

module.exports = nextConfig

