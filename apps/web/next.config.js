/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    '@farcaster-scheduler/core',
    '@farcaster-scheduler/database',
    '@farcaster-scheduler/farcaster',
    '@farcaster-scheduler/types',
  ],
  // Ensure Prisma engines are included in serverless functions
  experimental: {
    outputFileTracingIncludes: {
      '/api/**/*': ['../../packages/database/node_modules/.prisma/client/**/*'],
    },
  },
}

module.exports = nextConfig
