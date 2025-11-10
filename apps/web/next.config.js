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
      '/api/**/*': ['../../node_modules/.pnpm/@prisma+client@*/node_modules/.prisma/client/**/*'],
    },
  },
  // Configure webpack to handle .node files
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push({
        '@prisma/client': 'commonjs @prisma/client',
      })
    }
    return config
  },
}

module.exports = nextConfig
