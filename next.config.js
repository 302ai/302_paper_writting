/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  typescript: {
    ignoreBuildErrors: true,
  },
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'file.302.ai',
      },
      {
        protocol: 'https',
        hostname: 'file.302ai.cn',
      },
    ],
  },
};

module.exports = nextConfig;
