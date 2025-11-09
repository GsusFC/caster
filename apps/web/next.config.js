/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    '@farcaster-scheduler/core',
    '@farcaster-scheduler/database',
    '@farcaster-scheduler/farcaster',
    '@farcaster-scheduler/types',
  ],
}

module.exports = nextConfig
